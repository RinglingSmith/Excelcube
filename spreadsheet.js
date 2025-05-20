let rows = 10;
let cols = 10;
let selectedCell = null;

// Create the initial grid
function createGrid() {
  const table = document.getElementById("spreadsheet");
  table.innerHTML = ''; // Clear existing table

  // Create the table rows and cells dynamically
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");

      // Create an input field for each cell
      const input = document.createElement("input");
      input.type = "text";
      input.dataset.row = i;
      input.dataset.col = j;

      // Add click event to select the cell
      input.addEventListener("click", () => selectCell(input));

      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Function to select a cell
function selectCell(cell) {
  selectedCell = cell;
  document.querySelector(".color-picker-container").style.display = "block";
}

// Add table button - creates a new grid
document.getElementById("add-table").addEventListener("click", () => {
  createGrid();
});

// Add row button - adds a new row at the bottom
document.getElementById("add-row").addEventListener("click", () => {
  const table = document.getElementById("spreadsheet");
  const newRow = document.createElement("tr");

  for (let i = 0; i < cols; i++) {
    const newCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.row = rows;
    input.dataset.col = i;
    input.addEventListener("click", () => selectCell(input));
    newCell.appendChild(input);
    newRow.appendChild(newCell);
  }

  table.appendChild(newRow);
  rows++;
});

// Add column button - adds a new column to all rows
document.getElementById("add-column").addEventListener("click", () => {
  const table = document.getElementById("spreadsheet");
  const rowsList = table.getElementsByTagName("tr");

  for (let i = 0; i < rowsList.length; i++) {
    const newCell = document.createElement("td");
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.row = i;
    input.dataset.col = cols;
    input.addEventListener("click", () => selectCell(input));
    newCell.appendChild(input);
    rowsList[i].appendChild(newCell);
  }

  cols++;
});

// Apply color to selected cell
document.getElementById("apply-color").addEventListener("click", () => {
  if (selectedCell) {
    const color = document.getElementById("cell-color").value;
    selectedCell.style.backgroundColor = color;
  }
  document.querySelector(".color-picker-container").style.display = "none";
});

// Cancel color picker
document.getElementById("cancel-color").addEventListener("click", () => {
  document.querySelector(".color-picker-container").style.display = "none";
});

// Initialize the grid on load
createGrid();
