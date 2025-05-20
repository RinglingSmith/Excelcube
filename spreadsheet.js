 // Add Row to the Table
    function addRow() {
        let table = document.getElementById("excelTable");
        let newRow = table.insertRow(table.rows.length);
        let cellCount = table.rows[0].cells.length;
        for (let i = 0; i < cellCount; i++) {
            let newCell = newRow.insertCell(i);
            newCell.contentEditable = "true";
        }
    }

    // Add Column to the Table
    function addColumn() {
        let table = document.getElementById("excelTable");
        for (let i = 0; i < table.rows.length; i++) {
            let newCell = table.rows[i].insertCell(table.rows[i].cells.length);
            newCell.contentEditable = "true";
        }
    }

    // Context Menu to change cell color or delete a cell
    let currentCell = null;

    document.addEventListener("contextmenu", function(event) {
        if (event.target.tagName === "TD") {
            event.preventDefault();
            currentCell = event.target;
            showContextMenu(event.clientX, event.clientY);
        }
    });

    function showContextMenu(x, y) {
        const menu = document.getElementById("contextMenu");
        menu.style.display = "block";
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    }

    function hideContextMenu() {
        const menu = document.getElementById("contextMenu");
        menu.style.display = "none";
    }

    document.addEventListener("click", hideContextMenu);

    // Change the background color of the current cell
    function changeCellColor() {
        if (currentCell) {
            currentCell.style.backgroundColor = prompt("Enter color (e.g., 'red', '#ff0000'):");
        }
        hideContextMenu();
    }

    // Delete the current cell
    function deleteCell() {
        if (currentCell) {
            currentCell.innerText = '';
        }
        hideContextMenu();
    }

    // Move the table by dragging it with right-click (long press to drag)
    let isDragging = false;
    let offsetX, offsetY;

    const table = document.getElementById("excelTable");

    table.addEventListener("mousedown", function(event) {
        if (event.button === 2) { // Right-click
            isDragging = true;
            offsetX = event.clientX - table.offsetLeft;
            offsetY = event.clientY - table.offsetTop;
            document.addEventListener("mousemove", dragTable);
            document.addEventListener("mouseup", stopDragging);
        }
    });

    function dragTable(event) {
        if (isDragging) {
            table.style.position = "absolute";
            table.style.left = `${event.clientX - offsetX}px`;
            table.style.top = `${event.clientY - offsetY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener("mousemove", dragTable);
        document.removeEventListener("mouseup", stopDragging);
    }

    // Disable right-click context menu on the entire page
    document.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });
