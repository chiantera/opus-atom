/**
 * Nucleus Renderer - Realistic Version
 * 
 * Renders the atomic nucleus showing individual protons and neutrons
 * arranged in a realistic 3D structure.
 */

import * as THREE from 'three';

// Nucleon radius (relative scale for visualization)
const NUCLEON_RADIUS = 0.08;
const NUCLEON_SEGMENTS = 16;

// Colors
const PROTON_COLOR = 0xff4444;   // Red
const NEUTRON_COLOR = 0x4488ff;  // Blue
const PROTON_EMISSIVE = 0x881111;
const NEUTRON_EMISSIVE = 0x114488;

// Common isotope neutron counts (most stable/abundant isotope)
const NEUTRON_COUNTS = {
    1: 0,   // H (protium)
    2: 2,   // He
    3: 4,   // Li
    4: 5,   // Be
    5: 6,   // B
    6: 6,   // C
    7: 7,   // N
    8: 8,   // O
    9: 10,  // F
    10: 10, // Ne
    11: 12, // Na
    12: 12, // Mg
    13: 14, // Al
    14: 14, // Si
    15: 16, // P
    16: 16, // S
    17: 18, // Cl
    18: 22, // Ar
    19: 20, // K
    20: 20, // Ca
    21: 24, // Sc
    22: 26, // Ti
    23: 28, // V
    24: 28, // Cr
    25: 30, // Mn
    26: 30, // Fe
    27: 32, // Co
    28: 30, // Ni
    29: 34, // Cu
    30: 34, // Zn
    31: 38, // Ga
    32: 40, // Ge
    33: 42, // As
    34: 46, // Se
    35: 44, // Br
    36: 48, // Kr
    37: 48, // Rb
    38: 50, // Sr
    39: 50, // Y
    40: 50, // Zr
    41: 52, // Nb
    42: 54, // Mo
    43: 55, // Tc
    44: 57, // Ru
    45: 58, // Rh
    46: 60, // Pd
    47: 60, // Ag
    48: 64, // Cd
    49: 66, // In
    50: 70, // Sn
    51: 70, // Sb
    52: 76, // Te
    53: 74, // I
    54: 77, // Xe
    55: 78, // Cs
    56: 81, // Ba
    57: 82, // La
    58: 82, // Ce
    59: 82, // Pr
    60: 84, // Nd
    61: 84, // Pm
    62: 88, // Sm
    63: 89, // Eu
    64: 93, // Gd
    65: 94, // Tb
    66: 96, // Dy
    67: 98, // Ho
    68: 99, // Er
    69: 100, // Tm
    70: 103, // Yb
    71: 104, // Lu
    72: 106, // Hf
    73: 108, // Ta
    74: 110, // W
    75: 111, // Re
    76: 114, // Os
    77: 115, // Ir
    78: 117, // Pt
    79: 118, // Au
    80: 121, // Hg
    81: 123, // Tl
    82: 126, // Pb
    83: 126, // Bi
    84: 125, // Po
    85: 125, // At
    86: 136, // Rn
    87: 136, // Fr
    88: 138, // Ra
    89: 138, // Ac
    90: 142, // Th
    91: 140, // Pa
    92: 146, // U
    93: 144, // Np
    94: 150, // Pu
    95: 148, // Am
    96: 151, // Cm
    97: 150, // Bk
    98: 153, // Cf
    99: 153, // Es
    100: 157, // Fm
    101: 157, // Md
    102: 157, // No
    103: 159, // Lr
    104: 157, // Rf
    105: 157, // Db
    106: 160, // Sg
    107: 155, // Bh
    108: 157, // Hs
    109: 159, // Mt
    110: 161, // Ds
    111: 161, // Rg
    112: 165, // Cn
    113: 170, // Nh
    114: 175, // Fl
    115: 173, // Mc
    116: 177, // Lv
    117: 177, // Ts
    118: 176  // Og
};

export class NucleusRenderer {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();

        // Instanced meshes for protons and neutrons
        this.protonMesh = null;
        this.neutronMesh = null;
        this.glowMesh = null;
        this.light = null;

        // Current counts
        this.protonCount = 0;
        this.neutronCount = 0;

        // Pre-create geometries and materials
        this._createMaterials();
        this._createGlow();

