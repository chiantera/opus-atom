/**
 * Application State Management
 * 
 * Central state for the atom visualization,
 * managing element selection and ionization.
 */

import { getElement, generateElectronConfiguration } from '../data/elements.js';

export class AtomState {
    constructor() {
        this.currentSymbol = 'H';
        this.ionizationState = 0;
        this.listeners = [];
        this.orbitalVisibility = { 0: true, 1: true, 2: true, 3: true };
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - Callback function
     */
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    /**
     * Notify all listeners of state change
     */
    _notify(changeType = 'update') {
        const state = this.getState();
        for (const listener of this.listeners) {
            listener(state, changeType);
        }
    }

    /**
     * Get current element data
     */
    getCurrentElement() {
        return getElement(this.currentSymbol);
    }

    /**
     * Set the current element
     * @param {string} symbol - Element symbol
     */
    setElement(symbol) {
        const element = getElement(symbol);
        if (!element) {
            console.warn(`Unknown element: ${symbol}`);
            return;
        }

        this.currentSymbol = symbol;
        this.ionizationState = 0; // Reset ionization on element change
        this._notify('element');
    }

    /**
     * Set ionization state
     * @param {number} state - Ionization state (+N for cation, -N for anion)
     */
    setIonization(state) {
        const element = this.getCurrentElement();
        const maxCation = element.atomicNumber; // Can't remove more electrons than exist
        const maxAnion = -8; // Reasonable limit for anions

        this.ionizationState = Math.max(maxAnion, Math.min(maxCation, state));
        this._notify('ionization');
    }

    /**
     * Get current electron count
     */
    getElectronCount() {
        const element = this.getCurrentElement();
        return Math.max(0, element.atomicNumber - this.ionizationState);
    }

    /**
     * Get current electron configuration
     */
    getElectronConfiguration() {
        return generateElectronConfiguration(this.getElectronCount());
    }

    /**
     * Toggle orbital type visibility
     * @param {number} l - Orbital type (0=s, 1=p, 2=d, 3=f)
     * @param {boolean} visible 
     */
    setOrbitalVisibility(l, visible) {
        this.orbitalVisibility[l] = visible;
        this._notify('visibility');
    }

    /**
     * Get complete state object
     */
    getState() {
        const element = this.getCurrentElement();
        return {
            element,
            ionizationState: this.ionizationState,
            electronCount: this.getElectronCount(),
            configuration: this.getElectronConfiguration(),
            orbitalVisibility: { ...this.orbitalVisibility }
        };
    }
}
