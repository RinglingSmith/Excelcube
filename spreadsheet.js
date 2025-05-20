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

document.getElementById("format-table").addEventListener("click", () => {
  const startCol = 1; // Column B (0-indexed)
  const startRow = 2; // Row 2
  const cols = 4;
  const rows = 6;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellId = `${String.fromCharCode(65 + startCol + c)}${startRow + r}`;
      const cell = document.querySelector(`[data-cell="${cellId}"]`);
      if (cell) {
        // Header row styling
        if (r === 0) {
          cell.style.backgroundColor = "#007bff";
          cell.style.color = "#fff";
          cell.style.fontWeight = "bold";
          cell.textContent = `Header ${c + 1}`;
          sheet[cellId] = { raw: cell.textContent };
        } else {
          // Body row styling
          cell.style.backgroundColor = "#f2f2f2";
        }

        // Add border to all
        cell.style.border = "2px solid #999";
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
