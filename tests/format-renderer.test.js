import {describe, it, expect, beforeEach} from 'vitest';
import {JSDOM} from 'jsdom';
import {renderCard} from '../js/format-renderer.js';
import {parseFormat} from '../js/format-parser.js';

// Minimal two-segment format for most tests
const MINIMAL_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Test"
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

const ELEGANT_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Elegant"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "portrait"
- **Theme**: "elegant"
- **FontPair**: "default"
- **BackgroundColor**: "#FAFAFA"
- **Border**: "1px solid #D4AF37"
- **QRCode**: "false"

## Segment: Identity
- **Height**: "100%"
- **Columns**: "1"

### Column 1
- **Width**: "100%"
- **Alignment**: "center"
- **Items**:
  - **Field**: Name
    - **Size**: "18pt"
    - **Style**: "italic"
`;

const TWO_COL_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "TwoCol"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "modern"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"
- **QRCode**: "false"

## Segment: Body
- **Height**: "100%"
- **Columns**: "2"

### Column 1
- **Width**: "60%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "14pt"
    - **Style**: "bold"
  - **Field**: Title
    - **Size**: "10pt"
    - **Alignment**: "center"

### Column 2
- **Width**: "40%"
- **Alignment**: "right"
- **Items**:
  - **Field**: Email
    - **Size**: "9pt"
`;

/** Build a minimal #business-card DOM element */
function makeCard(dom) {
  const doc = dom.window.document;
  const card = doc.createElement('div');
  card.id = 'business-card';
  card.className = 'landscape minimal';

  const content = doc.createElement('div');
  content.className = 'card-content';
  card.appendChild(content);

  doc.body.appendChild(card);
  return card;
}

describe('renderCard — theme and orientation', () => {
  let dom;
  let card;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('adds theme class to card element', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    expect(card.classList.contains('minimal')).toBe(true);
  });

  it('removes old theme class before adding new one', () => {
    card.classList.add('elegant');
    renderCard(card, parseFormat(MINIMAL_MD), {});
    expect(card.classList.contains('elegant')).toBe(false);
    expect(card.classList.contains('minimal')).toBe(true);
  });

  it('adds orientation class', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    expect(card.classList.contains('landscape')).toBe(true);
  });

  it('applies portrait orientation', () => {
    renderCard(card, parseFormat(ELEGANT_MD), {});
    expect(card.classList.contains('portrait')).toBe(true);
    expect(card.classList.contains('landscape')).toBe(false);
  });

  it('applies theme from elegant format', () => {
    renderCard(card, parseFormat(ELEGANT_MD), {});
    expect(card.classList.contains('elegant')).toBe(true);
  });

  it('applies modern theme', () => {
    renderCard(card, parseFormat(TWO_COL_MD), {});
    expect(card.classList.contains('modern')).toBe(true);
  });
});

describe('renderCard — card-level styles', () => {
  let dom;
  let card;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('sets backgroundColor inline style', () => {
    renderCard(card, parseFormat(ELEGANT_MD), {});
    // jsdom normalizes hex to rgb
    expect(card.style.backgroundColor).toBe('rgb(250, 250, 250)');
  });

  it('sets border inline style when non-none', () => {
    renderCard(card, parseFormat(ELEGANT_MD), {});
    // jsdom normalizes hex color within border shorthand
    expect(card.style.border).toBe('1px solid rgb(212, 175, 55)');
  });

  it('sets --card-line-height CSS custom property when LineHeight is present', () => {
    const MD_WITH_LH = MINIMAL_MD.replace(
        '- **Border**: "none"',
        '- **Border**: "none"\n- **LineHeight**: "1.4"');
    renderCard(card, parseFormat(MD_WITH_LH), {});
    expect(card.style.getPropertyValue('--card-line-height')).toBe('1.4');
  });

  it('removes --card-line-height when LineHeight is absent', () => {
    // First render with a line height, then re-render without one
    const MD_WITH_LH = MINIMAL_MD.replace(
        '- **Border**: "none"',
        '- **Border**: "none"\n- **LineHeight**: "1.4"');
    renderCard(card, parseFormat(MD_WITH_LH), {});
    renderCard(card, parseFormat(MINIMAL_MD), {});
    expect(card.style.getPropertyValue('--card-line-height')).toBe('');
  });
});

describe('renderCard — segment structure', () => {
  let dom;
  let card;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('generates two .card-segment elements for minimal format', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    const segments = card.querySelectorAll('.card-segment');
    expect(segments).toHaveLength(2);
  });

  it('generates one .card-segment for single-segment format', () => {
    renderCard(card, parseFormat(ELEGANT_MD), {});
    const segments = card.querySelectorAll('.card-segment');
    expect(segments).toHaveLength(1);
  });

  it('sets segment height inline style', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    const segments = card.querySelectorAll('.card-segment');
    expect(segments[0].style.height).toBe('55%');
    expect(segments[1].style.height).toBe('45%');
  });

  it('sets segment padding inline style', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    const segments = card.querySelectorAll('.card-segment');
    // jsdom collapses "20px 20px 0px 20px" → "20px 20px 0px" (left=right shorthand)
    expect(segments[0].style.padding).toBe('20px 20px 0px');
  });
});

