# Business Card Layout Specification

This document defines the markdown-based format for business card template files used by the business card maker application. A template file describes the visual layout of a card. The actual card content — names, contact details, and so on — is supplied separately as key-value data. The layout engine combines a template with a data set to produce the rendered card.

---

## 1. Overview

### Template vs. Data

A **template file** is a `.md` file conforming to this specification. It defines:

- Card dimensions, orientation, and visual theme
- The arrangement of segments (horizontal bands) and columns within them
- Which data fields appear where, and how they are styled
- Where the logo and QR code appear, at what size, and with what alignment

A **data set** is a flat collection of key-value pairs mapping canonical field names (§2) to string values. The application represents this as JSON:

```json
{
  "Name": "Jane Smith",
  "Title": "Senior Engineer",
  "Company": "Acme Corp",
  "Email": "jane@acme.com",
  "Phone": "+1 (555) 000-0000",
  "Website": "https://acme.com",
  "Logo": "data:image/png;base64,..."
}
```

The layout engine parses the template, resolves each `Field` reference against the data set, and renders the card. Fields absent from the data set or whose values are empty strings are hidden; the remaining items in that column reflow vertically.

### Rendering Pipeline

```
template file (.md)  ─┐
                       ├─→  layout engine  ─→  rendered card
data set (JSON)       ─┘
```

The layout engine:

1. Parses the template into a segment/column/item tree
2. Applies the `Theme` CSS class and `FontPair` to the card container
3. Sets card `BackgroundColor` and `Border` from metadata
4. Builds each segment, column, and item in document order
5. Binds data values to field display elements; hides empty fields
6. Renders `Logo` items using the uploaded logo image; hides if no logo uploaded
7. Renders `QRCode` items generated from the `Website` field; hides if `Website` is empty

Font sizes are set exactly as specified in the template. No automatic scaling is applied.

---

## 2. Canonical Field Names

Only these field names are valid in a `Field` item (§3.4.1).

| Field     | Description                                                         | Required |
|-----------|---------------------------------------------------------------------|----------|
| `Name`    | Full name of the card holder                                        | Yes      |
| `Title`   | Job title or role                                                   | No       |
| `Company` | Company or organization name                                        | No       |
| `Email`   | Email address                                                       | No       |
| `Phone`   | Phone number; US numbers are auto-formatted to `+1 (NXX) NXX-XXXX` | No       |
| `Website` | URL; also used as the QR code source when a `QRCode` item is present | No      |

`Logo` and `QRCode` are column item types (§3.4.4 and §3.4.5), not field names. They are placed in segments and columns just like `Field` items.

---

## 3. Template File Structure

A template file has three levels of structure:

1. **Template Metadata** — a top-level `#` heading followed by a key-value property list
2. **Segments** — `##` headings defining horizontal bands of the card, listed top to bottom
3. **Columns** — `###` headings within each segment, defining side-by-side regions

### 3.1 Template Metadata

The file opens with a single `# Business Card Template` heading followed by a bullet list of metadata properties.

```markdown
# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "ModernMinimalist"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "minimal"
- **FontPair**: "default"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"
- **LineHeight**: "1.3"
```

| Key              | Type / Values                                                     | Required | Default     | Description                                                          |
|------------------|-------------------------------------------------------------------|----------|-------------|----------------------------------------------------------------------|
| `Version`        | `"1.0"`                                                           | Yes      | —           | Format version; must be `"1.0"`                                      |
| `TemplateName`   | string                                                            | Yes      | —           | Unique name for this template                                        |
| `Dimensions`     | `"W × H"` — see §3.1.1                                           | Yes      | —           | Physical card size                                                   |
| `Orientation`    | `"landscape"` \| `"portrait"`                                     | Yes      | —           | Card orientation                                                     |
| `Theme`          | `"minimal"` \| `"modern"` \| `"elegant"`                         | Yes      | —           | Visual theme CSS class applied to the card container                 |
| `FontPair`       | font pair ID — see §3.1.2                                        | Yes      | —           | Google Font pair applied to the card                                 |
| `BackgroundColor`| `#RRGGBB` or CSS color name — see §3.1.3                         | No       | `"white"`   | Card background color                                                |
| `Border`         | `"none"` or CSS border shorthand (e.g. `"1px solid #000000"`)    | No       | `"none"`    | Card border                                                          |
| `LineHeight`     | CSS line-height value (e.g. `"1.3"`, `"1.5"`, `"normal"`)        | No       | `"1"`       | Line height applied to all text elements on the card                 |

#### 3.1.1 Dimensions

Format: `"W × H"` where each value is a number followed immediately by a unit. Supported units:

| Unit | Meaning                                        |
|------|------------------------------------------------|
| `in` | inches                                         |
| `mm` | millimeters                                    |
| `pt` | points (1/72 inch)                             |
| `%`  | percentage of viewport (screen display only)   |

Width and height are always given in that order regardless of `Orientation`. The layout engine rotates the canvas when `Orientation` is `"portrait"`. Standard card sizes:

