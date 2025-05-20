const ROWS = 20;
const COLS = 10;
const sheet = {}; // stores cell data by ID (like A1)

const container = document.getElementById("spreadsheet");

let selectedCell = null;
let currentTable = {
  startCol: 1,
  startRow: 2,
  cols: 4,
  rows: 6,
};


// Add headers (A, B, C... and 1, 2, 3...)
container.innerHTML = '<div class="header"></div>'; // Top-left corner
for (let c = 0; c < COLS; c++) {
  container.innerHTML += `<div class="header">${String.fromCharCode(65 + c)}</div>`;
}
for (let r = 1; r <= ROWS; r++) {
  container.innerHTML += `<div class="header">${r}</div>`;
  for (let c = 0; c < COLS; c++) {
    const id = `${String.fromCharCode(65 + c)}${r}`;
    container.innerHTML += `<div class="cell" contenteditable="true" data-cell="${id}"></div>`;
  }
}

// Formula evaluation (simple, supports =A1+B2)
function evaluate(cellId, visited = new Set()) {
  const raw = sheet[cellId]?.raw || "";
  if (!raw.startsWith("=")) return raw;

  if (visited.has(cellId)) return "#CYCLE!";
  visited.add(cellId);

  try {
    const expr = raw
      .slice(1)
      .replace(/[A-Z][0-9]+/g, (ref) => {
        const val = evaluate(ref, new Set(visited));
        return isNaN(val) ? 0 : val;
      });
    return eval(expr);
  } catch {
    return "#ERR";
  }
}

// Track selected cell
document.querySelectorAll(".cell").forEach(cell => {
  cell.addEventListener("click", () => {
    selectedCell = cell;
  });
});

// Apply selected color
document.getElementById("apply-color").addEventListener("click", () => {
  const color = document.getElementById("cell-color-picker").value;
  if (selectedCell) {
    selectedCell.style.backgroundColor = color;
  }
});

// Update cell and dependents
function update(cellId) {
  const cell = document.querySelector(`[data-cell="${cellId}"]`);
  const val = sheet[cellId]?.raw || "";
  const evaluated = evaluate(cellId);
  cell.textContent = val.startsWith("=") ? evaluated : val;
}

document.getElementById("format-table").addEventListener("click", () => {
  const startCol = 1;
  const startRow = 2;
  const cols = 4;
  const rows = 6;

  currentTable = { startCol, startRow, cols, rows };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `${String.fromCharCode(65 + startCol + c)}${startRow + r}`;
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
});

document.getElementById("move-table").addEventListener("click", () => {
  const offsetRows = 3;
  const offsetCols = 2;

  const { startCol, startRow, cols, rows } = currentTable;
  const newStartCol = startCol + offsetCols;
  const newStartRow = startRow + offsetRows;

  // Copy current table into new position
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const oldId = `${String.fromCharCode(65 + startCol + c)}${startRow + r}`;
      const newId = `${String.fromCharCode(65 + newStartCol + c)}${newStartRow + r}`;
      const oldCell = document.querySelector(`[data-cell="${oldId}"]`);
      const newCell = document.querySelector(`[data-cell="${newId}"]`);
      if (oldCell && newCell) {
        newCell.textContent = oldCell.textContent;
        newCell.style.backgroundColor = oldCell.style.backgroundColor;
        newCell.style.color = oldCell.style.color;
        newCell.style.fontWeight = oldCell.style.fontWeight;
        newCell.style.border = oldCell.style.border;

        sheet[newId] = { raw: oldCell.textContent };
        oldCell.textContent = "";
        oldCell.removeAttribute("style");
      }
    }
  }

  currentTable.startCol = newStartCol;
  currentTable.startRow = newStartRow;
});

document.getElementById("expand-table").addEventListener("click", () => {
  const { startCol, startRow, cols, rows } = currentTable;

  const newCols = cols + 1;
  const newRows = rows + 1;

  for (let r = 0; r < newRows; r++) {
    for (let c = 0; c < newCols; c++) {
      const cellId = `${String.fromCharCode(65 + startCol + c)}${startRow + r}`;
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
      }
    }
  }

  currentTable.cols = newCols;
  currentTable.rows = newRows;
});


// Event listener
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

    // Update all cells (simple, for demo)
    for (let r = 1; r <= ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        update(`${String.fromCharCode(65 + c)}${r}`);
      }
    }
  });
});