        scene.add(this.group);
    }

    _createMaterials() {
        // Shared geometry for all nucleons
        this.nucleonGeometry = new THREE.SphereGeometry(NUCLEON_RADIUS, NUCLEON_SEGMENTS, NUCLEON_SEGMENTS);

        // Proton material - red/pink
        this.protonMaterial = new THREE.MeshStandardMaterial({
            color: PROTON_COLOR,
            emissive: PROTON_EMISSIVE,
            emissiveIntensity: 0.4,
            metalness: 0.2,
            roughness: 0.5
        });

        // Neutron material - blue
        this.neutronMaterial = new THREE.MeshStandardMaterial({
            color: NEUTRON_COLOR,
            emissive: NEUTRON_EMISSIVE,
            emissiveIntensity: 0.3,
            metalness: 0.2,
            roughness: 0.5
        });
    }

    _createGlow() {
        // Outer glow effect for the entire nucleus
        const glowGeometry = new THREE.SphereGeometry(1, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { value: new THREE.Color(0xff6b35) },
                viewVector: { value: new THREE.Vector3() },
                nucleusRadius: { value: 0.5 }
            },
            vertexShader: `
        uniform vec3 viewVector;
        uniform float nucleusRadius;
        varying float intensity;
        void main() {
          vec3 scaledPos = position * nucleusRadius * 1.5;
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.6 - dot(vNormal, vNormel), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(scaledPos, 1.0);
        }
      `,
            fragmentShader: `
        uniform vec3 color;
        varying float intensity;
        void main() {
          vec3 glow = color * intensity;
          gl_FragColor = vec4(glow, intensity * 0.4);
        }
      `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });

        this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        this.group.add(this.glowMesh);

        // Point light from nucleus
        this.light = new THREE.PointLight(0xff6b35, 0.5, 15);
        this.group.add(this.light);
    }

    /**
     * Generate positions for nucleons in a spherical cluster
     * Uses a simple packing algorithm to create realistic nuclear structure
     */
    _generateNucleonPositions(protonCount, neutronCount) {
        const totalNucleons = protonCount + neutronCount;
        if (totalNucleons === 0) return { protons: [], neutrons: [] };

        const positions = [];

        // Nuclear radius scales with A^(1/3) where A is mass number
        const nuclearRadius = NUCLEON_RADIUS * Math.pow(totalNucleons, 1 / 3) * 2.2;

        // Use Fibonacci sphere for even distribution
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        // Place nucleons in shells from center outward
        if (totalNucleons === 1) {
            // Single proton (hydrogen)
            positions.push(new THREE.Vector3(0, 0, 0));
        } else if (totalNucleons <= 4) {
            // Small nuclei - tetrahedral arrangement
            const d = NUCLEON_RADIUS * 1.2;
            if (totalNucleons >= 1) positions.push(new THREE.Vector3(0, d * 0.5, 0));
            if (totalNucleons >= 2) positions.push(new THREE.Vector3(0, -d * 0.5, 0));
            if (totalNucleons >= 3) positions.push(new THREE.Vector3(d * 0.866, 0, 0));
            if (totalNucleons >= 4) positions.push(new THREE.Vector3(-d * 0.433, 0, d * 0.75));
        } else {
            // Larger nuclei - spherical packing with Fibonacci spiral
            let placedCount = 0;
            let shellIndex = 0;

            while (placedCount < totalNucleons) {
                // Determine shell radius and capacity
                const shellRadius = shellIndex === 0 ? 0 : NUCLEON_RADIUS * 2.1 * shellIndex;
                const shellCapacity = shellIndex === 0 ? 1 : Math.floor(4 * Math.PI * shellIndex * shellIndex);
                const nucleonsInShell = Math.min(shellCapacity, totalNucleons - placedCount);

                if (shellIndex === 0) {
                    // Center nucleon
                    positions.push(new THREE.Vector3(0, 0, 0));
                    placedCount++;
                } else {
                    // Distribute on shell surface using Fibonacci sphere
                    for (let i = 0; i < nucleonsInShell; i++) {
                        const y = 1 - (i / (nucleonsInShell - 1 || 1)) * 2;
                        const radiusAtY = Math.sqrt(1 - y * y);
                        const theta = 2 * Math.PI * i / goldenRatio;

                        const x = Math.cos(theta) * radiusAtY;
                        const z = Math.sin(theta) * radiusAtY;

                        // Add some randomness for natural look
                        const jitter = NUCLEON_RADIUS * 0.15;
                        positions.push(new THREE.Vector3(
                            x * shellRadius + (Math.random() - 0.5) * jitter,
                            y * shellRadius + (Math.random() - 0.5) * jitter,
                            z * shellRadius + (Math.random() - 0.5) * jitter
                        ));
                        placedCount++;
                    }
                }
                shellIndex++;
            }
        }

        // Shuffle positions and split into protons and neutrons
        // Interleave for realistic distribution
        const shuffled = positions.sort(() => Math.random() - 0.5);

        return {
            protons: shuffled.slice(0, protonCount),
            neutrons: shuffled.slice(protonCount, protonCount + neutronCount)
        };
    }

    /**
     * Update nucleus for a new element
     * @param {number} atomicNumber - Atomic number (Z)
     * @param {string} symbol - Element symbol
     */
    update(atomicNumber, symbol) {
        this.protonCount = atomicNumber;
        this.neutronCount = NEUTRON_COUNTS[atomicNumber] !== undefined
            ? NEUTRON_COUNTS[atomicNumber]
            : Math.round(atomicNumber * 1.5);

        // Remove old instanced meshes
        if (this.protonMesh) {
            this.group.remove(this.protonMesh);
            this.protonMesh.dispose();
        }
        if (this.neutronMesh) {
            this.group.remove(this.neutronMesh);
            this.neutronMesh.dispose();
        }

        // Generate nucleon positions
        const { protons, neutrons } = this._generateNucleonPositions(this.protonCount, this.neutronCount);

        // Create instanced mesh for protons
        if (protons.length > 0) {
            this.protonMesh = new THREE.InstancedMesh(
                this.nucleonGeometry,
                this.protonMaterial,
                protons.length
            );

            const matrix = new THREE.Matrix4();
            protons.forEach((pos, i) => {
                matrix.setPosition(pos);
                this.protonMesh.setMatrixAt(i, matrix);
            });
            this.protonMesh.instanceMatrix.needsUpdate = true;
            this.group.add(this.protonMesh);
        }

        // Create instanced mesh for neutrons
        if (neutrons.length > 0) {
            this.neutronMesh = new THREE.InstancedMesh(
                this.nucleonGeometry,
                this.neutronMaterial,
                neutrons.length
            );

            const matrix = new THREE.Matrix4();
            neutrons.forEach((pos, i) => {
                matrix.setPosition(pos);
                this.neutronMesh.setMatrixAt(i, matrix);
            });
            this.neutronMesh.instanceMatrix.needsUpdate = true;
            this.group.add(this.neutronMesh);
        }

        // Update glow size
        const totalNucleons = this.protonCount + this.neutronCount;
        const nucleusRadius = NUCLEON_RADIUS * Math.pow(totalNucleons || 1, 1 / 3) * 2.5;

        if (this.glowMesh && this.glowMesh.material.uniforms) {
            this.glowMesh.material.uniforms.nucleusRadius.value = nucleusRadius;
            this.glowMesh.scale.setScalar(nucleusRadius);
        }

        this.light.intensity = 0.3 + atomicNumber * 0.01;
    }

    /**
     * Update glow effect based on camera position
     * @param {THREE.Camera} camera 
     */
    updateGlow(camera) {
        if (this.glowMesh && this.glowMesh.material.uniforms) {
            const viewVector = new THREE.Vector3().subVectors(
                camera.position,
                this.group.position
            );
            this.glowMesh.material.uniforms.viewVector.value = viewVector;
        }
    }

    /**
     * Get nucleon counts for UI display
     */
    getNucleonInfo() {
        return {
            protons: this.protonCount,
            neutrons: this.neutronCount,
            massNumber: this.protonCount + this.neutronCount
        };
    }

    /**
     * Update nucleon scale factor
     * @param {number} scale - Scale multiplier (1.0 = default)
     */
    updateNucleonScale(scale) {
        this.group.scale.setScalar(scale);
    }

    dispose() {
        if (this.protonMesh) {
            this.protonMesh.dispose();
        }
        if (this.neutronMesh) {
            this.neutronMesh.dispose();
        }
        if (this.nucleonGeometry) {
            this.nucleonGeometry.dispose();
        }
        if (this.protonMaterial) {
            this.protonMaterial.dispose();
        }
        if (this.neutronMaterial) {
            this.neutronMaterial.dispose();
        }
        if (this.glowMesh) {
            this.glowMesh.geometry.dispose();
            this.glowMesh.material.dispose();
        }
        this.scene.remove(this.group);
    }
}