| Size           | Dimensions            |
|----------------|-----------------------|
| US standard    | `"3.5in × 2.0in"`     |
| ISO CR80       | `"85.6mm × 53.98mm"`  |
| ISO business   | `"85mm × 55mm"`       |

Segment heights and column widths defined as percentages are resolved relative to the card height and width respectively after orientation is applied.

#### 3.1.2 Font Pairs

`FontPair` must be one of the following IDs. Each pair specifies a heading font and a body font drawn from Google Fonts. The `"default"` value uses the browser's system fonts.

| ID                       | Heading Font          | Body Font             |
|--------------------------|-----------------------|-----------------------|
| `default`                | system sans-serif     | system serif          |
| `montserrat_merriweather`| Montserrat            | Merriweather          |
| `playfair_source`        | Playfair Display      | Source Sans Pro       |
| `lora_lato`              | Lora                  | Lato                  |
| `oswald_crimson`         | Oswald                | Crimson Text          |
| `raleway_baskerville`    | Raleway               | Libre Baskerville     |
| `poppins_spectral`       | Poppins               | Spectral              |
| `bebas_opensans`         | Bebas Neue            | Open Sans             |
| `cormorant_roboto`       | Cormorant Garamond    | Roboto                |
| `cinzel_nunito`          | Cinzel                | Nunito Sans           |
| `ebgaramond_worksans`    | EB Garamond           | Work Sans             |

The heading font is applied to `Name`; the body font is applied to all other fields.

#### 3.1.3 Colors

`BackgroundColor` accepts:
- Six-digit hex: `#RRGGBB` (e.g. `"#F5F5F5"`) — three-digit shorthand (`#RGB`) is not supported
- CSS named colors: `"white"`, `"black"`, `"transparent"`, etc.

---

### 3.2 Layout Segments

A segment is a full-width horizontal band. Segments appear in document order, which determines their top-to-bottom stacking on the card.

```markdown
## Segment: Header
- **Height**: "30%"
- **Columns**: "1"
- **BackgroundColor**: "#E0E0E0"
- **Padding**: "2mm"
```

| Key              | Type / Values                        | Required | Default          | Description                                     |
|------------------|--------------------------------------|----------|------------------|-------------------------------------------------|
| `Height`         | dimension value (§3.1.1)             | Yes      | —                | Height of this segment                          |
| `Columns`        | integer ≥ 1                          | Yes      | —                | Number of columns in this segment               |
| `BackgroundColor`| `#RRGGBB` or CSS color name          | No       | inherits card bg | Segment background                              |
| `Padding`        | CSS padding shorthand                | No       | `"0"`            | Inner padding applied to the segment as a whole |

`Padding` uses standard CSS shorthand: one value sets all four sides; two values set top/bottom and left/right; four values set top, right, bottom, left individually.

**Constraint:** The sum of all segment `Height` values must equal 100% of the card height (or the equivalent in mixed units).

---

### 3.3 Columns

Each segment must contain one `### Column N` subsection per column (where N is the 1-based index), immediately following the segment's property list. For a single-column segment, only `### Column 1` is required.

```markdown
### Column 1
- **Width**: "60%"
- **Alignment**: "left"
- **Items**:
  - **Field**: Name
    - **Size**: "12pt"
    - **Style**: "bold"
  - **VPad**:
  - **Field**: Title
    - **Size**: "10pt"

### Column 2
- **Width**: "40%"
- **Alignment**: "right"
- **Items**:
  - **Field**: Phone
    - **Size**: "9pt"
  - **Field**: Email
    - **Size**: "9pt"
```

| Key         | Type / Values                                        | Required | Description                                                    |
|-------------|------------------------------------------------------|----------|----------------------------------------------------------------|
| `Width`     | dimension value (§3.1.1)                             | Yes      | Column width                                                   |
| `Alignment` | `"left"` \| `"center"` \| `"right"`                 | Yes      | Default text alignment for all items in this column            |
| `Items`     | ordered list of column items (§3.4)                  | Yes      | Items displayed in this column, rendered top to bottom         |

**Constraint:** The sum of all `Width` values within a segment must equal 100% of the card width (or the equivalent in mixed units).

---

### 3.4 Column Items

A column's `Items` list may contain five types of item: `Field`, `VSpace`, `VPad`, `Logo`, and `QRCode`. Items render top to bottom in the order listed.

#### 3.4.1 Field

Renders a data field at a specified size. If the field's data value is empty the element is hidden and contributes no vertical space.

```markdown
  - **Field**: Name
    - **Size**: "14pt"
    - **Style**: "bold"
    - **Alignment**: "center"
```

| Key         | Type / Values                                      | Required | Default      | Description                                                     |
|-------------|-----------------------------------------------------|----------|--------------|-----------------------------------------------------------------|
| `Field`     | canonical field name (§2)                           | Yes      | —            | The data field to render                                        |
| `Size`      | `pt` or `px` value (e.g. `"12pt"`, `"16px"`)       | Yes      | —            | Font size; rendered exactly as specified                        |
| `Style`     | space-separated: `"bold"` `"italic"` `"normal"`    | No       | `"normal"`   | Font style; `"normal"` must not be combined with other values   |
| `Alignment` | `"left"` \| `"center"` \| `"right"`                | No       | column value | Overrides the column `Alignment` for this field only            |

