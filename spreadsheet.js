const ROWS = 30;
const COLS = 25;
const sheet = {}; // Store cell raw values
const container = document.getElementById("spreadsheet");

let selectedCell = null;
let currentTable = {
  startCol: 0,
  startRow: 1,
  cols: 5,
  rows: 10,
};

function getColLabel(n) {
  let label = '';
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label;
    n = Math.floor(n / 26) - 1;
  }
  return label;
}

function colLabelToIndex(label) {
  let index = 0;
  for (let i = 0; i < label.length; i++) {
    index = index * 26 + (label.charCodeAt(i) - 64);
  }
  return index - 1;
}

// Create the static grid (cells are reused)
function buildGrid() {
  container.innerHTML = '';

  const headerRow = document.createElement('div');
  headerRow.classList.add('header-row');
  container.appendChild(headerRow);

  const corner = document.createElement('div');
  corner.classList.add('corner');
  headerRow.appendChild(corner);

  // Column Headers
  for (let c = 0; c < COLS; c++) {
    const colHeader = document.createElement('div');
    colHeader.classList.add('header');
    headerRow.appendChild(colHeader);
  }

  // Row Headers and Cells
  for (let r = 0; r < ROWS; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    container.appendChild(rowDiv);

    const rowHeader = document.createElement('div');
    rowHeader.classList.add('header');
    rowDiv.appendChild(rowHeader);

    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('contenteditable', 'true');
      rowDiv.appendChild(cell);
    }
  }
}

function updateVisibleTable() {
  const { startCol, startRow } = currentTable;
  const rows = container.querySelectorAll('.row');
  const headerRow = container.querySelector('.header-row');

  // Update column headers
  for (let c = 0; c < COLS; c++) {
    const colHeader = headerRow.children[c + 1];
    colHeader.textContent = getColLabel(startCol + c);
  }

  // Update rows
  for (let r = 0; r < ROWS; r++) {
    const row = rows[r];
    const rowHeader = row.children[0];
    const rowIndex = startRow + r;
    rowHeader.textContent = rowIndex;

    for (let c = 0; c < COLS; c++) {
      const cell = row.children[c + 1];
      const colIndex = startCol + c;
      const cellId = `${getColLabel(colIndex)}${rowIndex}`;
      cell.dataset.cell = cellId;

      const val = sheet[cellId]?.raw || '';
      cell.textContent = val;

      // Cell listeners
      cell.onfocus = () => {
        const raw = sheet[cellId]?.raw;
        if (raw) cell.textContent = raw;
      };

      cell.onblur = () => {
        const raw = cell.textContent.trim();
        sheet[cellId] = { raw };
        cell.textContent = raw.startsWith('=') ? evaluate(cellId) : raw;
      };
    }
  }
}

function evaluate(cellId, visited = new Set()) {
  const raw = sheet[cellId]?.raw || '';
  if (!raw.startsWith('=')) return raw;

  if (visited.has(cellId)) return '#CYCLE!';
  visited.add(cellId);

  try {
    const expr = raw
      .slice(1)
      .replace(/[A-Z]+[0-9]+/g, (ref) => {
        const val = evaluate(ref, new Set(visited));
        return isNaN(val) ? 0 : val;
      });
    return eval(expr);
  } catch {
    return '#ERR';
  }
}

// === Topbar Controls ===

// Delete table content
document.getElementById("delete-table")?.addEventListener("click", () => {
  const { startCol, startRow, cols, rows } = currentTable;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rowIndex = startRow + r;
      const colIndex = startCol + c;
      const cellId = `${getColLabel(colIndex)}${rowIndex}`;

      // Clear value from sheet
      delete sheet[cellId];
    }
  }

  updateVisibleTable();
});

// Format table with headers
document.getElementById("format-table")?.addEventListener("click", () => {
  const { startCol, startRow, cols, rows } = currentTable;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rowIndex = startRow + r;
      const colIndex = startCol + c;
      const cellId = `${getColLabel(colIndex)}${rowIndex}`;
      sheet[cellId] = {
        raw: r === 0 ? `Header ${c + 1}` : "",
      };
    }
  }

  updateVisibleTable();
});

// Expand table size
document.getElementById("expand-table")?.addEventListener("click", () => {
  currentTable.cols += 1;
  currentTable.rows += 1;
  updateVisibleTable();
});

// Apply color to selected cell
document.getElementById("apply-color")?.addEventListener("click", () => {
  const color = document.getElementById("cell-color-picker").value;
  if (selectedCell) {
    selectedCell.style.backgroundColor = color;
  }
});

// Track selected cell for color application
container.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (cell && cell.dataset.cell) {
    selectedCell = cell;
  }
});

// === Right-click drag to move table window ===

let isRightDragging = false;
let lastX = 0;
let lastY = 0;

container.addEventListener('mousedown', (e) => {
  if (e.button === 2) { // Right click
    isRightDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    e.preventDefault();
  }
});

document.addEventListener('mousemove', (e) => {
  if (!isRightDragging) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    const offsetCols = Math.sign(dx);
    const offsetRows = Math.sign(dy);

    const newStartCol = Math.max(0, currentTable.startCol - offsetCols);
    const newStartRow = Math.max(1, currentTable.startRow - offsetRows);

    currentTable.startCol = newStartCol;
    currentTable.startRow = newStartRow;

    updateVisibleTable();

    lastX = e.clientX;
    lastY = e.clientY;
  }
});

document.addEventListener('mouseup', () => {
  isRightDragging = false;
});

// Disable context menu
container.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

// === Initialize ===
buildGrid();
updateVisibleTable();
