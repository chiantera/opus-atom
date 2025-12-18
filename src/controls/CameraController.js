/**
 * Camera Controller
 * 
 * Wraps Three.js OrbitControls with additional features
 * for smooth camera movement and presets.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.controls = new OrbitControls(camera, domElement);

        // Configure controls
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;

        // Store initial state for reset
        this.initialPosition = camera.position.clone();
        this.initialTarget = this.controls.target.clone();

        this._setupKeyboardControls();
    }

    _setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'r':
                    this.reset();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoRotate();
                    break;
            }
        });
    }

    /**
     * Reset camera to initial position
     */
    reset() {
        this.camera.position.copy(this.initialPosition);
        this.controls.target.copy(this.initialTarget);
        this.controls.update();
    }

    /**
     * Toggle auto-rotation
     */
    toggleAutoRotate() {
        this.controls.autoRotate = !this.controls.autoRotate;
        return this.controls.autoRotate;
    }

    /**
     * Set auto-rotate state
     */
    setAutoRotate(enabled) {
        this.controls.autoRotate = enabled;
    }

    /**
     * Adjust zoom limits based on atom size
     * @param {number} atomicNumber 
     */
    adjustForAtom(atomicNumber) {
        // Scale view distance for larger atoms
        const scale = 1 + Math.log10(atomicNumber) * 0.5;
        this.controls.maxDistance = 50 * scale;
    }

    /**
     * Must be called each frame
     */
    update() {
        this.controls.update();
    }

    dispose() {
        this.controls.dispose();
    }
}
