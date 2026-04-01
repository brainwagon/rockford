import {
  getAbsoluteBoundingRect,
  autoScaleElement,
  resetElementScaling,
} from './layout.js';
import {injectGoogleFonts, applyFontPair} from './fonts.js';
import {formatPhoneNumber} from './phone-utils.js';

/**
 * Initializes the business card generator application.
 */
export function initApp() {
  const btnLandscape = document.getElementById('btn-landscape');
  const btnPortrait = document.getElementById('btn-portrait');
  const businessCard = document.getElementById('business-card');
  const templateSelect = document.getElementById('template-select');
  const fontSelect = document.getElementById('font-select');
  const inputQrToggle = document.getElementById('input-qr-toggle');
  const cardQrDisplay = document.getElementById('card-qr-display');
  const inputWebsite = document.getElementById('input-website');
  const inputLogo = document.getElementById('input-logo');
  const cardLogoDisplay = document.getElementById('card-logo-display');

  // Initialize with default fonts
  applyFontPair('default');

  /**
   * Triggers the layout engine to recalculate element scaling and positions.
   * @param {boolean} [immediate=false] - Whether to run layout immediately.
   */
  const runLayoutEngine = (immediate = false) => {
    const performLayout = () => {
      if (!businessCard) return;

      const cardRect = getAbsoluteBoundingRect(businessCard);

      // Only avoid Logo if an image is actually present
      const logoImg = cardLogoDisplay?.querySelector('img');
      const logoRect = logoImg ? getAbsoluteBoundingRect(cardLogoDisplay) : null;

      // Only avoid QR if it is active
      const qrRect = (cardQrDisplay &&
          cardQrDisplay.classList.contains('active')) ?
          getAbsoluteBoundingRect(cardQrDisplay) : null;

      const nameEl = document.getElementById('card-name-display');
      const titleEl = document.getElementById('card-title-display');
      const companyEl = document.getElementById('card-company-display');

      // 1. Reset all scaling
      resetElementScaling(nameEl);
      resetElementScaling(titleEl);
      resetElementScaling(companyEl);

      // 2. Resolve INDIVIDUAL collisions with Logo and QR
      const avoidRects = [];
      if (logoRect) avoidRects.push(logoRect);
      if (qrRect) avoidRects.push(qrRect);

      // Handle optional company visibility
      if (companyEl) {
        if (!document.getElementById('input-company')?.value) {
          companyEl.style.display = 'none';
        } else {
          companyEl.style.display = 'inline-block';
        }
      }

      if (nameEl) autoScaleElement(nameEl, cardRect, avoidRects, false);
      if (titleEl) autoScaleElement(titleEl, cardRect, avoidRects, false);
      if (companyEl && companyEl.style.display !== 'none') {
        autoScaleElement(companyEl, cardRect, avoidRects, false);
      }

      // 3. Final Vertical Fit Pass
      const cardContent = document.querySelector('.card-content');
      let safetyCounter = 0;

      const checkVerticalOverflow = () => {
        const contentRect = getAbsoluteBoundingRect(cardContent);
        // Allow a tiny 1px buffer for rounding
        return contentRect.height > cardRect.height + 1;
      };

      while (checkVerticalOverflow() && safetyCounter < 50) {
        const nameFontSize = parseFloat(window.getComputedStyle(nameEl).fontSize);
        const titleFontSize = parseFloat(window.getComputedStyle(titleEl).fontSize);
        const companyFontSize = parseFloat(window.getComputedStyle(companyEl).fontSize);

        if (nameFontSize > 8) {
          nameEl.style.fontSize = `${nameFontSize - 0.5}px`;
        }
        if (titleFontSize > 8) {
          titleEl.style.fontSize = `${titleFontSize - 0.5}px`;
        }
        if (companyFontSize > 8) {
          companyEl.style.fontSize = `${companyFontSize - 0.5}px`;
        }

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

  /**
   * Handles font loading and application with UI feedback.
   * @param {string} pairId - The ID of the font pair to load.
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

  // Persistence Logic (moved up for scope)
  let layoutTimeout;
  let saveTimeout;

  /**
   * Saves the current application state to localStorage.
   * @param {boolean} [immediate=false] - Whether to save immediately.
   */
  const saveToLocalStorage = (immediate = false) => {
    const performSave = () => {
      runLayoutEngine(true);
      const state = {
        name: document.getElementById('input-name')?.value,
        title: document.getElementById('input-title')?.value,
        email: document.getElementById('input-email')?.value,
        phone: document.getElementById('input-phone')?.value,
        website: document.getElementById('input-website')?.value,
        template: templateSelect?.value,
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

  // Orientation Logic
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

  // Template Logic
  if (templateSelect && businessCard) {
    templateSelect.addEventListener('change', (e) => {
      const selectedTemplate = e.target.value;
      businessCard.classList.remove('minimal', 'modern', 'elegant');
      businessCard.classList.add(selectedTemplate);
      runLayoutEngine(true);
      saveToLocalStorage();
    });
  }

  // Typography Logic
  if (fontSelect && businessCard) {
    fontSelect.addEventListener('change', async (e) => {
      await loadAndApplyFont(e.target.value);
      saveToLocalStorage();
    });
  }

  // Text Customization Logic
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
    const displayEl = document.getElementById(inputPair.displayId);

    if (inputEl && displayEl) {
      inputEl.addEventListener('input', () => {
        if (inputPair.id === 'input-phone') {
          inputEl.value = formatPhoneNumber(inputEl.value);
        }
        displayEl.textContent = inputEl.value;
        runLayoutEngine();
        saveToLocalStorage();
      });
    }
  });

  // Logo Upload Logic
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

  /**
   * Updates the QR code image based on the current website input.
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

  // Export Logic
  const btnExportPng = document.getElementById('btn-export-png');
  const btnExportPdf = document.getElementById('btn-export-pdf');

  if (btnExportPng) {
    btnExportPng.addEventListener('click', () => {
      if (typeof html2canvas === 'undefined') {
        console.error('html2canvas not loaded');
        return;
      }
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
          typeof window.jspdf === 'undefined') {
        console.error('Export libraries not loaded');
        return;
      }
      html2canvas(businessCard, {scale: 3}).then((canvas) => {
        const {jsPDF} = window.jspdf;
        const isLandscape = businessCard.classList.contains('landscape');
        const orientation = isLandscape ? 'l' : 'p';
        // 3.5 x 2 inches in points (72 points per inch)
        const doc = new jsPDF({
          orientation: orientation,
          unit: 'in',
          format: isLandscape ? [3.5, 2] : [2, 3.5],
        });

        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, isLandscape ? 3.5 : 2,
            isLandscape ? 2 : 3.5);
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

  /**
   * Loads application state from localStorage.
   */
  const loadFromLocalStorage = async () => {
    const saved = localStorage.getItem('bmaker_state');
    if (!saved) return;

    try {
      const state = JSON.parse(saved);
      if (state.name) document.getElementById('input-name').value = state.name;
      if (state.title) {
        document.getElementById('input-title').value = state.title;
      }
      if (state.email) {
        document.getElementById('input-email').value = state.email;
      }
      if (state.phone) {
        const formatted = formatPhoneNumber(state.phone);
        document.getElementById('input-phone').value = formatted;
      }
      if (state.website) {
        document.getElementById('input-website').value = state.website;
      }

      inputs.forEach((inputPair) => {
        const inputEl = document.getElementById(inputPair.id);
        const displayEl = document.getElementById(inputPair.displayId);
        if (inputEl && displayEl) {
          displayEl.textContent = inputEl.value;
        }
      });

      if (state.template) {
        templateSelect.value = state.template;
        businessCard.classList.remove('minimal', 'modern', 'elegant');
        businessCard.classList.add(state.template);
      }

      if (state.fontPairId) {
        fontSelect.value = state.fontPairId;
        await loadAndApplyFont(state.fontPairId);
      }

      if (state.orientation === 'portrait') {
        businessCard.classList.remove('landscape');
        businessCard.classList.add('portrait');
        btnPortrait.classList.add('active');
        btnLandscape.classList.remove('active');
      } else if (state.orientation === 'landscape') {
        businessCard.classList.remove('portrait');
        businessCard.classList.add('landscape');
        btnLandscape.classList.add('active');
        btnPortrait.classList.remove('active');
      }

      if (state.logo) {
        cardLogoDisplay.innerHTML = `<img src="${state.logo}" alt="Logo">`;
      }

      if (state.qrEnabled) {
        inputQrToggle.checked = true;
        cardQrDisplay.classList.add('active');
        const website = document.getElementById('input-website').value ||
            'https://example.com';
        if (typeof qrcode !== 'undefined') {
          const qr = qrcode(0, 'M');
          qr.addData(website);
          qr.make();
          cardQrDisplay.innerHTML = qr.createImgTag(4);
        }
      }

      // Run layout engine after a short delay to ensure DOM is ready
      setTimeout(() => runLayoutEngine(true), 100);
    } catch (e) {
      console.error('Failed to load state:', e);
    }
  };

  loadFromLocalStorage();
}

if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
  document.addEventListener('DOMContentLoaded', initApp);
}
