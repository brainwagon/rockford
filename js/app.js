import {getAbsoluteBoundingRect} from './layout.js';
import {injectGoogleFonts, applyFontPair} from './fonts.js';
import {formatPhoneNumber} from './phone-utils.js';
import {parseFormat} from './format-parser.js';
import {renderCard} from './format-renderer.js';

/**
 * Minimal inline format used for synchronous initial render before any
 * async format file is loaded. Ensures card elements always exist in DOM,
 * including a Logo item so logo can be restored from localStorage immediately.
 */
const FALLBACK_FORMAT_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Fallback"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "minimal"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"

## Segment: Identity
- **Height**: "55%"
- **Columns**: "1"
- **Padding**: "20px 20px 0px 20px"

### Column 1
- **Width**: "100%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "18pt"
    - **Style**: "bold"
  - **Field**: Title
    - **Size**: "11pt"
  - **Field**: Company
    - **Size**: "10pt"

## Segment: Contact
- **Height**: "45%"
- **Columns**: "2"
- **Padding**: "0px 20px 20px 20px"

### Column 1
- **Width**: "70%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Email
    - **Size**: "9pt"
  - **Field**: Phone
    - **Size**: "9pt"
  - **Field**: Website
    - **Size**: "9pt"

### Column 2
- **Width**: "30%"
- **Alignment**: "right"
- **Items**:
  - **VPad**:
  - **Logo**:
    - **Size**: "40px"
