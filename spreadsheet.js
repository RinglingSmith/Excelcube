// Create a grid with 10 rows and 10 columns
const rows = 10;
const cols = 10;

function createGrid() {
  const table = document.getElementById("spreadsheet");

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

      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Initialize the spreadsheet
createGrid();