describe('renderCard — column structure', () => {
  let dom;
  let card;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('generates one .card-column per single-column segment', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    const identitySegment = card.querySelectorAll('.card-segment')[0];
    expect(identitySegment.querySelectorAll('.card-column')).toHaveLength(1);
  });

  it('generates two .card-columns for a two-column segment', () => {
    renderCard(card, parseFormat(TWO_COL_MD), {});
    const segment = card.querySelectorAll('.card-segment')[0];
    expect(segment.querySelectorAll('.card-column')).toHaveLength(2);
  });

  it('sets column width inline style', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    const col = card.querySelector('.card-column');
    expect(col.style.width).toBe('100%');
  });

  it('sets column text-align from alignment', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {});
    const col = card.querySelector('.card-column');
    expect(col.style.textAlign).toBe('left');
  });
});

describe('renderCard — field elements', () => {
  let dom;
  let card;
  const data = {
    Name: 'Jane Smith',
    Title: 'Engineer',
    Company: 'Acme',
    Email: 'jane@acme.com',
    Phone: '+1 (555) 000-0000',
    Website: 'acme.com',
  };

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('assigns id card-name-display to Name field', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-name-display')).not.toBeNull();
  });

  it('assigns id card-title-display to Title field', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-title-display')).not.toBeNull();
  });

  it('assigns id card-email-display to Email field', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-email-display')).not.toBeNull();
  });

  it('renders Name field value as text content', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-name-display').textContent).toBe('Jane Smith');
  });

  it('sets font-size inline style from format spec', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-name-display').style.fontSize).toBe('18pt');
    expect(card.querySelector('#card-email-display').style.fontSize).toBe('9pt');
  });

  it('sets font-weight bold for bold style', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-name-display').style.fontWeight).toBe('bold');
  });

  it('sets font-style italic for italic style', () => {
    renderCard(card, parseFormat(ELEGANT_MD), data);
    expect(card.querySelector('#card-name-display').style.fontStyle).toBe('italic');
  });

  it('does not set font-weight for normal style', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    const titleEl = card.querySelector('#card-title-display');
    expect(titleEl.style.fontWeight).toBe('');
  });

  it('applies per-field alignment override', () => {
    renderCard(card, parseFormat(TWO_COL_MD), data);
    expect(card.querySelector('#card-title-display').style.textAlign).toBe('center');
  });

  it('hides field element when data value is absent', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {Name: 'Jane'});
    const titleEl = card.querySelector('#card-title-display');
    expect(titleEl.style.display).toBe('none');
  });

  it('shows field element when data value is present', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    const nameEl = card.querySelector('#card-name-display');
    expect(nameEl.style.display).not.toBe('none');
  });

  it('renders Name as h1 element', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-name-display').tagName).toBe('H1');
  });

  it('renders Title as p element', () => {
    renderCard(card, parseFormat(MINIMAL_MD), data);
    expect(card.querySelector('#card-title-display').tagName).toBe('P');
  });
});

