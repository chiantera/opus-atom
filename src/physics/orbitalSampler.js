/**
 * Orbital Sampler
 * 
 * Uses Monte Carlo rejection sampling to generate 3D point distributions
 * that follow the quantum mechanical probability density.
 */

import { probabilityDensity, sphericalToCartesian } from './probabilityDensity.js';
import { maxRadialExtent, mostProbableRadius } from './radialWaveFunction.js';

/**
 * Monte Carlo rejection sampling for orbital point generation
 * 
 * @param {number} n - Principal quantum number
 * @param {number} l - Azimuthal quantum number  
 * @param {number} m - Magnetic quantum number
 * @param {number} numPoints - Number of points to generate
 * @param {number} Z - Effective nuclear charge
 * @returns {Float32Array} Flattened array of [x,y,z, x,y,z, ...]
 */
export function sampleOrbital(n, l, m, numPoints, Z = 1) {
    const points = new Float32Array(numPoints * 3);
    const maxR = maxRadialExtent(n, l, Z);

    // First, find approximate maximum probability for this orbital
    let maxP = estimateMaxProbability(n, l, m, Z, maxR);

    let pointIndex = 0;
    let attempts = 0;
    const maxAttempts = numPoints * 100; // Prevent infinite loops

    while (pointIndex < numPoints * 3 && attempts < maxAttempts) {
        attempts++;

        // Generate random point in spherical coordinates
        // r: weighted toward most probable radius for efficiency
        const u = Math.random();
        const r = maxR * Math.pow(u, 1 / 3); // Cube root for uniform volume distribution

        // theta: uniform on sphere (cos(theta) uniform from -1 to 1)
        const theta = Math.acos(2 * Math.random() - 1);

        // phi: uniform from 0 to 2π
        const phi = Math.random() * 2 * Math.PI;

        // Calculate probability at this point
        const P = probabilityDensity(n, l, m, r, theta, phi, Z);

        // Account for volume element in spherical coordinates
        const volumeWeight = r * r * Math.sin(theta);
        const weightedP = P * volumeWeight;

        // Rejection sampling
        if (Math.random() * maxP < weightedP) {
            const { x, y, z } = sphericalToCartesian(r, theta, phi);
            points[pointIndex++] = x;
            points[pointIndex++] = y;
            points[pointIndex++] = z;
        }

        // Adaptive: if we're rejecting too much, increase maxP estimate
        if (attempts > 1000 && pointIndex < attempts * 0.01) {
            maxP *= 2;
        }
    }

    // If we didn't get all points, resize the array
    if (pointIndex < numPoints * 3) {
        console.warn(`Only generated ${pointIndex / 3} of ${numPoints} points for ${n}${['s', 'p', 'd', 'f'][l]}${m}`);
        return points.slice(0, pointIndex);
    }

    return points;
}

/**
 * Estimate maximum weighted probability for an orbital
 * Uses targeted sampling at known high-probability regions
 */
function estimateMaxProbability(n, l, m, Z, maxR) {
    const samples = 5000;
    let maxP = 0;

    // Sample at various radii, focusing on likely regions
    const rPeak = mostProbableRadius(n, l, Z);

    for (let i = 0; i < samples; i++) {
        // Bias sampling toward peak radius
        let r;
        if (Math.random() < 0.7) {
            // Near peak
            r = rPeak * (0.3 + Math.random() * 1.4);
        } else {
            // Full range
            r = maxR * Math.random();
        }
        r = Math.max(0.01, Math.min(r, maxR));

        const theta = Math.acos(2 * Math.random() - 1);
        const phi = Math.random() * 2 * Math.PI;

        const P = probabilityDensity(n, l, m, r, theta, phi, Z);
        const volumeWeight = r * r * Math.sin(theta);
        const weightedP = P * volumeWeight;

        if (weightedP > maxP) maxP = weightedP;
    }

    // Add safety margin
    return maxP * 1.5;
}

/**
 * Sample multiple orbitals efficiently
 * Groups points by orbital for batch rendering
 * 
 * @param {Array} orbitals - Array of {n, l, m, electrons} objects
 * @param {number} pointsPerElectron - Points to generate per electron
 * @param {number} Z - Effective nuclear charge
 * @returns {Map} Map of orbital key -> Float32Array points
 */
export function sampleMultipleOrbitals(orbitals, pointsPerElectron, Z = 1) {
    const results = new Map();

    for (const orbital of orbitals) {
        const { n, l, m, electrons } = orbital;
        const key = `${n},${l},${m}`;
        const numPoints = pointsPerElectron * electrons;

        results.set(key, sampleOrbital(n, l, m, numPoints, Z));
    }

    return results;
}

/**
 * Generate points for a specific orbital shell
 * Combines all m values for a given n,l subshell
 * 
 * @param {number} n - Principal quantum number
 * @param {number} l - Azimuthal quantum number
 * @param {number} totalElectrons - Total electrons in this subshell
 * @param {number} pointsPerElectron - Points per electron
 * @param {number} Z - Effective nuclear charge
 * @returns {Array} Array of {m, points} objects
 */
export function sampleSubshell(n, l, totalElectrons, pointsPerElectron, Z = 1) {
    const maxElectronsInSubshell = 2 * (2 * l + 1);
    const electronsPerOrbital = totalElectrons / (2 * l + 1);

    const results = [];

    for (let m = -l; m <= l; m++) {
        // Distribute electrons across orbitals (Hund's rule approximation)
        const electronsInThisOrbital = Math.min(
            2,
            Math.ceil(electronsPerOrbital * (m + l + 1) / electronsPerOrbital) -
            Math.floor(electronsPerOrbital * (m + l) / electronsPerOrbital) ||
            Math.floor(totalElectrons / (2 * l + 1))
        );

        if (electronsInThisOrbital > 0) {
            const numPoints = Math.ceil(pointsPerElectron * electronsInThisOrbital);
            results.push({
                m,
                electrons: electronsInThisOrbital,
                points: sampleOrbital(n, l, m, numPoints, Z)
            });
        }
    }

    return results;
}
