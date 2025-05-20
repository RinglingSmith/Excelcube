 const excelCells = document.querySelectorAll('.excel-cell input');
        
        excelCells.forEach(cell => {
            cell.addEventListener('blur', (e) => {
                const inputValue = e.target.value;
                const cellRow = e.target.closest('.excel-cell').getAttribute('data-row');
                const cellCol = e.target.closest('.excel-cell').getAttribute('data-col');
                
                console.log(`Row: ${cellRow}, Column: ${cellCol}, Value: ${inputValue}`);
            });
        });