#### 3.4.2 VSpace

Inserts a fixed amount of blank vertical space. The space is always rendered regardless of surrounding content.

```markdown
  - **VSpace**: "8px"
```

| Key      | Type / Values                                  | Required | Description                        |
|----------|------------------------------------------------|----------|------------------------------------|
| `VSpace` | `pt` or `px` value (e.g. `"8px"`, `"6pt"`)   | Yes      | Height of the blank space inserted |

#### 3.4.3 VPad

Inserts elastic vertical space that expands to absorb any remaining height in the column. When multiple `VPad` items appear in the same column they share the remaining space equally. If column content already fills or exceeds the available height, `VPad` contributes zero space.

```markdown
  - **VPad**:
```

`VPad` takes no value. Use it to push content toward the bottom of a column, to center content vertically between two `VPad` items, or to evenly distribute groups of fields.

#### 3.4.4 Logo

Renders the uploaded logo image. Hidden when no logo image has been uploaded.

```markdown
  - **Logo**:
    - **Size**: "60px"
    - **Alignment**: "right"
```

| Key         | Type / Values                               | Required | Default      | Description                                                       |
|-------------|---------------------------------------------|----------|--------------|-------------------------------------------------------------------|
| `Size`      | CSS length (e.g. `"60px"`, `"40pt"`)        | No       | natural size | Square dimension — sets both the width and height of the image    |
| `Alignment` | `"left"` \| `"center"` \| `"right"`         | No       | column value | Overrides the column `Alignment` for this item only               |

The logo image is set via the file upload control in the editor. If no image has been uploaded the Logo item is hidden and contributes no vertical space.

#### 3.4.5 QRCode

Renders a QR code generated from the `Website` field value. Hidden when the `Website` field is empty.

```markdown
  - **QRCode**:
    - **Size**: "60px"
    - **Alignment**: "center"
```

| Key         | Type / Values                               | Required | Default  | Description                                                       |
|-------------|---------------------------------------------|----------|----------|-------------------------------------------------------------------|
| `Size`      | CSS length (e.g. `"60px"`, `"40pt"`)        | No       | `"60px"` | Square dimension — sets both the width and height of the QR image |
| `Alignment` | `"left"` \| `"center"` \| `"right"`         | No       | column value | Overrides the column `Alignment` for this item only           |

The QR code is generated from the `Website` field. If the `Website` field is empty the QRCode item is hidden and contributes no vertical space.

---

## 4. Complete Example

```markdown
# Business Card Template
- **Version**: "1.0"
- **TemplateName**: "ModernCreative"
- **Dimensions**: "3.5in × 2.0in"
- **Orientation**: "landscape"
- **Theme**: "modern"
- **FontPair**: "playfair_source"
- **BackgroundColor**: "#FFFFFF"
- **Border**: "none"

## Segment: Identity
- **Height**: "55%"
- **Columns**: "2"
- **Padding**: "20px 20px 0px 20px"

### Column 1
- **Width**: "70%"
- **Alignment**: "center"
- **Items**:
  - **VPad**:
  - **Field**: Name
    - **Size**: "18pt"
    - **Style**: "bold"
  - **Field**: Title
    - **Size**: "11pt"
  - **Field**: Company
    - **Size**: "10pt"
  - **VPad**:

### Column 2
- **Width**: "30%"
- **Alignment**: "center"
- **Items**:
  - **VPad**:
  - **Logo**:
    - **Size**: "50px"
  - **VPad**:

## Segment: Contact
- **Height**: "45%"
- **Columns**: "2"
- **Padding**: "0px 20px 20px 20px"

### Column 1
- **Width**: "70%"
- **Alignment**: "left"
- **Items**:
  - **VPad**:
  - **Field**: Email
    - **Size**: "9pt"
  - **Field**: Phone
    - **Size**: "9pt"
  - **Field**: Website
    - **Size**: "9pt"

### Column 2
- **Width**: "30%"
- **Alignment**: "center"
- **Items**:
  - **VPad**:
  - **QRCode**:
    - **Size**: "50px"
  - **VPad**:
```

---

## 5. Validation Rules

A template file is invalid if any of the following are true:

1. `Version` is absent or not `"1.0"`
2. Any required metadata key is missing
3. `Theme` is not one of the three recognized values
4. `FontPair` is not a recognized ID
5. `Orientation` is not `"landscape"` or `"portrait"`
6. Segment `Height` values do not sum to 100% of card height
7. Column `Width` values within any segment do not sum to 100% of card width
8. The number of `### Column N` subsections does not match the segment's `Columns` value
9. Any `Field` name is not in the canonical list (§2)
10. `Style` contains `"normal"` combined with `"bold"` or `"italic"`
11. A `Dimensions` value uses an unrecognized unit
12. A `VSpace` item is missing its size value
