/**
 * Radial Wave Function Implementation
 * 
 * Implements the radial component R_nl(r) of hydrogen-like atomic orbitals.
 * R_nl(r) = N * ρ^l * exp(-ρ/2) * L_{n-l-1}^{2l+1}(ρ)
 * 
 * Where:
 * - ρ = 2Zr / (n * a₀)
 * - N = normalization constant
 * - L = associated Laguerre polynomial
 * - a₀ = Bohr radius (0.529 Å)
 */

// Bohr radius in Angstroms (scaled for visualization)
const BOHR_RADIUS = 1.0;

/**
 * Factorial calculation with memoization
 */
const factorialCache = [1, 1];
export function factorial(n) {
    if (n < 0) return 1;
    if (n < factorialCache.length) return factorialCache[n];

    let result = factorialCache[factorialCache.length - 1];
    for (let i = factorialCache.length; i <= n; i++) {
        result *= i;
        factorialCache[i] = result;
    }
    return result;
}

/**
 * Associated Laguerre polynomial L_n^α(x)
 * Uses the recurrence relation for numerical stability
 * 
 * L_0^α(x) = 1
 * L_1^α(x) = 1 + α - x
 * L_k^α(x) = ((2k - 1 + α - x) * L_{k-1}^α(x) - (k - 1 + α) * L_{k-2}^α(x)) / k
 */
export function laguerrePolynomial(n, alpha, x) {
    if (n === 0) return 1;
    if (n === 1) return 1 + alpha - x;

    let L_prev2 = 1;
    let L_prev1 = 1 + alpha - x;
    let L_curr = 0;

    for (let k = 2; k <= n; k++) {
        L_curr = ((2 * k - 1 + alpha - x) * L_prev1 - (k - 1 + alpha) * L_prev2) / k;
        L_prev2 = L_prev1;
        L_prev1 = L_curr;
    }

    return L_curr;
}

/**
 * Normalization constant for radial wave function
 * N = sqrt((2Z/na₀)³ * (n-l-1)! / (2n * ((n+l)!)³))
 */
export function radialNormalization(n, l, Z = 1) {
    const prefactor = Math.pow(2 * Z / (n * BOHR_RADIUS), 3);
    const numerator = factorial(n - l - 1);
    const denominator = 2 * n * Math.pow(factorial(n + l), 3);

    return Math.sqrt(prefactor * numerator / denominator);
}

/**
 * Radial wave function R_nl(r)
 * 
 * @param {number} n - Principal quantum number (1, 2, 3, ...)
 * @param {number} l - Azimuthal quantum number (0 to n-1)
 * @param {number} r - Radial distance from nucleus
 * @param {number} Z - Atomic number (effective nuclear charge)
 * @returns {number} Value of radial wave function at r
 */
export function radialWaveFunction(n, l, r, Z = 1) {
    // Validate quantum numbers
    if (n < 1 || l < 0 || l >= n) {
        console.warn(`Invalid quantum numbers: n=${n}, l=${l}`);
        return 0;
    }

    // Dimensionless radial coordinate
    const rho = (2 * Z * r) / (n * BOHR_RADIUS);

    // Normalization constant
    const N = radialNormalization(n, l, Z);

    // Radial function components
    const rhoL = Math.pow(rho, l);
    const expTerm = Math.exp(-rho / 2);
    const laguerre = laguerrePolynomial(n - l - 1, 2 * l + 1, rho);

    return N * rhoL * expTerm * laguerre;
}

/**
 * Radial probability density |R_nl(r)|² * r²
 * This gives the probability of finding the electron at distance r
 * (integrated over all angles)
 */
export function radialProbabilityDensity(n, l, r, Z = 1) {
    const R = radialWaveFunction(n, l, r, Z);
    return R * R * r * r;
}

/**
 * Find the maximum extent of an orbital for sampling
 * Approximately where probability drops below threshold
 */
export function maxRadialExtent(n, l, Z = 1, threshold = 0.001) {
    // Approximate: most probability within ~3n²/Z Bohr radii
    // Add extra margin for visualization
    return (4 * n * n / Z) * BOHR_RADIUS;
}

/**
 * Find the most probable radius (peak of radial probability)
 * For hydrogen-like atoms, r_max ≈ n² * a₀ / Z for s orbitals
 */
export function mostProbableRadius(n, l, Z = 1) {
    // Approximate formula - actual peak varies with l
    return ((n * n - l * (l + 1) / 2) / Z) * BOHR_RADIUS;
}
