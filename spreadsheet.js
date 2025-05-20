const ROWS = 20;
const COLS = 10;
const sheet = {}; // stores cell data by ID (like A1)

const container = document.getElementById("spreadsheet");

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

// Update cell and dependents
function update(cellId) {
  const cell = document.querySelector(`[data-cell="${cellId}"]`);
  const val = sheet[cellId]?.raw || "";
  const evaluated = evaluate(cellId);
  cell.textContent = val.startsWith("=") ? evaluated : val;
}

document.getElementById("insert-table").addEventListener("click", () => {
  const startCol = 1; // B (0-indexed: A=0, B=1)
  const startRow = 2; // Row 2

  const cols = 3;
  const rows = 5;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `${String.fromCharCode(65 + startCol + c)}${startRow + r}`;
      const cell = document.querySelector(`[data-cell="${cellId}"]`);
      if (cell) {
        cell.style.border = "2px solid #007bff";
        cell.style.backgroundColor = r === 0 ? "#cce5ff" : "#f8f9fa"; // Header row
        cell.textContent = r === 0 ? `Col ${c + 1}` : "";
        sheet[cellId] = { raw: cell.textContent };
      }
    }
  }
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
