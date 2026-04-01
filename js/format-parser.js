/**
 * Parses a business card format markdown string into a structured object.
 */

/**
 * Strips surrounding double-quotes from a string value if present.
 * @param {string} raw
 * @returns {string}
 */
function stripQuotes(raw) {
  return raw.replace(/^"|"$/g, '').trim();
}

/**
 * Parses a dimension string like "3.5in × 2.0in" into {width, height}.
 * @param {string} value
 * @returns {{width: string, height: string}}
 */
function parseDimensions(value) {
  const parts = value.split(/\s*[×x]\s*/);
  return {width: parts[0].trim(), height: parts[1].trim()};
}

/**
 * Sets a property on the metadata object, coercing types as needed.
 * @param {Object} metadata
 * @param {string} key
 * @param {string} value - already stripped of outer quotes
 */
function applyMetadataProp(metadata, key, value) {
  switch (key) {
    case 'Version':        metadata.version = value; break;
    case 'TemplateName':   metadata.templateName = value; break;
    case 'Dimensions':     metadata.dimensions = parseDimensions(value); break;
    case 'Orientation':    metadata.orientation = value; break;
    case 'Theme':          metadata.theme = value; break;
    case 'FontPair':       metadata.fontPair = value; break;
    case 'BackgroundColor': metadata.backgroundColor = value; break;
    case 'Border':         metadata.border = value; break;
    case 'QRCode':         metadata.qrCode = value === 'true'; break;
  }
}

/**
 * Sets a property on a segment object.
 * @param {Object} segment
 * @param {string} key
 * @param {string} value
 */
function applySegmentProp(segment, key, value) {
  switch (key) {
    case 'Height':          segment.height = value; break;
    case 'Columns':         segment.columns = parseInt(value, 10); break;
    case 'BackgroundColor': segment.backgroundColor = value; break;
    case 'Padding':         segment.padding = value; break;
  }
}

/**
 * Sets a property on a column object.
 * @param {Object} column
 * @param {string} key
 * @param {string} value
 */
function applyColumnProp(column, key, value) {
  switch (key) {
    case 'Width':     column.width = value; break;
    case 'Alignment': column.alignment = value; break;
  }
}

/**
 * Parses the Items block starting at line index i.
 * Returns {items, nextIndex}.
 * @param {string[]} lines
 * @param {number} i - index of the line after "- **Items**:"
 * @returns {{items: Array, nextIndex: number}}
 */
function parseItems(lines, i) {
  const items = [];
  let currentItem = null;

  while (i < lines.length) {
    const line = lines[i];

    // Exit items block when we encounter a non-indented, non-empty line
    if (line.length > 0 && !line.startsWith(' ')) break;

    // 2-space indent: Field declaration
    const fieldMatch = line.match(/^ {2}-\s+\*\*Field\*\*:\s*(.+)/);
    if (fieldMatch) {
      currentItem = {
        field: fieldMatch[1].trim(),
        size: null,
        style: 'normal',
        alignment: null,
      };
      items.push(currentItem);
      i++;
      continue;
    }

    // 4-space indent: field property
    const propMatch = line.match(/^ {4}-\s+\*\*(.+?)\*\*:\s*(.*)/);
    if (propMatch && currentItem) {
      const key = propMatch[1];
      const value = stripQuotes(propMatch[2]);
      switch (key) {
        case 'Size':      currentItem.size = value; break;
        case 'Style':     currentItem.style = value; break;
        case 'Alignment': currentItem.alignment = value; break;
      }
      i++;
      continue;
    }

    i++;
  }

  return {items, nextIndex: i};
}

/**
 * Parses a business card format markdown string into a structured object.
 * @param {string} markdown - The full content of a format .md file.
 * @returns {{metadata: Object, segments: Array}}
 */
export function parseFormat(markdown) {
  const lines = markdown.split('\n');
  const result = {
    metadata: {
      version: null,
      templateName: null,
      dimensions: null,
      orientation: 'landscape',
      theme: 'minimal',
      fontPair: 'default',
      backgroundColor: '#FFFFFF',
      border: 'none',
      qrCode: false,
    },
    segments: [],
  };

  let currentSegment = null;
  let currentColumn = null;
  // Context: 'metadata' | 'segment' | 'column'
  let context = 'metadata';

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip HTML comments (single-line)
    if (line.trimStart().startsWith('<!--')) {
      i++;
      continue;
    }

    // Top-level heading — marks start of metadata section
    if (line.startsWith('# ')) {
      context = 'metadata';
      i++;
      continue;
    }

    // Segment heading: ## Segment: Name
    const segmentMatch = line.match(/^## Segment:\s*(.+)/);
    if (segmentMatch) {
      currentSegment = {
        name: segmentMatch[1].trim(),
        height: null,
        columns: 1,
        backgroundColor: null,
        padding: '0',
        columnDefs: [],
      };
      result.segments.push(currentSegment);
      currentColumn = null;
      context = 'segment';
      i++;
      continue;
    }

    // Column heading: ### Column N
    const columnMatch = line.match(/^### Column\s+(\d+)/);
    if (columnMatch && currentSegment) {
      currentColumn = {
        index: parseInt(columnMatch[1], 10),
        width: null,
        alignment: 'left',
        items: [],
      };
      currentSegment.columnDefs.push(currentColumn);
      context = 'column';
      i++;
      continue;
    }

    // Property line: - **Key**: value  (or "value")
    const propMatch = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.*)/);
    if (propMatch) {
      const key = propMatch[1];
      const raw = propMatch[2].trim();
      const value = stripQuotes(raw);

      if (key === 'Items') {
        // Items block begins on the next lines
        i++;
        const {items, nextIndex} = parseItems(lines, i);
        if (currentColumn) {
          currentColumn.items = items;
        }
        i = nextIndex;
        continue;
      }

      if (context === 'metadata') {
        applyMetadataProp(result.metadata, key, value);
      } else if (context === 'segment' && currentSegment) {
        applySegmentProp(currentSegment, key, value);
      } else if (context === 'column' && currentColumn) {
        applyColumnProp(currentColumn, key, value);
      }
      i++;
      continue;
    }

    i++;
  }

  return result;
}
