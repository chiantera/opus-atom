/**
 * Orbital Legend Component
 * 
 * Displays legend for orbital colors with toggle functionality.
 */

import { orbitalColors } from '../data/orbitalColors.js';

export class OrbitalLegend {
    constructor(container, onToggle) {
        this.container = container;
        this.onToggle = onToggle;
        this.visibility = { s: true, p: true, d: true, f: true };

        this._render();
        this._attachEventListeners();
    }

    _render() {
        const colorInfo = orbitalColors.getColorInfo();

        this.container.innerHTML = `
      <div class="legend-title">Orbital Types</div>
      ${colorInfo.map(({ letter, name, css }) => `
        <div class="legend-item ${this.visibility[letter] ? '' : 'hidden'}" data-orbital="${letter}">
          <span class="legend-color ${letter}" style="background: ${css}; box-shadow: 0 0 8px ${css};"></span>
          <span class="legend-label">${letter} orbital</span>
        </div>
      `).join('')}
    `;
    }

    _attachEventListeners() {
        this.container.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const orbital = item.dataset.orbital;
                this.visibility[orbital] = !this.visibility[orbital];
                item.classList.toggle('hidden', !this.visibility[orbital]);

                if (this.onToggle) {
                    const l = { s: 0, p: 1, d: 2, f: 3 }[orbital];
                    this.onToggle(l, this.visibility[orbital]);
                }
            });
        });
    }

    setVisibility(orbital, visible) {
        this.visibility[orbital] = visible;
        this._render();
        this._attachEventListeners();
    }
}
