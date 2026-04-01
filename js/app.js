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

    // Export Logic
    const btnExportPng = document.getElementById('btn-export-png');
    const btnExportPdf = document.getElementById('btn-export-pdf');

    if (btnExportPng) {
        btnExportPng.addEventListener('click', () => {
            html2canvas(businessCard, { scale: 3 }).then(canvas => {
                const link = document.createElement('a');
                link.download = `business-card-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    }

    if (btnExportPdf) {
        btnExportPdf.addEventListener('click', () => {
            html2canvas(businessCard, { scale: 3 }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const orientation = businessCard.classList.contains('landscape') ? 'l' : 'p';
                // 3.5 x 2 inches in points (72 points per inch)
                const doc = new jsPDF({
                    orientation: orientation,
                    unit: 'in',
                    format: orientation === 'l' ? [3.5, 2] : [2, 3.5]
                });
                
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 0, 0, orientation === 'l' ? 3.5 : 2, orientation === 'l' ? 2 : 3.5);
                doc.save(`business-card-${Date.now()}.pdf`);
            });
        });
    }

    const btnPrint = document.getElementById('btn-print');
    const printSheet = document.getElementById('print-sheet');

    if (btnPrint && printSheet) {
        btnPrint.addEventListener('click', () => {
            // Clear previous clones
            printSheet.innerHTML = '';
            
            // Clone the current card 10 times
            for (let i = 0; i < 10; i++) {
                const clone = businessCard.cloneNode(true);
                clone.id = `print-card-${i}`;
                clone.classList.add('print-card-clone');
                // Ensure orientation matches for Avery standard (landscape usually)
                // But we'll follow the user's chosen orientation
                printSheet.appendChild(clone);
            }
            
            window.print();
        });
    }

    // Persistence Logic
    let saveTimeout;
    const saveToLocalStorage = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            const state = {
                name: document.getElementById('input-name')?.value,
                title: document.getElementById('input-title')?.value,
                email: document.getElementById('input-email')?.value,
                phone: document.getElementById('input-phone')?.value,
                website: document.getElementById('input-website')?.value,
                template: templateSelect?.value,
                orientation: businessCard?.classList.contains('landscape') ? 'landscape' : 'portrait',
                qrEnabled: inputQrToggle?.checked,
                logo: cardLogoDisplay?.querySelector('img')?.src
            };
            localStorage.setItem('bmaker_state', JSON.stringify(state));
        }, 500);
    };

    // Attach save listeners
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', saveToLocalStorage);
        el.addEventListener('change', saveToLocalStorage);
    });

    [btnLandscape, btnPortrait].forEach(btn => {
        btn?.addEventListener('click', saveToLocalStorage);
    });

    // Load Persistence Logic
    const loadFromLocalStorage = () => {
        const saved = localStorage.getItem('bmaker_state');
        if (!saved) return;

        try {
            const state = JSON.parse(saved);
            
            // Restore Text Fields
            if (state.name) document.getElementById('input-name').value = state.name;
            if (state.title) document.getElementById('input-title').value = state.title;
            if (state.email) document.getElementById('input-email').value = state.email;
            if (state.phone) document.getElementById('input-phone').value = state.phone;
            if (state.website) document.getElementById('input-website').value = state.website;

            // Trigger sync for all inputs to update preview
            inputs.forEach(inputPair => {
                const inputEl = document.getElementById(inputPair.id);
                const displayEl = document.getElementById(inputPair.displayId);
                if (inputEl && displayEl) {
                    displayEl.textContent = inputEl.value;
                }
            });

            // Restore UI State (Template)
            if (state.template) {
                templateSelect.value = state.template;
                businessCard.classList.remove('minimal', 'modern', 'elegant');
                businessCard.classList.add(state.template);
            }

            // Restore UI State (Orientation)
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

            // Restore Logo
            if (state.logo) {
                cardLogoDisplay.innerHTML = `<img src="${state.logo}" alt="Logo">`;
            }

            // Restore QR
            if (state.qrEnabled) {
                inputQrToggle.checked = true;
                cardQrDisplay.classList.add('active');
                // updateQRCode requires inputWebsite value
                const website = document.getElementById('input-website').value || 'https://example.com';
                if (typeof qrcode !== 'undefined') {
                    const qr = qrcode(0, 'M');
                    qr.addData(website);
                    qr.make();
                    cardQrDisplay.innerHTML = qr.createImgTag(4);
                }
            }

        } catch (e) {
            console.error('Failed to load state:', e);
        }
    };

    loadFromLocalStorage();
}

// Auto-init if not in test environment
if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
    document.addEventListener('DOMContentLoaded', initApp);
}
