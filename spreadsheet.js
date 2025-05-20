let rows = 7;
let cols = 5;
let selectedCell = null;

function getColumnLetter(index) {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

function createGrid() {
  const table = document.getElementById("spreadsheet");
  table.innerHTML = '';

  // Create header row
  const headerRow = document.createElement("tr");
  const cornerCell = document.createElement("th"); // Top-left empty corner
  headerRow.appendChild(cornerCell);

  for (let j = 0; j < cols; j++) {
    const th = document.createElement("th");
    th.textContent = getColumnLetter(j);
    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  // Create the rest of the grid
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");

    const rowHeader = document.createElement("th");
    rowHeader.textContent = i + 1;
    row.appendChild(rowHeader);

    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");

      const input = document.createElement("input");
      input.type = "text";
      input.dataset.row = i;
      input.dataset.col = j;

      input.addEventListener("click", () => selectCell(input));

      cell.appendChild(input);
      row.appendChild(cell);
    }

    table.appendChild(row);
  }
}

function selectCell(cell) {
  selectedCell = cell;
  document.querySelector(".color-picker-container").style.display = "block";
}

document.getElementById("add-table").addEventListener("click", createGrid);

document.getElementById("add-row").addEventListener("click", () => {
  const table = document.getElementById("spreadsheet");

  const row = document.createElement("tr");
  const rowHeader = document.createElement("th");
  rowHeader.textContent = rows + 1;
  row.appendChild(rowHeader);

  for (let j = 0; j < cols; j++) {
    const cell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.row = rows;
    input.dataset.col = j;
    input.addEventListener("click", () => selectCell(input));
    cell.appendChild(input);
    row.appendChild(cell);
  }

  table.appendChild(row);
  rows++;
});

document.getElementById("add-column").addEventListener("click", () => {
  const table = document.getElementById("spreadsheet");
  const allRows = table.getElementsByTagName("tr");

  // Add header cell
  const headerCell = document.createElement("th");
  headerCell.textContent = getColumnLetter(cols);
  allRows[0].appendChild(headerCell);

  // Add input cells
  for (let i = 1; i < allRows.length; i++) {
    const cell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.row = i - 1;
    input.dataset.col = cols;
    input.addEventListener("click", () => selectCell(input));
    cell.appendChild(input);
    allRows[i].appendChild(cell);
  }

  cols++;
});

document.getElementById("apply-color").addEventListener("click", () => {
  if (selectedCell) {
    const color = document.getElementById("cell-color").value;
    selectedCell.style.backgroundColor = color;
  }
  document.querySelector(".color-picker-container").style.display = "none";
});

document.getElementById("cancel-color").addEventListener("click", () => {
  document.querySelector(".color-picker-container").style.display = "none";
});

// Initialize grid on load
createGrid();
