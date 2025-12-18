/**
 * Probability Density Calculation
 * 
 * Combines radial and angular wave functions to compute
 * the full 3D probability density |Ψ(r,θ,φ)|²
 */

import { radialWaveFunction, maxRadialExtent } from './radialWaveFunction.js';
import { sphericalHarmonic } from './sphericalHarmonics.js';

/**
 * Full probability density |Ψ_nlm(r, θ, φ)|²
 * 
 * @param {number} n - Principal quantum number
 * @param {number} l - Azimuthal quantum number
 * @param {number} m - Magnetic quantum number
 * @param {number} r - Radial distance from nucleus
 * @param {number} theta - Polar angle (0 to π)
 * @param {number} phi - Azimuthal angle (0 to 2π)
 * @param {number} Z - Effective nuclear charge
 * @returns {number} Probability density at the given point
 */
export function probabilityDensity(n, l, m, r, theta, phi, Z = 1) {
    const R = radialWaveFunction(n, l, r, Z);
    const Y = sphericalHarmonic(l, m, theta, phi);

    // |Ψ|² = |R|² * |Y|²
    return R * R * Y * Y;
}

/**
 * Convert spherical to Cartesian coordinates
 */
export function sphericalToCartesian(r, theta, phi) {
    const sinTheta = Math.sin(theta);
    return {
        x: r * sinTheta * Math.cos(phi),
        y: r * sinTheta * Math.sin(phi),
        z: r * Math.cos(theta)
    };
}

/**
 * Convert Cartesian to spherical coordinates
 */
export function cartesianToSpherical(x, y, z) {
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r === 0) return { r: 0, theta: 0, phi: 0 };

    return {
        r: r,
        theta: Math.acos(z / r),
        phi: Math.atan2(y, x)
    };
}

/**
 * Compute probability density at Cartesian coordinates
 */
export function probabilityDensityCartesian(n, l, m, x, y, z, Z = 1) {
    const { r, theta, phi } = cartesianToSpherical(x, y, z);
    return probabilityDensity(n, l, m, r, theta, phi, Z);
}

/**
 * Find the maximum probability density for an orbital
 * Used for normalization in visualization
 */
export function findMaxProbability(n, l, m, Z = 1, samples = 1000) {
    const maxR = maxRadialExtent(n, l, Z);
    let maxP = 0;

    for (let i = 0; i < samples; i++) {
        const r = Math.random() * maxR;
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * 2 * Math.PI;

        const P = probabilityDensity(n, l, m, r, theta, phi, Z);
        if (P > maxP) maxP = P;
    }

    // Add margin for safety
    return maxP * 1.2;
}

/**
 * Precompute and cache max probability for common orbitals
 */
const maxProbabilityCache = new Map();

export function getMaxProbability(n, l, m, Z = 1) {
    const key = `${n},${l},${m},${Z}`;

    if (!maxProbabilityCache.has(key)) {
        maxProbabilityCache.set(key, findMaxProbability(n, l, m, Z, 2000));
    }

    return maxProbabilityCache.get(key);
}

/**
 * Clear the probability cache (call when changing elements)
 */
export function clearProbabilityCache() {
    maxProbabilityCache.clear();
}
