import {
  getAbsoluteBoundingRect,
  autoScaleElement,
  resetElementScaling,
} from './layout.js';
import {injectGoogleFonts, applyFontPair} from './fonts.js';
import {formatPhoneNumber} from './phone-utils.js';
import {parseFormat} from './format-parser.js';
import {renderCard} from './format-renderer.js';

/**
 * Minimal inline format used for synchronous initial render before any
 * async format file is loaded. Ensures card elements always exist in DOM.
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
- **QRCode**: "false"

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
- **Columns**: "1"
- **Padding**: "0px 20px 20px 20px"

### Column 1
- **Width**: "100%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Email
    - **Size**: "9pt"
  - **Field**: Phone
    - **Size**: "9pt"
  - **Field**: Website
    - **Size**: "9pt"
`;
const FALLBACK_FORMAT = parseFormat(FALLBACK_FORMAT_MD);

/**
 * Initializes the business card generator application.
 */
export async function initApp() {
  const btnLandscape = document.getElementById('btn-landscape');
  const btnPortrait = document.getElementById('btn-portrait');
  const businessCard = document.getElementById('business-card');
  const formatSelect = document.getElementById('format-select');
  const fontSelect = document.getElementById('font-select');
  const inputQrToggle = document.getElementById('input-qr-toggle');
  const cardQrDisplay = document.getElementById('card-qr-display');
  const inputWebsite = document.getElementById('input-website');
  const inputLogo = document.getElementById('input-logo');
  const cardLogoDisplay = document.getElementById('card-logo-display');

  /** Currently active parsed format object. */
  let currentFormat = null;
  let layoutTimeout;
  let saveTimeout;

  // Synchronous initial render: ensures card field elements exist in DOM
  // immediately, so event-driven tests don't need to await initApp().
  if (businessCard) {
    currentFormat = FALLBACK_FORMAT;
    renderCard(businessCard, FALLBACK_FORMAT, {});
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

      const logoImg = cardLogoDisplay?.querySelector('img');
      const logoRect = logoImg ? getAbsoluteBoundingRect(cardLogoDisplay) : null;

      const qrRect = (cardQrDisplay &&
          cardQrDisplay.classList.contains('active')) ?
          getAbsoluteBoundingRect(cardQrDisplay) : null;

      const nameEl = document.getElementById('card-name-display');
      const titleEl = document.getElementById('card-title-display');
      const companyEl = document.getElementById('card-company-display');

      if (!nameEl || !titleEl || !companyEl) return;

      resetElementScaling(nameEl);
      resetElementScaling(titleEl);
      resetElementScaling(companyEl);

      const avoidRects = [];
      if (logoRect) avoidRects.push(logoRect);
      if (qrRect) avoidRects.push(qrRect);

      if (!document.getElementById('input-company')?.value) {
        companyEl.style.display = 'none';
      } else {
        companyEl.style.display = 'inline-block';
      }

      autoScaleElement(nameEl, cardRect, avoidRects, false);
      autoScaleElement(titleEl, cardRect, avoidRects, false);
      if (companyEl.style.display !== 'none') {
        autoScaleElement(companyEl, cardRect, avoidRects, false);
      }

      // Final vertical fit pass
      const cardContent = document.querySelector('.card-content');
      let safetyCounter = 0;

      const checkVerticalOverflow = () => {
        const contentRect = getAbsoluteBoundingRect(cardContent);
        return contentRect.height > cardRect.height + 1;
      };

      while (checkVerticalOverflow() && safetyCounter < 50) {
        const nameFontSize = parseFloat(window.getComputedStyle(nameEl).fontSize);
        const titleFontSize = parseFloat(window.getComputedStyle(titleEl).fontSize);
        const companyFontSize = parseFloat(window.getComputedStyle(companyEl).fontSize);

        if (nameFontSize > 8) nameEl.style.fontSize = `${nameFontSize - 0.5}px`;
        if (titleFontSize > 8) titleEl.style.fontSize = `${titleFontSize - 0.5}px`;
        if (companyFontSize > 8) companyEl.style.fontSize = `${companyFontSize - 0.5}px`;

        if (nameFontSize <= 8 && titleFontSize <= 8 && companyFontSize <= 8) break;
        safetyCounter++;
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
  // Data collection
  // ------------------------------------------------------------------

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
    Logo: cardLogoDisplay?.querySelector('img')?.src || '',
  });

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
      currentFormat = parseFormat(text);
      renderCard(businessCard, currentFormat, collectData());
      await loadAndApplyFont(currentFormat.metadata.fontPair);
      runLayoutEngine(true);
    } catch (err) {
      console.warn(`Could not load format file "${filename}":`, err);
    }
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
        qrEnabled: inputQrToggle?.checked,
        logo: cardLogoDisplay?.querySelector('img')?.src,
      };
      localStorage.setItem('bmaker_state', JSON.stringify(state));
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

  if (inputLogo && cardLogoDisplay) {
    inputLogo.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          cardLogoDisplay.innerHTML = `<img src="${event.target.result}" alt="Logo">`;
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

  /**
   * Regenerates the QR code image from the current website value.
   */
  function updateQRCode() {
    const website = inputWebsite.value || 'https://example.com';
    if (typeof qrcode !== 'undefined') {
      const qr = qrcode(0, 'M');
      qr.addData(website);
      qr.make();
      cardQrDisplay.innerHTML = qr.createImgTag(4);
    }
  }

  if (inputQrToggle && cardQrDisplay) {
    inputQrToggle.addEventListener('change', () => {
      if (inputQrToggle.checked) {
        cardQrDisplay.classList.add('active');
        updateQRCode();
      } else {
        cardQrDisplay.classList.remove('active');
      }
      runLayoutEngine(true);
      saveToLocalStorage();
    });
  }

  if (inputWebsite) {
    inputWebsite.addEventListener('input', () => {
      if (inputQrToggle.checked) {
        updateQRCode();
        runLayoutEngine();
      }
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
      html2canvas(businessCard, {scale: 3}).then((canvas) => {
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
      html2canvas(businessCard, {scale: 3}).then((canvas) => {
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
        if (!inputEl.value) displayEl.style.display = 'none';
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
    const raw = localStorage.getItem('bmaker_state');
    if (raw) savedState = JSON.parse(raw);
  } catch (e) { /* ignore */ }

  // 2. Restore synchronous DOM state immediately (no async needed).
  //    These tests check these values right after initApp() returns.
  if (savedState) {
    if (savedState.orientation === 'portrait') {
      businessCard?.classList.remove('landscape');
      businessCard?.classList.add('portrait');
      btnPortrait?.classList.add('active');
      btnLandscape?.classList.remove('active');
    }
    if (savedState.logo && cardLogoDisplay) {
      cardLogoDisplay.innerHTML = `<img src="${savedState.logo}" alt="Logo">`;
    }
    if (savedState.qrEnabled && inputQrToggle && cardQrDisplay) {
      inputQrToggle.checked = true;
      cardQrDisplay.classList.add('active');
    }
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
    // Regenerate QR image now that website value has been restored
    if (savedState.qrEnabled && inputQrToggle?.checked) {
      const website = document.getElementById('input-website')?.value ||
          'https://example.com';
      if (typeof qrcode !== 'undefined') {
        const qr = qrcode(0, 'M');
        qr.addData(website);
        qr.make();
        cardQrDisplay.innerHTML = qr.createImgTag(4);
      }
    }
  }

  setTimeout(() => runLayoutEngine(true), 100);
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  document.addEventListener('DOMContentLoaded', initApp);
}
