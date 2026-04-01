import {describe, it, expect} from 'vitest';
import {parseFormat} from '../js/format-parser.js';

const MINIMAL_FORMAT = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "MinimalistProfessional"
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

const TWO_COLUMN_FORMAT = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "TwoCol"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "modern"
- **FontPair**: "lora_lato"
- **BackgroundColor**: "#F0F0F0"
- **Border**: "1px solid #000000"
- **QRCode**: "true"

## Segment: Body
- **Height**: "100%"
- **Columns**: "2"
- **BackgroundColor**: "#EEEEEE"

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

const COMMENT_FORMAT = `# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "WithComment"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "elegant"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"
- **QRCode**: "false"

<!-- Theme "elegant" applies extra visual styling controlled by CSS. -->

## Segment: Identity
- **Height**: "100%"
- **Columns**: "1"

### Column 1
- **Width**: "100%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "18pt"
    - **Style**: "italic"
`;

describe('parseFormat — metadata', () => {
  it('parses version', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.version).toBe('1.0');
  });

  it('parses templateName', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.templateName).toBe('MinimalistProfessional');
  });

  it('parses dimensions into width and height', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.dimensions).toEqual({width: '3.5in', height: '2.0in'});
  });

  it('parses orientation', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.orientation).toBe('landscape');
  });

  it('parses theme', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.theme).toBe('minimal');
  });

  it('parses fontPair', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.fontPair).toBe('default');
  });

  it('parses backgroundColor', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.backgroundColor).toBe('#FFFFFF');
  });

  it('parses border', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.border).toBe('none');
  });

  it('coerces QRCode "false" to boolean false', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.metadata.qrCode).toBe(false);
  });

  it('coerces QRCode "true" to boolean true', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.metadata.qrCode).toBe(true);
  });

  it('parses non-default fontPair', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.metadata.fontPair).toBe('lora_lato');
  });

  it('parses non-default backgroundColor', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.metadata.backgroundColor).toBe('#F0F0F0');
  });

  it('parses border value with spaces', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.metadata.border).toBe('1px solid #000000');
  });
});

describe('parseFormat — segments', () => {
  it('parses two segments', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments).toHaveLength(2);
  });

  it('parses segment name', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].name).toBe('Identity');
    expect(result.segments[1].name).toBe('Contact');
  });

  it('parses segment height', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].height).toBe('55%');
    expect(result.segments[1].height).toBe('45%');
  });

  it('coerces Columns to integer', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columns).toBe(1);
  });

  it('parses segment padding', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].padding).toBe('20px 20px 0px 20px');
    expect(result.segments[1].padding).toBe('0px 20px 20px 20px');
  });

  it('defaults segment backgroundColor to null when absent', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].backgroundColor).toBeNull();
  });

  it('parses segment backgroundColor when present', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.segments[0].backgroundColor).toBe('#EEEEEE');
  });

  it('parses two columns in a segment', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.segments[0].columnDefs).toHaveLength(2);
  });
});

describe('parseFormat — columns', () => {
  it('parses column index', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].index).toBe(1);
  });

  it('parses column width', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].width).toBe('100%');
  });

  it('parses column alignment', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].alignment).toBe('left');
  });

  it('parses right alignment in second column', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.segments[0].columnDefs[1].alignment).toBe('right');
  });

  it('parses items count for identity column', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].items).toHaveLength(3);
  });

  it('parses items count for contact column', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[1].columnDefs[0].items).toHaveLength(3);
  });
});

describe('parseFormat — field items', () => {
  it('parses field name', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].items[0].field).toBe('Name');
    expect(result.segments[0].columnDefs[0].items[1].field).toBe('Title');
    expect(result.segments[0].columnDefs[0].items[2].field).toBe('Company');
  });

  it('parses field size', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].items[0].size).toBe('18pt');
    expect(result.segments[0].columnDefs[0].items[1].size).toBe('11pt');
  });

  it('parses explicit bold style', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].items[0].style).toBe('bold');
  });

  it('defaults style to "normal" when absent', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].items[1].style).toBe('normal');
  });

  it('parses italic style', () => {
    const result = parseFormat(COMMENT_FORMAT);
    expect(result.segments[0].columnDefs[0].items[0].style).toBe('italic');
  });

  it('defaults field alignment to null when absent', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    expect(result.segments[0].columnDefs[0].items[0].alignment).toBeNull();
  });

  it('parses per-field alignment override', () => {
    const result = parseFormat(TWO_COLUMN_FORMAT);
    expect(result.segments[0].columnDefs[0].items[1].alignment).toBe('center');
  });

  it('parses contact field names correctly', () => {
    const result = parseFormat(MINIMAL_FORMAT);
    const contactItems = result.segments[1].columnDefs[0].items;
    expect(contactItems[0].field).toBe('Email');
    expect(contactItems[1].field).toBe('Phone');
    expect(contactItems[2].field).toBe('Website');
  });
});

describe('parseFormat — comments', () => {
  it('skips HTML comment lines without error', () => {
    expect(() => parseFormat(COMMENT_FORMAT)).not.toThrow();
  });

  it('produces correct segment count when comments are present', () => {
    const result = parseFormat(COMMENT_FORMAT);
    expect(result.segments).toHaveLength(1);
    expect(result.segments[0].name).toBe('Identity');
  });
});
