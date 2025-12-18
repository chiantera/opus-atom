/**
 * Electron Cloud Renderer - Dual Mode Version
 * 
 * Supports both discrete spheres and soft cloud visualization.
 * - Spheres mode: Small solid spheres representing electron positions
 * - Cloud mode: Larger, softer particles showing probability density
 */

import * as THREE from 'three';
import { sampleOrbital } from '../physics/orbitalSampler.js';
import { orbitalColors } from '../data/orbitalColors.js';

// Spheres mode settings
const SPHERES_PER_ELECTRON = 800;
const SPHERE_RADIUS = 0.04;
const SPHERE_SEGMENTS = 8;

// Cloud mode settings  
const CLOUD_POINTS_PER_ELECTRON = 2000;
const CLOUD_POINT_SIZE = 0.15;

export class ElectronCloudRenderer {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.time = 0;

        // View mode state
        this.showSpheres = true;
        this.showCloud = false;

        // Separate groups for each mode
        this.sphereGroup = new THREE.Group();
        this.cloudGroup = new THREE.Group();
        this.group.add(this.sphereGroup);
        this.group.add(this.cloudGroup);

        // Meshes storage
        this.sphereMeshes = new Map();
        this.cloudMeshes = new Map();

        // Shared geometries
        this.sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS);

        // Materials cache
        this.sphereMaterials = new Map();
        this.cloudMaterials = new Map();

        // Current configuration for re-rendering
        this.currentConfig = null;
        this.currentZ = 1;
        this.cloudDensity = 1.0;

        scene.add(this.group);
    }

    /**
     * Get or create sphere material for orbital type
     */
    _getSphereMaterial(l) {
        if (!this.sphereMaterials.has(l)) {
            const color = orbitalColors.getColor(l);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.3,
                transparent: true,
                opacity: 0.7,
                metalness: 0.1,
                roughness: 0.6
            });
            this.sphereMaterials.set(l, material);
        }
        return this.sphereMaterials.get(l);
    }

    /**
     * Get or create cloud point material for orbital type
     */
    _getCloudMaterial(l) {
        if (!this.cloudMaterials.has(l)) {
            const color = orbitalColors.getColor(l);
            const material = new THREE.PointsMaterial({
                color: color,
                size: CLOUD_POINT_SIZE,
                transparent: true,
                opacity: 0.3,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true
            });
            this.cloudMaterials.set(l, material);
        }
        return this.cloudMaterials.get(l);
    }

    /**
     * Render a single orbital in sphere mode
     */
    _renderSphereOrbital({ n, l, m, electrons, Z = 1 }) {
        const key = `${n},${l},${m}`;

        // Remove existing
        this._removeSphereOrbital(key);

        // Sample positions
        const numSpheres = SPHERES_PER_ELECTRON * electrons;
        const positions = sampleOrbital(n, l, m, numSpheres, Z);

        if (positions.length === 0) return;

        const instanceCount = positions.length / 3;
        const material = this._getSphereMaterial(l);

        const instancedMesh = new THREE.InstancedMesh(
            this.sphereGeometry,
            material,
            instanceCount
        );

        const matrix = new THREE.Matrix4();
        const pos = new THREE.Vector3();

        for (let i = 0; i < instanceCount; i++) {
            pos.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            const scale = 0.8 + Math.random() * 0.4;
            matrix.makeScale(scale, scale, scale);
            matrix.setPosition(pos);
            instancedMesh.setMatrixAt(i, matrix);
        }

        instancedMesh.instanceMatrix.needsUpdate = true;

        // Instance colors
        const colors = new Float32Array(instanceCount * 3);
        const baseColor = orbitalColors.getColor(l);
        for (let i = 0; i < instanceCount; i++) {
            const v = 0.85 + Math.random() * 0.3;
            colors[i * 3] = baseColor.r * v;
            colors[i * 3 + 1] = baseColor.g * v;
            colors[i * 3 + 2] = baseColor.b * v;
        }
        instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

        this.sphereMeshes.set(key, instancedMesh);
        this.sphereGroup.add(instancedMesh);
    }

    /**
     * Render a single orbital in cloud mode
     */
    _renderCloudOrbital({ n, l, m, electrons, Z = 1 }) {
        const key = `${n},${l},${m}`;

        // Remove existing
        this._removeCloudOrbital(key);

        // Sample more points for cloud, scaled by density
        const numPoints = Math.floor(CLOUD_POINTS_PER_ELECTRON * electrons * this.cloudDensity);
        const positions = sampleOrbital(n, l, m, numPoints, Z);

        if (positions.length === 0) return;

        // Create point cloud geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        // Add color variation
        const colors = new Float32Array(positions.length);
        const baseColor = orbitalColors.getColor(l);
        for (let i = 0; i < positions.length / 3; i++) {
            const v = 0.7 + Math.random() * 0.6;
            colors[i * 3] = baseColor.r * v;
            colors[i * 3 + 1] = baseColor.g * v;
            colors[i * 3 + 2] = baseColor.b * v;
        }
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = this._getCloudMaterial(l).clone();
        material.vertexColors = true;

        const points = new THREE.Points(geometry, material);

        this.cloudMeshes.set(key, points);
        this.cloudGroup.add(points);
    }

    _removeSphereOrbital(key) {
        const mesh = this.sphereMeshes.get(key);
        if (mesh) {
            this.sphereGroup.remove(mesh);
            mesh.dispose();
            this.sphereMeshes.delete(key);
        }
    }

    _removeCloudOrbital(key) {
        const mesh = this.cloudMeshes.get(key);
        if (mesh) {
            this.cloudGroup.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.cloudMeshes.delete(key);
        }
    }

    /**
     * Render orbital configuration
     */
    renderConfiguration(configuration, Z = 1) {
        // Store for re-rendering when mode changes
        this.currentConfig = configuration;
        this.currentZ = Z;

        // Clear all
        this.clearAll();

        // Render each orbital in enabled modes
        for (const orbital of configuration) {
            if (this.showSpheres) {
                this._renderSphereOrbital({ ...orbital, Z });
            }
            if (this.showCloud) {
                this._renderCloudOrbital({ ...orbital, Z });
            }
        }
    }

    /**
     * Toggle visibility of an orbital type
     */
    setOrbitalTypeVisibility(l, visible) {
        for (const [key, mesh] of this.sphereMeshes) {
            const [, orbitalL] = key.split(',').map(Number);
            if (orbitalL === l) mesh.visible = visible;
        }
        for (const [key, mesh] of this.cloudMeshes) {
            const [, orbitalL] = key.split(',').map(Number);
            if (orbitalL === l) mesh.visible = visible;
        }
    }

    /**
     * Clear all orbitals
     */
    clearAll() {
        for (const [key] of this.sphereMeshes) {
            this._removeSphereOrbital(key);
        }
        for (const [key] of this.cloudMeshes) {
            this._removeCloudOrbital(key);
        }
        this.sphereMeshes.clear();
        this.cloudMeshes.clear();
    }

    /**
     * Update visualization settings
     */
    updateSettings(settings) {
        const {
            sphereScale = 1.0,
            opacity = 0.7,
            density = 1.0,
            showSpheres,
            showCloud
        } = settings;

        // Check if mode changed
        const modeChanged = (showSpheres !== undefined && showSpheres !== this.showSpheres) ||
            (showCloud !== undefined && showCloud !== this.showCloud);

        // Check if density changed significantly (requires re-render)
        const densityChanged = density !== undefined && Math.abs(density - this.cloudDensity) > 0.05;

        if (showSpheres !== undefined) this.showSpheres = showSpheres;
        if (showCloud !== undefined) this.showCloud = showCloud;
        if (density !== undefined) this.cloudDensity = density;

        // Update visibility
        this.sphereGroup.visible = this.showSpheres;
        this.cloudGroup.visible = this.showCloud;

        // Re-render if mode or density changed
        if ((modeChanged || densityChanged) && this.currentConfig) {
            this.renderConfiguration(this.currentConfig, this.currentZ);
        }

        // Update sphere size by scaling the sphere group (not the whole group)
        this.sphereGroup.scale.setScalar(sphereScale);

        // Update opacity for sphere materials
        for (const [, material] of this.sphereMaterials) {
            material.opacity = opacity;
        }

        // Update cloud opacity (lower for additive blending)
        for (const [, material] of this.cloudMaterials) {
            material.opacity = opacity * 0.4;
        }
    }

    /**
     * Animate
     */
    animate(deltaTime) {
        this.time += deltaTime;

        // Subtle pulsing for spheres
        const pulse = 0.25 + 0.1 * Math.sin(this.time * 2);
        for (const [, material] of this.sphereMaterials) {
            material.emissiveIntensity = pulse;
        }

        // Cloud size animation
        const cloudPulse = CLOUD_POINT_SIZE * (1 + 0.1 * Math.sin(this.time * 1.5));
        for (const [, material] of this.cloudMaterials) {
            material.size = cloudPulse;
        }
    }

    onResize() {
        // No action needed
    }

    getOrbitalInfo() {
        const info = [];
        for (const [key, mesh] of this.sphereMeshes) {
            const [n, l, m] = key.split(',').map(Number);
            info.push({ key, n, l, m, visible: mesh.visible, instanceCount: mesh.count });
        }
        return info;
    }

    dispose() {
        this.clearAll();

        if (this.sphereGeometry) this.sphereGeometry.dispose();

        for (const [, mat] of this.sphereMaterials) mat.dispose();
        for (const [, mat] of this.cloudMaterials) mat.dispose();

        this.sphereMaterials.clear();
        this.cloudMaterials.clear();

        this.scene.remove(this.group);
    }
}