describe('renderCard — VSpace items', () => {
  let dom;
  let card;

  const VSPACE_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Test"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "minimal"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"
- **QRCode**: "false"

## Segment: Identity
- **Height**: "100%"
- **Columns**: "1"
- **Padding**: "20px"

### Column 1
- **Width**: "100%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "18pt"
  - **VSpace**: "12px"
  - **Field**: Title
    - **Size**: "11pt"
`;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('renders a .card-vspace element for VSpace items', () => {
    renderCard(card, parseFormat(VSPACE_MD), {Name: 'A', Title: 'B'});
    expect(card.querySelector('.card-vspace')).not.toBeNull();
  });

  it('sets height style from VSpace size', () => {
    renderCard(card, parseFormat(VSPACE_MD), {Name: 'A', Title: 'B'});
    expect(card.querySelector('.card-vspace').style.height).toBe('12px');
  });

  it('places VSpace between Name and Title in DOM order', () => {
    renderCard(card, parseFormat(VSPACE_MD), {Name: 'A', Title: 'B'});
    const col = card.querySelector('.card-column');
    const children = Array.from(col.children);
    const nameIdx = children.findIndex((el) => el.id === 'card-name-display');
    const spaceIdx = children.findIndex((el) => el.classList.contains('card-vspace'));
    const titleIdx = children.findIndex((el) => el.id === 'card-title-display');
    expect(spaceIdx).toBe(nameIdx + 1);
    expect(titleIdx).toBe(spaceIdx + 1);
  });
});

describe('renderCard — VPad items', () => {
  let dom;
  let card;

  const VPAD_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Test"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "minimal"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"
- **QRCode**: "false"

## Segment: Identity
- **Height**: "100%"
- **Columns**: "1"
- **Padding**: "20px"

### Column 1
- **Width**: "100%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "18pt"
  - **VPad**:
  - **Field**: Title
    - **Size**: "11pt"
  - **VPad**:
`;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('renders a .card-vpad element for each VPad item', () => {
    renderCard(card, parseFormat(VPAD_MD), {Name: 'A', Title: 'B'});
    expect(card.querySelectorAll('.card-vpad')).toHaveLength(2);
  });

  it('VPad element has no inline height', () => {
    renderCard(card, parseFormat(VPAD_MD), {Name: 'A', Title: 'B'});
    const pads = card.querySelectorAll('.card-vpad');
    pads.forEach((el) => expect(el.style.height).toBe(''));
  });

  it('places VPad elements between Name and Title in DOM order', () => {
    renderCard(card, parseFormat(VPAD_MD), {Name: 'A', Title: 'B'});
    const col = card.querySelector('.card-column');
    const children = Array.from(col.children);
    const nameIdx = children.findIndex((el) => el.id === 'card-name-display');
    const padIdx = children.findIndex((el) => el.classList.contains('card-vpad'));
    const titleIdx = children.findIndex((el) => el.id === 'card-title-display');
    expect(padIdx).toBe(nameIdx + 1);
    expect(titleIdx).toBe(padIdx + 1);
  });
});

describe('renderCard — Logo items', () => {
  let dom;
  let card;

  const LOGO_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Test"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "minimal"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"

## Segment: Identity
- **Height**: "100%"
- **Columns**: "2"

### Column 1
- **Width**: "70%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "18pt"

### Column 2
- **Width**: "30%"
- **Alignment**: "right"
- **Items**:
  - **Logo**:
    - **Size**: "50px"
`;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('creates #card-logo-display when Logo item is present', () => {
    renderCard(card, parseFormat(LOGO_MD), {Logo: 'data:image/png;base64,xxx'});
    expect(card.querySelector('#card-logo-display')).not.toBeNull();
  });

  it('Logo element contains img with logo src', () => {
    renderCard(card, parseFormat(LOGO_MD), {Logo: 'data:image/png;base64,xxx'});
    const img = card.querySelector('#card-logo-display img');
    expect(img).not.toBeNull();
    expect(img.src).toContain('data:image/png;base64,xxx');
  });

  it('sets img dimensions from Logo Size', () => {
    renderCard(card, parseFormat(LOGO_MD), {Logo: 'data:image/png;base64,xxx'});
    const img = card.querySelector('#card-logo-display img');
    expect(img.style.width).toBe('50px');
    expect(img.style.height).toBe('50px');
  });

  it('hides Logo element when Logo data is absent', () => {
    renderCard(card, parseFormat(LOGO_MD), {});
    expect(card.querySelector('#card-logo-display').style.display).toBe('none');
  });

  it('re-renders cleanly when called twice', () => {
    renderCard(card, parseFormat(MINIMAL_MD), {Name: 'First'});
    renderCard(card, parseFormat(MINIMAL_MD), {Name: 'Second'});
    expect(card.querySelector('#card-name-display').textContent).toBe('Second');
    expect(card.querySelectorAll('.card-segment')).toHaveLength(2);
  });
});

describe('renderCard — QRCode items', () => {
  let dom;
  let card;

  const QRCODE_MD = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "Test"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "minimal"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"

## Segment: Contact
- **Height**: "100%"
- **Columns**: "1"

### Column 1
- **Width**: "100%"
- **Alignment**: "center"
- **Items**:
  - **Field**: Website
    - **Size**: "9pt"
  - **QRCode**:
    - **Size**: "60px"
`;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    card = makeCard(dom);
  });

  it('creates #card-qr-display when QRCode item is present', () => {
    renderCard(card, parseFormat(QRCODE_MD), {Website: 'https://example.com'});
    expect(card.querySelector('#card-qr-display')).not.toBeNull();
  });

  it('sets QRCode element dimensions from Size', () => {
    renderCard(card, parseFormat(QRCODE_MD), {Website: 'https://example.com'});
    const qrEl = card.querySelector('#card-qr-display');
    expect(qrEl.style.width).toBe('60px');
    expect(qrEl.style.height).toBe('60px');
  });

  it('hides QRCode element when Website is absent', () => {
    renderCard(card, parseFormat(QRCODE_MD), {});
    expect(card.querySelector('#card-qr-display').style.display).toBe('none');
  });
});
