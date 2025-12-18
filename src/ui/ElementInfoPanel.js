/**
 * Element Info Panel
 * 
 * Displays detailed information about the currently selected element,
 * including electron configuration and ionization controls.
 */

import { formatConfiguration, generateElectronConfiguration } from '../data/elements.js';
import { getCSSColor, getOrbitalLetter } from '../data/orbitalColors.js';

export class ElementInfoPanel {
  constructor(container, state) {
    this.container = container;
    this.state = state;

    // Subscribe to state changes
    this.state.subscribe(this._onStateChange.bind(this));

    this._render();
  }

  _render() {
    const element = this.state.getCurrentElement();
    const ionState = this.state.ionizationState;
    const electronCount = element.atomicNumber - ionState;
    const config = generateElectronConfiguration(Math.max(0, electronCount));

    // Format ion display
    let ionDisplay = '';
    let ionClass = 'neutral';
    if (ionState > 0) {
      ionDisplay = ionState === 1 ? '+' : `${ionState}+`;
      ionClass = 'positive';
    } else if (ionState < 0) {
      ionDisplay = ionState === -1 ? '−' : `${Math.abs(ionState)}−`;
      ionClass = 'negative';
    }

    this.container.innerHTML = `
      <div class="element-header">
        <div class="element-symbol">${element.symbol}</div>
        <div class="element-details">
          <div class="element-name">${element.name}${ionDisplay ? `<sup>${ionDisplay}</sup>` : ''}</div>
          <div class="element-number">Z = ${element.atomicNumber}</div>
        </div>
      </div>
      
      <div class="element-config">
        <div class="config-label">Nucleus</div>
        <div class="config-value">
          <span style="color: #ff4444;">●</span> ${element.atomicNumber} protons
          <span style="color: #4488ff; margin-left: 8px;">●</span> ${this._getNeutronCount(element.atomicNumber)} neutrons
        </div>
      </div>
      
      <div class="element-config">
        <div class="config-label">Electron Configuration</div>
        <div class="config-value">${electronCount > 0 ? formatConfiguration(config) : 'No electrons'}</div>
      </div>
      
      <div class="ion-controls">
        <button class="ion-btn" id="ion-minus" title="Remove electron (form cation)" ${electronCount <= 0 ? 'disabled' : ''}>−</button>
        <span class="ion-state ${ionClass}">${ionState === 0 ? 'Neutral' : ionDisplay}</span>
        <button class="ion-btn" id="ion-plus" title="Add electron (form anion)">+</button>
      </div>
      
      <div class="element-config" style="margin-top: 12px;">
        <div class="config-label">Electrons</div>
        <div class="config-value">${electronCount}</div>
      </div>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    const minusBtn = this.container.querySelector('#ion-minus');
    const plusBtn = this.container.querySelector('#ion-plus');

    if (minusBtn) {
      minusBtn.addEventListener('click', () => {
        this.state.setIonization(this.state.ionizationState + 1);
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener('click', () => {
        this.state.setIonization(this.state.ionizationState - 1);
      });
    }
  }

  _onStateChange() {
    this._render();
  }

  _getNeutronCount(atomicNumber) {
    // Common isotope neutron counts (most stable/abundant)
    const neutronCounts = {
      1: 0, 2: 2, 3: 4, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 10, 10: 10,
      11: 12, 12: 12, 13: 14, 14: 14, 15: 16, 16: 16, 17: 18, 18: 22,
      19: 20, 20: 20, 21: 24, 22: 26, 23: 28, 24: 28, 25: 30, 26: 30,
      27: 32, 28: 30, 29: 34, 30: 34, 31: 38, 32: 40, 33: 42, 34: 46,
      35: 44, 36: 48, 37: 48, 38: 50, 39: 50, 40: 50, 41: 52, 42: 54,
      43: 55, 44: 57, 45: 58, 46: 60, 47: 60, 48: 64, 49: 66, 50: 70,
      51: 70, 52: 76, 53: 74, 54: 77, 55: 78, 56: 81, 57: 82, 58: 82,
      59: 82, 60: 84, 61: 84, 62: 88, 63: 89, 64: 93, 65: 94, 66: 96,
      67: 98, 68: 99, 69: 100, 70: 103, 71: 104, 72: 106, 73: 108,
      74: 110, 75: 111, 76: 114, 77: 115, 78: 117, 79: 118, 80: 121,
      81: 123, 82: 126, 83: 126, 84: 125, 85: 125, 86: 136, 87: 136,
      88: 138, 89: 138, 90: 142, 91: 140, 92: 146
    };
    return neutronCounts[atomicNumber] !== undefined
      ? neutronCounts[atomicNumber]
      : Math.round(atomicNumber * 1.5);
  }
}
