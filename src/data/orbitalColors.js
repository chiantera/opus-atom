/**
 * Orbital Colors
 * 
 * Color scheme for different orbital types (s, p, d, f)
 * with utility functions for color generation.
 */

import * as THREE from 'three';

// HSL-based color definitions for each orbital type
export const orbitalColorDefinitions = {
    s: { hue: 210, saturation: 80, lightness: 60, name: 'Blue' },
    p: { hue: 145, saturation: 70, lightness: 55, name: 'Green' },
    d: { hue: 35, saturation: 90, lightness: 55, name: 'Orange' },
    f: { hue: 280, saturation: 70, lightness: 60, name: 'Purple' },
    g: { hue: 0, saturation: 80, lightness: 55, name: 'Red' }
};

// Orbital type letters
const orbitalLetters = ['s', 'p', 'd', 'f', 'g'];

/**
 * Get THREE.Color for an orbital type
 * @param {number} l - Azimuthal quantum number (0=s, 1=p, 2=d, 3=f)
 * @returns {THREE.Color}
 */
export function getColor(l) {
    const letter = orbitalLetters[l] || 's';
    const def = orbitalColorDefinitions[letter];

    const color = new THREE.Color();
    color.setHSL(def.hue / 360, def.saturation / 100, def.lightness / 100);

    return color;
}

/**
 * Get CSS color string for an orbital type
 * @param {number} l - Azimuthal quantum number
 * @returns {string} HSL color string
 */
export function getCSSColor(l) {
    const letter = orbitalLetters[l] || 's';
    const def = orbitalColorDefinitions[letter];
    return `hsl(${def.hue}, ${def.saturation}%, ${def.lightness}%)`;
}

/**
 * Get orbital letter from quantum number
 * @param {number} l - Azimuthal quantum number
 * @returns {string}
 */
export function getOrbitalLetter(l) {
    return orbitalLetters[l] || `l${l}`;
}

/**
 * Get color info for UI display
 */
export function getColorInfo() {
    return Object.entries(orbitalColorDefinitions).map(([letter, def]) => ({
        letter,
        name: def.name,
        css: `hsl(${def.hue}, ${def.saturation}%, ${def.lightness}%)`
    }));
}

// Export as namespace for convenience
export const orbitalColors = {
    getColor,
    getCSSColor,
    getOrbitalLetter,
    getColorInfo,
    definitions: orbitalColorDefinitions
};
