export function initApp() {
    const btnLandscape = document.getElementById('btn-landscape');
    const btnPortrait = document.getElementById('btn-portrait');
    const businessCard = document.getElementById('business-card');
    const templateSelect = document.getElementById('template-select');

    // Orientation Logic
    if (btnLandscape && btnPortrait && businessCard) {
        btnLandscape.addEventListener('click', () => {
            businessCard.classList.remove('portrait');
            businessCard.classList.add('landscape');
            btnLandscape.classList.add('active');
            btnPortrait.classList.remove('active');
        });

        btnPortrait.addEventListener('click', () => {
            businessCard.classList.remove('landscape');
            businessCard.classList.add('portrait');
            btnPortrait.classList.add('active');
            btnLandscape.classList.remove('active');
        });
    }

    // Template Logic
    if (templateSelect && businessCard) {
        templateSelect.addEventListener('change', (e) => {
            const selectedTemplate = e.target.value;
            businessCard.classList.remove('minimal', 'modern', 'elegant');
            businessCard.classList.add(selectedTemplate);
        });
    }

    // Text Customization Logic
    const inputs = [
        { id: 'input-name', displayId: 'card-name-display' },
        { id: 'input-title', displayId: 'card-title-display' },
        { id: 'input-email', displayId: 'card-email-display' },
        { id: 'input-phone', displayId: 'card-phone-display' },
        { id: 'input-website', displayId: 'card-website-display' }
    ];

    inputs.forEach(inputPair => {
        const inputEl = document.getElementById(inputPair.id);
        const displayEl = document.getElementById(inputPair.displayId);

        if (inputEl && displayEl) {
            inputEl.addEventListener('input', () => {
                displayEl.textContent = inputEl.value;
            });
        }
    });

    // Logo Upload Logic
    const inputLogo = document.getElementById('input-logo');
    const cardLogoDisplay = document.getElementById('card-logo-display');

    if (inputLogo && cardLogoDisplay) {
        inputLogo.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    cardLogoDisplay.innerHTML = `<img src="${event.target.result}" alt="Logo">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // QR Code Integration
    const inputQrToggle = document.getElementById('input-qr-toggle');
    const cardQrDisplay = document.getElementById('card-qr-display');
    const inputWebsite = document.getElementById('input-website');

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
        });
    }

    if (inputWebsite) {
        inputWebsite.addEventListener('input', () => {
            if (inputQrToggle.checked) {
                updateQRCode();
            }
        });
    }
}

// Auto-init if not in test environment
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    document.addEventListener('DOMContentLoaded', initApp);
}
