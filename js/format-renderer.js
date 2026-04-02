/**
 * Renders a business card DOM structure from a parsed format and data set.
 */

const THEME_CLASSES = ['minimal', 'modern', 'elegant'];
const ORIENTATION_CLASSES = ['landscape', 'portrait'];

/** Maps canonical field names to stable element IDs used by the layout engine. */
const FIELD_IDS = {
  Name: 'card-name-display',
  Title: 'card-title-display',
  Company: 'card-company-display',
  Email: 'card-email-display',
  Phone: 'card-phone-display',
  Website: 'card-website-display',
};

/**
 * Returns the HTML tag to use for a given field.
 * Name uses h1 to preserve existing CSS selectors; all others use p.
 * @param {string} fieldName
 * @returns {string}
 */
function tagForField(fieldName) {
  return fieldName === 'Name' ? 'h1' : 'p';
}

/**
 * Creates a DOM element for a single column item.
 * @param {Object} item - parsed item {field, size, style, alignment}
 * @param {string} value - data value for this item's field key
 * @param {Object} data - full data map (used by Logo and QRCode items)
 * @returns {HTMLElement}
 */
function createFieldElement(item, value, data) {
  if (item.field === 'VSpace') {
    const el = document.createElement('div');
    el.className = 'card-vspace';
    if (item.size) el.style.height = item.size;
    return el;
  }

  if (item.field === 'VPad') {
    const el = document.createElement('div');
    el.className = 'card-vpad';
    return el;
  }

  if (item.field === 'Logo') {
    const el = document.createElement('div');
    el.id = 'card-logo-display';
    el.className = 'card-logo';
    if (item.alignment) el.style.textAlign = item.alignment;
    const src = data && data.Logo;
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Logo';
      img.style.objectFit = 'contain';
      img.style.display = 'inline-block';
      if (item.size) {
        img.style.width = item.size;
        img.style.height = item.size;
      }
      el.appendChild(img);
    } else {
      el.style.display = 'none';
    }
    return el;
  }

  if (item.field === 'QRCode') {
    const el = document.createElement('div');
    el.id = 'card-qr-display';
    el.className = 'card-qrcode';
    if (item.alignment) el.style.textAlign = item.alignment;
    if (item.size) {
      el.style.display = 'inline-block';
      el.style.width = item.size;
      el.style.height = item.size;
    }
    const website = data && data.Website;
    if (!website) el.style.display = 'none';
    return el;
  }

  const el = document.createElement(tagForField(item.field));

  const id = FIELD_IDS[item.field];
  if (id) el.id = id;
  el.className = `card-field card-field-${item.field.toLowerCase()}`;

  el.textContent = value || '';

  if (item.size) {
    el.style.fontSize = item.size;
    el.dataset.baseFontSize = item.size;
  }

  if (item.style && item.style !== 'normal') {
    if (item.style.includes('bold')) el.style.fontWeight = 'bold';
    if (item.style.includes('italic')) el.style.fontStyle = 'italic';
  }

  if (item.alignment) el.style.textAlign = item.alignment;

  if (!value) el.style.display = 'none';

  return el;
}

/**
 * Creates a .card-column element from a column definition and data.
 * @param {Object} colDef - parsed column definition
 * @param {Object} data - key-value data map
 * @returns {HTMLElement}
 */
function createColumnElement(colDef, data) {
  const colEl = document.createElement('div');
  colEl.className = 'card-column';
  if (colDef.width) colEl.style.width = colDef.width;
  if (colDef.alignment) colEl.style.textAlign = colDef.alignment;

  for (const item of colDef.items) {
    colEl.appendChild(createFieldElement(item, data[item.field] || '', data));
  }

  return colEl;
}

/**
 * Creates a .card-segment element from a segment definition and data.
 * @param {Object} seg - parsed segment definition
 * @param {Object} data - key-value data map
 * @returns {HTMLElement}
 */
function createSegmentElement(seg, data) {
  const segEl = document.createElement('div');
  segEl.className = 'card-segment';
  if (seg.height) segEl.style.height = seg.height;
  if (seg.padding && seg.padding !== '0') segEl.style.padding = seg.padding;
  if (seg.backgroundColor) segEl.style.backgroundColor = seg.backgroundColor;

  for (const colDef of seg.columnDefs) {
    segEl.appendChild(createColumnElement(colDef, data));
  }

  return segEl;
}

/**
 * Renders a business card DOM structure from a parsed format and data set.
 * Modifies cardElement in-place: applies classes/styles and rebuilds .card-content.
 * Logo and QR overlay elements are preserved untouched.
 *
 * @param {HTMLElement} cardElement - the #business-card element
 * @param {Object} format - parsed format from parseFormat()
 * @param {Object} data - {Name, Title, Company, Email, Phone, Website, Logo}
 */
export function renderCard(cardElement, format, data) {
  const {metadata, segments} = format;

  // 1. Apply theme and orientation classes
  THEME_CLASSES.forEach((c) => cardElement.classList.remove(c));
  ORIENTATION_CLASSES.forEach((c) => cardElement.classList.remove(c));
  if (metadata.theme) cardElement.classList.add(metadata.theme);
  if (metadata.orientation) cardElement.classList.add(metadata.orientation);

  // 2. Apply card-level visual styles
  if (metadata.backgroundColor) {
    cardElement.style.backgroundColor = metadata.backgroundColor;
  }
  if (metadata.border && metadata.border !== 'none') {
    cardElement.style.border = metadata.border;
  } else {
    cardElement.style.removeProperty('border');
  }
  if (metadata.lineHeight) {
    cardElement.style.setProperty('--card-line-height', metadata.lineHeight);
  } else {
    cardElement.style.removeProperty('--card-line-height');
  }

  // 4. Rebuild .card-content (segments + columns + fields)
  let cardContent = cardElement.querySelector('.card-content');
  if (!cardContent) {
    cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    cardElement.appendChild(cardContent);
  }
  cardContent.innerHTML = '';

  for (const seg of segments) {
    cardContent.appendChild(createSegmentElement(seg, data));
  }
}
