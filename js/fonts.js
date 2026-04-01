/**
 * Configuration for professional Google Font pairs
 */
export const FONT_PAIRS = {
    'montserrat_merriweather': {
        id: 'montserrat_merriweather',
        name: 'Montserrat + Merriweather',
        headingFont: "'Montserrat', sans-serif",
        bodyFont: "'Merriweather', serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Merriweather:wght@400&display=swap'
    },
    'playfair_source': {
        id: 'playfair_source',
        name: 'Playfair Display + Source Sans Pro',
        headingFont: "'Playfair Display', serif",
        bodyFont: "'Source Sans Pro', sans-serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+Pro:wght@400&display=swap'
    },
    'lora_lato': {
        id: 'lora_lato',
        name: 'Lora + Lato',
        headingFont: "'Lora', serif",
        bodyFont: "'Lato', sans-serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@700&family=Lato:wght@400&display=swap'
    },
    'oswald_crimson': {
        id: 'oswald_crimson',
        name: 'Oswald + Crimson Text',
        headingFont: "'Oswald', sans-serif",
        bodyFont: "'Crimson Text', serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Crimson+Text:wght@400&display=swap'
    },
    'raleway_baskerville': {
        id: 'raleway_baskerville',
        name: 'Raleway + Libre Baskerville',
        headingFont: "'Raleway', sans-serif",
        bodyFont: "'Libre Baskerville', serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@700&family=Libre+Baskerville:wght@400&display=swap'
    },
    'poppins_spectral': {
        id: 'poppins_spectral',
        name: 'Poppins + Spectral',
        headingFont: "'Poppins', sans-serif",
        bodyFont: "'Spectral', serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@700&family=Spectral:wght@400&display=swap'
    },
    'bebas_opensans': {
        id: 'bebas_opensans',
        name: 'Bebas Neue + Open Sans',
        headingFont: "'Bebas Neue', sans-serif",
        bodyFont: "'Open Sans', sans-serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Open+Sans:wght@400&display=swap'
    },
    'cormorant_roboto': {
        id: 'cormorant_roboto',
        name: 'Cormorant Garamond + Roboto',
        headingFont: "'Cormorant Garamond', serif",
        bodyFont: "'Roboto', sans-serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Roboto:wght@400&display=swap'
    },
    'cinzel_nunito': {
        id: 'cinzel_nunito',
        name: 'Cinzel + Nunito Sans',
        headingFont: "'Cinzel', serif",
        bodyFont: "'Nunito Sans', sans-serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Nunito+Sans:wght@400&display=swap'
    },
    'ebgaramond_worksans': {
        id: 'ebgaramond_worksans',
        name: 'EB Garamond + Work Sans',
        headingFont: "'EB Garamond', serif",
        bodyFont: "'Work Sans', sans-serif",
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@700&family=Work+Sans:wght@400&display=swap'
    }
};

/**
 * Injects a Google Fonts link tag into the document head for the given font pair ID.
 * @param {string} pairId - The ID of the font pair to inject.
 */
export function injectGoogleFonts(pairId) {
    if (pairId === 'default' || !FONT_PAIRS[pairId]) {
        return;
    }

    const pair = FONT_PAIRS[pairId];
    const linkId = `google-fonts-${pairId}`;

    if (document.getElementById(linkId)) {
        return;
    }

    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = pair.googleFontsUrl;
    document.head.appendChild(link);
}

/**
 * Applies the font pair to the business card preview.
 * @param {string} pairId - The ID of the font pair to apply.
 */
export function applyFontPair(pairId) {
    const businessCard = document.getElementById('business-card');
    if (!businessCard) return;

    if (pairId === 'default' || !FONT_PAIRS[pairId]) {
        businessCard.style.removeProperty('--heading-font');
        businessCard.style.removeProperty('--body-font');
        return;
    }

    const pair = FONT_PAIRS[pairId];
    businessCard.style.setProperty('--heading-font', pair.headingFont);
    businessCard.style.setProperty('--body-font', pair.bodyFont);
}