`;
const FALLBACK_FORMAT = parseFormat(FALLBACK_FORMAT_MD);

/**
 * Initializes the Rockford application.
 */
export async function initApp() {
  const btnLandscape = document.getElementById('btn-landscape');
  const btnPortrait = document.getElementById('btn-portrait');
  const btnAbout = document.getElementById('btn-about');
  const aboutDialog = document.getElementById('about-dialog');
  const btnCloseAbout = document.getElementById('btn-close-about');
  const businessCard = document.getElementById('business-card');

  // Handle "About" dialog
  if (btnAbout && aboutDialog) {
    btnAbout.addEventListener('click', () => {
      aboutDialog.showModal();
    });
  }

  if (btnCloseAbout && aboutDialog) {
    btnCloseAbout.addEventListener('click', () => {
      aboutDialog.close();
    });
  }

  const formatSelect = document.getElementById('format-select');
  const fontSelect = document.getElementById('font-select');
  const inputWebsite = document.getElementById('input-website');
  const inputLogo = document.getElementById('input-logo');
  const btnLogoUpload = document.getElementById('btn-logo-upload');
  const btnLogoRemove = document.getElementById('btn-logo-remove');
  const logoPreviewArea = document.getElementById('logo-preview-area');
  const logoPreviewImg = document.getElementById('logo-preview-img');
  const logoPreviewPlaceholder =
      document.getElementById('logo-preview-placeholder');

  /** Currently active parsed format object. */
  let currentFormat = null;
  let currentFormatFile = null;
  let currentFormatText = null;
  let currentFormatModified = null;
  let formatWatcherInterval = null;
  let layoutTimeout;
  let saveTimeout;

  /** Logo image data URL; populated on upload and restored from localStorage. */
  let currentLogoSrc = '';

  /**
   * Returns the current card data from form inputs.
   * @returns {Object}
   */
  const collectData = () => ({
    Name: document.getElementById('input-name')?.value || '',
    Title: document.getElementById('input-title')?.value || '',
    Company: document.getElementById('input-company')?.value || '',
    Email: document.getElementById('input-email')?.value || '',
    Phone: document.getElementById('input-phone')?.value || '',
    Website: document.getElementById('input-website')?.value || '',
    Logo: currentLogoSrc,
  });

  /**
   * Regenerates the QR code image from the current website value.
   * Shows or hides #card-qr-display based on whether a URL is present.
   */
  function updateQRCode() {
    const qrEl = document.getElementById('card-qr-display');
    if (!qrEl) return;
    const website = document.getElementById('input-website')?.value || '';
    if (!website) {
      qrEl.style.display = 'none';
      return;
    }
    qrEl.style.display = '';
    if (typeof qrcode !== 'undefined') {
      const qr = qrcode(0, 'M');
      qr.addData(website);
      qr.make();
      qrEl.innerHTML = qr.createImgTag(4);
    }
  }

  /**
   * Syncs the logo preview area to match the current logo state and format.
   * Reads the logo size from the current format's Logo item, if present.
   */
  const updateLogoPreview = () => {
    if (!logoPreviewArea) return;
    const logoItem = currentFormat?.items?.find((i) => i.field === 'Logo');
    const size = logoItem?.size || '60px';
    logoPreviewArea.style.width = size;
    logoPreviewArea.style.height = size;
    if (currentLogoSrc) {
      if (logoPreviewImg) {
        logoPreviewImg.src = currentLogoSrc;
        logoPreviewImg.hidden = false;
      }
      if (logoPreviewPlaceholder) logoPreviewPlaceholder.hidden = true;
      if (btnLogoRemove) btnLogoRemove.hidden = false;
    } else {
      if (logoPreviewImg) {
        logoPreviewImg.src = '';
        logoPreviewImg.hidden = true;
      }
      if (logoPreviewPlaceholder) logoPreviewPlaceholder.hidden = false;
      if (btnLogoRemove) btnLogoRemove.hidden = true;
    }
  };

  /**
   * Wrapper for renderCard that also updates the QR code and logo preview.
   */
  const renderApp = (format, data) => {
    if (businessCard && format) {
      renderCard(businessCard, format, data, () => {
        updateQRCode();
        updateLogoPreview();
      });
    }
  };

  // Synchronous initial render: ensures card field elements exist in DOM
  // immediately, so event-driven tests don't need to await initApp().
  if (businessCard) {
    currentFormat = FALLBACK_FORMAT;
    renderApp(FALLBACK_FORMAT, {});
  }

  // ------------------------------------------------------------------
  // Layout engine
  // ------------------------------------------------------------------

  /**
   * Triggers the layout engine to recalculate element scaling and positions.
   * @param {boolean} [immediate=false]
   */
  const runLayoutEngine = (immediate = false) => {
    const performLayout = () => {
      if (!businessCard) return;

      const cardRect = getAbsoluteBoundingRect(businessCard);
      // Skip layout in zero-dimension environments (e.g. JSDOM in tests).
      if (cardRect.width === 0) return;

      const nameEl = document.getElementById('card-name-display');
      const titleEl = document.getElementById('card-title-display');
      const companyEl = document.getElementById('card-company-display');

      if (!nameEl || !titleEl || !companyEl) return;

      if (!document.getElementById('input-company')?.value) {
        companyEl.style.display = 'none';
      } else {
        companyEl.style.display = 'inline-block';
      }
    };

    clearTimeout(layoutTimeout);
    if (immediate) {
      performLayout();
    } else {
      layoutTimeout = setTimeout(performLayout, 50);
    }
  };

  // ------------------------------------------------------------------
  // Font loading
  // ------------------------------------------------------------------

  /**
   * @param {string} pairId
   */
  const loadAndApplyFont = async (pairId) => {
    const cardContainer = document.getElementById('card-container');
    if (cardContainer && pairId !== 'default') {
      cardContainer.classList.add('fonts-loading');
    }
    try {
      await injectGoogleFonts(pairId);
    } catch (err) {
      console.warn('Font loading failed:', err);
    } finally {
      if (cardContainer) cardContainer.classList.remove('fonts-loading');
    }
    applyFontPair(pairId);
    runLayoutEngine(true);
  };

  // ------------------------------------------------------------------
  // Format loading and rendering
  // ------------------------------------------------------------------

  /**
   * Fetches formats/index.json and populates the format selector.
   */
  const loadFormats = async () => {
    try {
      const res = await fetch('./formats/index.json');
      const formats = await res.json();
      if (!formatSelect) return;
      formatSelect.innerHTML = '';
      for (const entry of formats) {
        const opt = document.createElement('option');
        opt.value = entry.file;
        opt.textContent = entry.name;
        formatSelect.appendChild(opt);
      }
    } catch (err) {
      console.warn('Could not load formats manifest:', err);
    }
  };

  /**
   * Fetches, parses, and renders a format file, then applies its font pair.
   * @param {string} filename - e.g. "minimal.md"
   */
  const loadFormatFile = async (filename) => {
    try {
      const res = await fetch(`./formats/${filename}`);
      const text = await res.text();
      currentFormatFile = filename;
      currentFormatText = text;
      currentFormatModified = res.headers.get('Last-Modified');
      currentFormat = parseFormat(text);
      renderApp(currentFormat, collectData());
      
      const selectedFont = fontSelect?.value || 'default';
      if (selectedFont !== 'default') {
        await loadAndApplyFont(selectedFont);
      } else {
        await loadAndApplyFont(currentFormat.metadata.fontPair);
      }
      
      runLayoutEngine(true);
      startFormatWatcher(filename);
    } catch (err) {
      console.warn(`Could not load format file "${filename}":`, err);
    }
  };

  /**
   * Polls the current format file every 2 seconds. Uses a HEAD request to
   * check Last-Modified; only fetches the full file and re-renders when the
   * modification time has changed. Falls back to content comparison when the
   * server does not provide a Last-Modified header.
   * @param {string} filename
   */
  const startFormatWatcher = (filename) => {
    if (formatWatcherInterval) clearInterval(formatWatcherInterval);
    formatWatcherInterval = setInterval(async () => {
      if (currentFormatFile !== filename) return;
      try {
        const headRes = await fetch(
            `./formats/${filename}`, {method: 'HEAD', cache: 'no-store'});
        const modified = headRes.headers.get('Last-Modified');

        console.log(`[watcher] "${filename}" — Last-Modified: ${modified}` +
            ` (stored: ${currentFormatModified})`);

        // If the server provides Last-Modified and it hasn't changed, skip.
        if (modified !== null && modified === currentFormatModified) return;

        const res = await fetch(`./formats/${filename}`, {cache: 'no-store'});
        const text = await res.text();
        const newModified = res.headers.get('Last-Modified');

        // When no Last-Modified is available, fall back to content comparison.
        if (modified === null && text === currentFormatText) return;

        console.log(`[watcher] "${filename}" modified — reloading format.`);
        currentFormatText = text;
        currentFormatModified = newModified ?? modified;
        currentFormat = parseFormat(text);
        renderApp(currentFormat, collectData());
        runLayoutEngine(true);
      } catch (err) {
        console.warn(`Format watcher error for "${filename}":`, err);
      }
    }, 2000);
  };

  // ------------------------------------------------------------------
  // Persistence
  // ------------------------------------------------------------------

  /**
   * Saves the current application state to localStorage.
   * @param {boolean} [immediate=false]
   */
  const saveToLocalStorage = (immediate = false) => {
    const performSave = () => {
      runLayoutEngine(true);
      const state = {
        name: document.getElementById('input-name')?.value,
        title: document.getElementById('input-title')?.value,
        company: document.getElementById('input-company')?.value,
        email: document.getElementById('input-email')?.value,
        phone: document.getElementById('input-phone')?.value,
        website: document.getElementById('input-website')?.value,
        formatFile: formatSelect?.value,
        fontPairId: fontSelect?.value,
        orientation: businessCard?.classList.contains('landscape') ?
            'landscape' : 'portrait',
        logo: currentLogoSrc || undefined,
      };
      localStorage.setItem('rockford_state', JSON.stringify(state));
    };

    clearTimeout(saveTimeout);
    if (immediate) {
      performSave();
    } else {
      saveTimeout = setTimeout(performSave, 500);
    }
  };

  // ------------------------------------------------------------------
  // Orientation logic
  // ------------------------------------------------------------------

  if (btnLandscape && btnPortrait && businessCard) {
    btnLandscape.addEventListener('click', () => {
      businessCard.classList.remove('portrait');
      businessCard.classList.add('landscape');
      btnLandscape.classList.add('active');
      btnPortrait.classList.remove('active');
      runLayoutEngine(true);
      saveToLocalStorage();
    });

    btnPortrait.addEventListener('click', () => {
      businessCard.classList.remove('landscape');
      businessCard.classList.add('portrait');
      btnPortrait.classList.add('active');
      btnLandscape.classList.remove('active');
      runLayoutEngine(true);
      saveToLocalStorage();
    });
  }

  // ------------------------------------------------------------------
  // Format selector
  // ------------------------------------------------------------------

  if (formatSelect) {
    formatSelect.addEventListener('change', async (e) => {
      await loadFormatFile(e.target.value);
      saveToLocalStorage();
    });
  }

  // ------------------------------------------------------------------
  // Font selector
  // ------------------------------------------------------------------

  if (fontSelect && businessCard) {
    fontSelect.addEventListener('change', async (e) => {
      await loadAndApplyFont(e.target.value);
      saveToLocalStorage();
    });
  }

  // ------------------------------------------------------------------
  // Text inputs
  // ------------------------------------------------------------------

  const inputs = [
    {id: 'input-name', displayId: 'card-name-display'},
    {id: 'input-title', displayId: 'card-title-display'},
    {id: 'input-company', displayId: 'card-company-display'},
    {id: 'input-email', displayId: 'card-email-display'},
    {id: 'input-phone', displayId: 'card-phone-display'},
    {id: 'input-website', displayId: 'card-website-display'},
  ];

  inputs.forEach((inputPair) => {
    const inputEl = document.getElementById(inputPair.id);
    const getDisplayEl = () => document.getElementById(inputPair.displayId);

    if (inputEl) {
      inputEl.addEventListener('input', () => {
        if (inputPair.id === 'input-phone') {
          inputEl.value = formatPhoneNumber(inputEl.value);
        }
        const displayEl = getDisplayEl();
        if (displayEl) {
          displayEl.textContent = inputEl.value;
          if (inputEl.value) {
            displayEl.style.display = '';
          } else {
            displayEl.style.display = 'none';
          }
        }
        runLayoutEngine();
        saveToLocalStorage();
      });
    }
  });

  // ------------------------------------------------------------------
  // Logo upload
  // ------------------------------------------------------------------

  if (btnLogoUpload) {
    btnLogoUpload.addEventListener('click', () => inputLogo?.click());
  }

  if (btnLogoRemove) {
    btnLogoRemove.addEventListener('click', () => {
      currentLogoSrc = '';
      if (inputLogo) inputLogo.value = '';
      updateLogoPreview();
      if (businessCard && currentFormat) {
        renderApp(currentFormat, collectData());
      }
      runLayoutEngine(true);
      saveToLocalStorage(true);
    });
  }

  if (inputLogo) {
    inputLogo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          currentLogoSrc = event.target.result;
          updateLogoPreview();
          if (businessCard && currentFormat) {
            renderApp(currentFormat, collectData());
          }
          runLayoutEngine(true);
          saveToLocalStorage(true);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ------------------------------------------------------------------
  // QR code
  // ------------------------------------------------------------------

  if (inputWebsite) {
    inputWebsite.addEventListener('input', () => {
      updateQRCode();
      runLayoutEngine();
    });
  }

  // ------------------------------------------------------------------
  // Export
  // ------------------------------------------------------------------

  const btnExportPng = document.getElementById('btn-export-png');
  const btnExportPdf = document.getElementById('btn-export-pdf');

  if (btnExportPng) {
    btnExportPng.addEventListener('click', () => {
      if (typeof html2canvas === 'undefined') return;
      html2canvas(businessCard, {
        scale: 3,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.getElementById('business-card');
          if (clonedCard) {
            clonedCard.style.transform = 'none';
            clonedCard.style.boxShadow = 'none';
          }
        },
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `business-card-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    });
  }

  if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
      if (typeof html2canvas === 'undefined' ||
          typeof window.jspdf === 'undefined') return;
      html2canvas(businessCard, {
        scale: 3,
        onclone: (clonedDoc) => {
          const clonedCard = clonedDoc.getElementById('business-card');
          if (clonedCard) {
            clonedCard.style.transform = 'none';
            clonedCard.style.boxShadow = 'none';
          }
        },
      }).then((canvas) => {
        const {jsPDF} = window.jspdf;
        const isLandscape = businessCard.classList.contains('landscape');
        const doc = new jsPDF({
          orientation: isLandscape ? 'l' : 'p',
          unit: 'in',
          format: isLandscape ? [3.5, 2] : [2, 3.5],
        });
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0,
            isLandscape ? 3.5 : 2, isLandscape ? 2 : 3.5);
        doc.save(`business-card-${Date.now()}.pdf`);
      });
    });
  }

  const btnPrint = document.getElementById('btn-print');
  const printSheet = document.getElementById('print-sheet');

  if (btnPrint && printSheet) {
    btnPrint.addEventListener('click', () => {
      printSheet.innerHTML = '';
      for (let i = 0; i < 10; i++) {
        const clone = businessCard.cloneNode(true);
        clone.id = `print-card-${i}`;
        clone.classList.add('print-card-clone');
        printSheet.appendChild(clone);
      }
      window.print();
      window.addEventListener(
          'afterprint', () => { printSheet.innerHTML = ''; }, {once: true});
    });
  }

  // ------------------------------------------------------------------
  // Load saved state
  // ------------------------------------------------------------------

  /**
   * Restores text field values and UI state from localStorage.
   * Format loading is handled separately via loadFormatFile().
   * @param {Object} state
   */
  const restoreDataValues = (state) => {
    if (state.name) document.getElementById('input-name').value = state.name;
    if (state.title) document.getElementById('input-title').value = state.title;
    if (state.company) document.getElementById('input-company').value = state.company;
    if (state.email) document.getElementById('input-email').value = state.email;
    if (state.phone) {
      document.getElementById('input-phone').value = formatPhoneNumber(state.phone);
    }
    if (state.website) document.getElementById('input-website').value = state.website;

    // Sync display elements with restored input values
    inputs.forEach((inputPair) => {
      const inputEl = document.getElementById(inputPair.id);
      const displayEl = document.getElementById(inputPair.displayId);
      if (inputEl && displayEl) {
        displayEl.textContent = inputEl.value;
        displayEl.style.display = inputEl.value ? '' : 'none';
      }
    });

    if (state.fontPairId) {
      fontSelect.value = state.fontPairId;
    }

    // Re-apply saved orientation, overriding whatever the format file specifies.
    if (state.orientation === 'portrait') {
      businessCard.classList.remove('landscape');
      businessCard.classList.add('portrait');
      btnPortrait?.classList.add('active');
      btnLandscape?.classList.remove('active');
    } else {
      businessCard.classList.remove('portrait');
      businessCard.classList.add('landscape');
      btnLandscape?.classList.add('active');
      btnPortrait?.classList.remove('active');
    }
  };

  // ------------------------------------------------------------------
  // Startup sequence
  // ------------------------------------------------------------------

  // 1. Read saved state synchronously so we can restore simple DOM state
  //    (orientation, logo, QR) before async format loading begins.
  let savedState = null;
  try {
    const raw = localStorage.getItem('rockford_state');
    if (raw) savedState = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  // 2. Restore synchronous state immediately (no async needed).
  //    currentLogoSrc must be set before the initial render so the logo
  //    appears in the FALLBACK_FORMAT's Logo item synchronously.
  if (savedState) {
    if (savedState.orientation === 'portrait') {
      businessCard?.classList.remove('landscape');
      businessCard?.classList.add('portrait');
      btnPortrait?.classList.add('active');
      btnLandscape?.classList.remove('active');
    }
    if (savedState.logo) {
      currentLogoSrc = savedState.logo;
    }
  }

  // Re-render the fallback format now that currentLogoSrc is set.
  if (businessCard) {
    renderApp(FALLBACK_FORMAT, collectData());
  }

  // 3. Populate format selector from manifest (async)
  await loadFormats();

  let initialFile = formatSelect?.options[0]?.value || 'minimal.md';
  if (savedState) {
    if (savedState.formatFile) {
      initialFile = savedState.formatFile;
    } else if (savedState.template) {
      // Backward compatibility: map old template name to format file
      initialFile = `${savedState.template}.md`;
    }
  }

  // Sync the selector to the initial file
  if (formatSelect) {
    const matchingOption = Array.from(formatSelect.options)
        .find((opt) => opt.value === initialFile);
    if (matchingOption) formatSelect.value = initialFile;
  }

  // 4. Load and render the initial format (async)
  await loadFormatFile(initialFile);

  // 5. Restore text field values and font (requires format to be rendered first)
  if (savedState) {
    restoreDataValues(savedState);
    if (savedState.fontPairId) {
      await loadAndApplyFont(savedState.fontPairId);
    }
  }

  setTimeout(() => runLayoutEngine(true), 100);
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  document.addEventListener('DOMContentLoaded', initApp);
}
