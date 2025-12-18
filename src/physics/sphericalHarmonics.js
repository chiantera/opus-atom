/**
 * Spherical Harmonics Implementation
 * 
 * Implements the angular component Y_lm(θ, φ) of atomic orbitals.
 * Uses real spherical harmonics for visualization (combining +m and -m).
 * 
 * Real spherical harmonics:
 * - Y_l^0 = Y_l0 (already real)
 * - Y_l^{m>0} = (1/√2) * [Y_lm + (-1)^m * Y_l,-m] ∝ cos(mφ)
 * - Y_l^{m<0} = (i/√2) * [Y_l,-|m| - (-1)^m * Y_l,|m|] ∝ sin(|m|φ)
 */

import { factorial } from './radialWaveFunction.js';

/**
 * Associated Legendre polynomial P_l^m(x)
 * Uses recurrence relations for numerical stability
 * 
 * P_m^m(x) = (-1)^m * (2m-1)!! * (1-x²)^(m/2)
 * P_{m+1}^m(x) = x * (2m+1) * P_m^m(x)
 * (l-m) * P_l^m(x) = x * (2l-1) * P_{l-1}^m(x) - (l+m-1) * P_{l-2}^m(x)
 */
export function legendrePolynomial(l, m, x) {
    // Handle m < 0 using symmetry relation
    const absM = Math.abs(m);

    if (absM > l) return 0;

    // Start with P_m^m using the formula
    // P_m^m(x) = (-1)^m * (2m-1)!! * (1-x²)^(m/2)
    let Pmm = 1;
    if (absM > 0) {
        const sqrtTerm = Math.sqrt(1 - x * x);
        let doubleFactorial = 1;
        for (let i = 1; i <= absM; i++) {
            doubleFactorial *= (2 * i - 1);
        }
        Pmm = Math.pow(-1, absM) * doubleFactorial * Math.pow(sqrtTerm, absM);
    }

    if (l === absM) return Pmm;

    // P_{m+1}^m(x) = x * (2m+1) * P_m^m(x)
    let Pmm1 = x * (2 * absM + 1) * Pmm;

    if (l === absM + 1) return Pmm1;

    // Use upward recurrence for higher l
    let Plm = 0;
    for (let ll = absM + 2; ll <= l; ll++) {
        Plm = (x * (2 * ll - 1) * Pmm1 - (ll + absM - 1) * Pmm) / (ll - absM);
        Pmm = Pmm1;
        Pmm1 = Plm;
    }

    return Plm;
}

/**
 * Normalization factor for spherical harmonics
 * N_lm = sqrt((2l+1)/(4π) * (l-|m|)!/(l+|m|)!)
 */
export function sphericalHarmonicNormalization(l, m) {
    const absM = Math.abs(m);
    const numerator = (2 * l + 1) * factorial(l - absM);
    const denominator = 4 * Math.PI * factorial(l + absM);
    return Math.sqrt(numerator / denominator);
}

/**
 * Real spherical harmonic Y_l^m(θ, φ)
 * Returns real-valued functions suitable for visualization
 * 
 * @param {number} l - Azimuthal quantum number (0, 1, 2, ...)
 * @param {number} m - Magnetic quantum number (-l to +l)
 * @param {number} theta - Polar angle (0 to π)
 * @param {number} phi - Azimuthal angle (0 to 2π)
 * @returns {number} Value of real spherical harmonic
 */
export function sphericalHarmonic(l, m, theta, phi) {
    // Validate quantum numbers
    if (l < 0 || Math.abs(m) > l) {
        console.warn(`Invalid quantum numbers: l=${l}, m=${m}`);
        return 0;
    }

    const N = sphericalHarmonicNormalization(l, m);
    const P = legendrePolynomial(l, Math.abs(m), Math.cos(theta));

    // Real spherical harmonics
    if (m > 0) {
        // Y_l^{m>0} ∝ cos(mφ) * P_l^m(cos θ)
        return N * Math.SQRT2 * P * Math.cos(m * phi);
    } else if (m < 0) {
        // Y_l^{m<0} ∝ sin(|m|φ) * P_l^|m|(cos θ)
        return N * Math.SQRT2 * P * Math.sin(Math.abs(m) * phi);
    } else {
        // Y_l^0 = N * P_l^0(cos θ)
        return N * P;
    }
}

/**
 * Angular probability density |Y_lm(θ, φ)|²
 */
export function angularProbabilityDensity(l, m, theta, phi) {
    const Y = sphericalHarmonic(l, m, theta, phi);
    return Y * Y;
}

/**
 * Get orbital name from quantum numbers
 * l=0: s, l=1: p, l=2: d, l=3: f
 */
export function getOrbitalName(n, l, m) {
    const orbitalLetters = ['s', 'p', 'd', 'f', 'g', 'h'];
    const letter = orbitalLetters[l] || `l${l}`;

    // Orbital orientation names (for p, d, f)
    const orientations = {
        1: { '-1': 'y', '0': 'z', '1': 'x' },
        2: { '-2': 'xy', '-1': 'yz', '0': 'z²', '1': 'xz', '2': 'x²-y²' },
        3: {
            '-3': 'y(3x²-y²)', '-2': 'xyz', '-1': 'yz²',
            '0': 'z³', '1': 'xz²', '2': 'z(x²-y²)', '3': 'x(x²-3y²)'
        }
    };

    const orient = orientations[l]?.[m.toString()] || '';
    return `${n}${letter}${orient ? `(${orient})` : ''}`;
}

/**
 * Get all m values for a given l
 */
export function getMagneticQuantumNumbers(l) {
    const mValues = [];
    for (let m = -l; m <= l; m++) {
        mValues.push(m);
    }
    return mValues;
}
