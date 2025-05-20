const rows = 30;
const cols = 24;
let selectedCell = null;

// Function to create a new grid/table
function createGrid() {
  const table = document.getElementById("spreadsheet");

  // Clear existing table
  table.innerHTML = '';

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

      // Add click event for selecting a cell
      input.addEventListener("click", () => selectCell(input));

      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Select a cell and display the color picker
function selectCell(cell) {
  selectedCell = cell;
  document.querySelector(".color-picker-container").style.display = "block";
}

// Add new table
document.getElementById("add-table").addEventListener("click", () => {
  createGrid();
});

// Add new row to the table
document.getElementById("add-row").addEventListener("click", () => {
  const table = document.getElementById("spreadsheet");
  const newRow = document.createElement("tr");

  // Create new cells for the new row
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
});

// Add new column to the table
document.getElementById("add-column").addEventListener("click", () => {
  const table = document.getElementById("spreadsheet");
  const rowsList = table.getElementsByTagName("tr");

  // Add new cell in each row
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

// Change the background color of a cell
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

// Initial grid
createGrid();

