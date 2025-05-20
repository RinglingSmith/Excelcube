const ROWS = 20;
const COLS = 10;
const sheet = {}; // Stores cell data
const container = document.getElementById("spreadsheet");

let selectedCell = null;
let currentTable = {
  startCol: 1,
  startRow: 2,
  cols: 4,
  rows: 6,
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
    index *= 26;
    index += label.charCodeAt(i) - 65 + 1;
  }
  return index - 1;
}

// Clear existing table and then create new one
container.innerHTML = ''; 

const headerRow = document.createElement('div');
headerRow.classList.add('header-row');
container.appendChild(headerRow);

for (let c = 0; c < COLS; c++) {
  const colHeader = document.createElement('div');
  colHeader.classList.add('header');
  colHeader.textContent = getColLabel(c);
  headerRow.appendChild(colHeader);
}

// Create rows and cells
for (let r = 1; r <= ROWS; r++) {
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');
  container.appendChild(rowDiv);

  const rowHeader = document.createElement('div');
  rowHeader.classList.add('header');
  rowHeader.textContent = r;
  rowDiv.appendChild(rowHeader);

  for (let c = 0; c < COLS; c++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('contenteditable', 'true');
    const cellId = `${getColLabel(c)}${r}`;
    cell.setAttribute('data-cell', cellId);
    rowDiv.appendChild(cell);
  }
}

function evaluate(cellId, visited = new Set()) {
  const raw = sheet[cellId]?.raw || "";
  if (!raw.startsWith("=")) return raw;

  if (visited.has(cellId)) return "#CYCLE!";
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
    return "#ERR";
  }
}

document.querySelectorAll(".cell").forEach(cell => {
  cell.addEventListener("click", () => {
    selectedCell = cell;
  });
});

document.getElementById("apply-color").addEventListener("click", () => {
  const color = document.getElementById("cell-color-picker").value;
  if (selectedCell) {
    selectedCell.style.backgroundColor = color;
  }
});

function update(cellId) {
  const cell = document.querySelector(`[data-cell="${cellId}"]`);
  const val = sheet[cellId]?.raw || "";
  const evaluated = evaluate(cellId);
  cell.textContent = val.startsWith("=") ? evaluated : val;
}

function formatTable() {
  const { startCol, startRow, cols, rows } = currentTable;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `${getColLabel(startCol + c)}${startRow + r}`;
      const cell = document.querySelector(`[data-cell="${cellId}"]`);
      if (cell) {
        if (r === 0) {
          cell.style.backgroundColor = "#007bff";
          cell.style.color = "#fff";
          cell.style.fontWeight = "bold";
          cell.textContent = `Header ${c + 1}`;
        } else {
          cell.style.backgroundColor = "#f2f2f2";
        }
        cell.style.border = "2px solid #999";
        sheet[cellId] = { raw: cell.textContent };
      }
    }
  }
}

document.getElementById("format-table").addEventListener("click", () => {
  currentTable = { startCol: 1, startRow: 2, cols: 4, rows: 6 };
  formatTable();
});

document.getElementById("expand-table").addEventListener("click", () => {
  currentTable.cols += 1;
  currentTable.rows += 1;
  formatTable();
});

document.querySelectorAll(".cell").forEach((cell) => {
  const id = cell.dataset.cell;

  cell.addEventListener("focus", () => {
    const raw = sheet[id]?.raw;
    if (raw) cell.textContent = raw;
  });

  cell.addEventListener("blur", () => {
    const raw = cell.textContent.trim();
    sheet[id] = { raw };
    update(id);

    for (let r = 1; r <= ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        update(`${getColLabel(c)}${r}`);
      }
    }
  });
});

// === Drag-to-Move Table ===

let isDraggingTable = false;
let dragStartX = 0;
let dragStartY = 0;

container.addEventListener("mousedown", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const cellId = cell.dataset.cell;
  if (!cellId) return;

  const colLabel = cellId.match(/[A-Z]+/)[0];
  const rowNumber = parseInt(cellId.match(/[0-9]+/)[0]);

  const colIndex = colLabelToIndex(colLabel);
  const rowIndex = rowNumber;

  const { startCol, startRow, cols, rows } = currentTable;

  if (
    colIndex >= startCol &&
    colIndex < startCol + cols &&
    rowIndex >= startRow &&
    rowIndex < startRow + rows
  ) {
    isDraggingTable = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }
});

container.addEventListener("mousemove", (e) => {
  if (!isDraggingTable) return;

  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    // Smoothly move the table based on mouse movement
    const offsetCols = dx / 60;  // Instead of rounding, keep it proportional
    const offsetRows = dy / 25;  // Adjust this value for smoother movement

    moveTableBy(offsetCols, offsetRows);
    
    // Update the starting points for the next move
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  }
});

container.addEventListener("mouseup", () => {
  isDraggingTable = false;
});

function moveTableBy(offsetCols, offsetRows) {
  const { startCol, startRow, cols, rows } = currentTable;

  const newStartCol = startCol + offsetCols;
  const newStartRow = startRow + offsetRows;

  // Prevent the table from going out of bounds
  if (newStartCol < 0 || newStartRow < 1) return;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const oldId = `${getColLabel(startCol + c)}${startRow + r}`;
      const newId = `${getColLabel(Math.round(newStartCol + c))}${Math.round(newStartRow + r)}`;  // Round to nearest integer for display
      const oldCell = document.querySelector(`[data-cell="${oldId}"]`);
      const newCell = document.querySelector(`[data-cell="${newId}"]`);

      if (oldCell && newCell) {
        // Copy the content and styles
        newCell.textContent = oldCell.textContent;
        newCell.style.backgroundColor = oldCell.style.backgroundColor;
        newCell.style.color = oldCell.style.color;
        newCell.style.fontWeight = oldCell.style.fontWeight;
        newCell.style.border = oldCell.style.border;

        sheet[newId] = { raw: oldCell.textContent };
        delete sheet[oldId];

        // Clear the old cell
        oldCell.textContent = "";
        oldCell.removeAttribute("style");

        // If the selected cell was in the old position, reset it
        if (selectedCell && selectedCell.dataset.cell === oldId) {
          selectedCell = null;
        }
      }
    }
  }

  currentTable.startCol = Math.round(newStartCol);  // Round to nearest integer
  currentTable.startRow = Math.round(newStartRow);  // Round to nearest integer
}