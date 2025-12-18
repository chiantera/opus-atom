/**
 * Periodic Table UI Component
 * 
 * Renders an interactive periodic table for element selection.
 */

import { elements, periodicTableLayout, getElement } from '../data/elements.js';

export class PeriodicTable {
    constructor(container, onElementSelect) {
        this.container = container;
        this.onElementSelect = onElementSelect;
        this.selectedSymbol = null;

        this._render();
        this._attachEventListeners();
    }

    _render() {
        this.container.innerHTML = `
      <div class="periodic-grid" id="periodic-grid"></div>
    `;

        const grid = this.container.querySelector('#periodic-grid');

        // Create 10 rows x 18 columns grid
        const cells = new Array(10).fill(null).map(() => new Array(18).fill(null));

        // Place elements in grid
        for (const { symbol, row, col } of periodicTableLayout) {
            cells[row][col] = symbol;
        }

        // Render grid
        for (let row = 0; row < 10; row++) {
            // Skip row 7 (gap between main table and lanthanides/actinides)
            if (row === 7) {
                for (let col = 0; col < 18; col++) {
                    const spacer = document.createElement('div');
                    spacer.className = 'element-cell empty';
                    spacer.style.height = '10px';
                    grid.appendChild(spacer);
                }
                continue;
            }

            for (let col = 0; col < 18; col++) {
                const symbol = cells[row][col];

                if (symbol) {
                    const element = elements[symbol];
                    const cell = document.createElement('div');
                    cell.className = 'element-cell';
                    cell.dataset.symbol = symbol;
                    cell.dataset.category = element.category;
                    cell.innerHTML = `
            <span class="cell-number">${element.atomicNumber}</span>
            <span class="cell-symbol">${symbol}</span>
          `;
                    cell.title = element.name;
                    grid.appendChild(cell);
                } else {
                    const empty = document.createElement('div');
                    empty.className = 'element-cell empty';
                    grid.appendChild(empty);
                }
            }
        }
    }

    _attachEventListeners() {
        const grid = this.container.querySelector('#periodic-grid');

        grid.addEventListener('click', (e) => {
            const cell = e.target.closest('.element-cell');
            if (cell && !cell.classList.contains('empty')) {
                const symbol = cell.dataset.symbol;
                this.selectElement(symbol);
            }
        });
    }

    selectElement(symbol) {
        // Update visual selection
        const cells = this.container.querySelectorAll('.element-cell');
        cells.forEach(cell => {
            cell.classList.toggle('selected', cell.dataset.symbol === symbol);
        });

        this.selectedSymbol = symbol;

        // Notify parent
        if (this.onElementSelect) {
            this.onElementSelect(symbol);
        }
    }

    getSelectedElement() {
        return this.selectedSymbol ? getElement(this.selectedSymbol) : null;
    }
}
