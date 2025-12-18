
import { describe, it, expect } from './simple-test-runner.js';
import { factorial, laguerrePolynomial, radialNormalization, radialWaveFunction } from '../src/physics/radialWaveFunction.js';

describe('factorial', () => {
    it('should calculate the factorial of a positive integer', () => {
        expect(factorial(0)).toBe(1);
        expect(factorial(1)).toBe(1);
        expect(factorial(5)).toBe(120);
        expect(factorial(10)).toBe(3628800);
    });

    it('should return 1 for negative integers', () => {
        expect(factorial(-1)).toBe(1);
        expect(factorial(-5)).toBe(1);
    });
});

describe('laguerrePolynomial', () => {
    it('should calculate the associated Laguerre polynomial', () => {
        // L_0^alpha(x) = 1
        expect(laguerrePolynomial(0, 0, 5)).toBe(1);
        expect(laguerrePolynomial(0, 5, 5)).toBe(1);
        
        // L_1^alpha(x) = 1 + alpha - x
        expect(laguerrePolynomial(1, 0, 5)).toBe(1 + 0 - 5);
        expect(laguerrePolynomial(1, 5, 5)).toBe(1 + 5 - 5);
        
        // L_2^1(x) = (1/2) * (x^2 - 6x + 6)
        const x = 3;
        const expected = 0.5 * (x*x - 6*x + 6);
        expect(laguerrePolynomial(2, 1, x)).toBeCloseTo(expected, 5);
    });
});

describe('radialNormalization', () => {
    it('should calculate the normalization constant for R_nl', () => {
        // For 1s orbital (n=1, l=0)
        const N_1s = radialNormalization(1, 0, 1);
        expect(N_1s).toBeCloseTo(2.0, 5); 

        // For 2s orbital (n=2, l=0)
        const N_2s = radialNormalization(2, 0, 1);
        expect(N_2s).toBeCloseTo(1 / Math.sqrt(2), 5);

        // For 2p orbital (n=2, l=1)
        const N_2p = radialNormalization(2, 1, 1);
        expect(N_2p).toBeCloseTo(1 / (2 * Math.sqrt(6)), 5);
    });
});

describe('radialWaveFunction', () => {
    it('should return 0 for invalid quantum numbers', () => {
        expect(radialWaveFunction(0, 0, 1)).toBe(0); // n must be >= 1
        expect(radialWaveFunction(1, 1, 1)).toBe(0); // l must be < n
        expect(radialWaveFunction(2, -1, 1)).toBe(0); // l must be >= 0
    });

    it('should calculate the 1s hydrogen orbital correctly', () => {
        const R_1s = r => 2 * Math.exp(-r); // Analytical solution for Z=1
        
        expect(radialWaveFunction(1, 0, 0, 1)).toBeCloseTo(R_1s(0), 5);
        expect(radialWaveFunction(1, 0, 1, 1)).toBeCloseTo(R_1s(1), 5);
        expect(radialWaveFunction(1, 0, 2, 1)).toBeCloseTo(R_1s(2), 5);
    });
    
    it('should calculate the 2s hydrogen orbital correctly', () => {
        // Analytical solution for Z=1, a0=1
        const R_2s = r => (1 / Math.sqrt(2)) * (1 - r / 2) * Math.exp(-r / 2);

        expect(radialWaveFunction(2, 0, 0, 1)).toBeCloseTo(R_2s(0), 5);
        expect(radialWaveFunction(2, 0, 1, 1)).toBeCloseTo(R_2s(1), 5);
        expect(radialWaveFunction(2, 0, 2, 1)).toBeCloseTo(R_2s(2), 5); // Node at r=2
    });

    it('should calculate the 2p hydrogen orbital correctly', () => {
        // Analytical solution for Z=1, a0=1
        const R_2p = r => (1 / (2 * Math.sqrt(6))) * r * Math.exp(-r / 2);
        
        expect(radialWaveFunction(2, 1, 0, 1)).toBeCloseTo(R_2p(0), 5);
        expect(radialWaveFunction(2, 1, 1, 1)).toBeCloseTo(R_2p(1), 5);
        expect(radialWaveFunction(2, 1, 2, 1)).toBeCloseTo(R_2p(2), 5);
    });
});

// A simple test runner execution
// In a real scenario, you'd use a test runner like Vitest, Jest, or Mocha.
// This is just to demonstrate the tests can run.
console.log('Running tests for radialWaveFunction.js...');
