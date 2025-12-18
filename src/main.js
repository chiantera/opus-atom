/**
 * Plasma Kepler - Atomic Structure Visualizer
 * 
 * Main application entry point.
 * Initializes Three.js scene, renderers, and UI components.
 */

import * as THREE from 'three';
import './styles/main.css';

// Renderers
import { NucleusRenderer } from './rendering/NucleusRenderer.js';
import { ElectronCloudRenderer } from './rendering/ElectronCloudRenderer.js';

// UI Components
import { PeriodicTable } from './ui/PeriodicTable.js';
import { ElementInfoPanel } from './ui/ElementInfoPanel.js';
import { OrbitalLegend } from './ui/OrbitalLegend.js';
import { VisualizationControls } from './ui/VisualizationControls.js';

// State & Controls
import { AtomState } from './state/AtomState.js';
import { CameraController } from './controls/CameraController.js';

// Data
import { generateElectronConfiguration } from './data/elements.js';

class PlasmaKeplerApp {
    constructor() {
        this.clock = new THREE.Clock();

        // Initialize core components
        this._initThreeJS();
        this._initState();
        this._initRenderers();
        this._initUI();

        // Start render loop
        this._animate();

        // Handle window resize
        window.addEventListener('resize', this._onResize.bind(this));

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading-screen').classList.add('hidden');
        }, 500);

        // Initial element
        this.state.setElement('H');
    }

    _initThreeJS() {
        // Get canvas
        this.canvas = document.getElementById('viewer');

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 3, 8);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Camera controls
        this.cameraController = new CameraController(this.camera, this.canvas);
        this.cameraController.setAutoRotate(true);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Add subtle grid for reference
        this._createReferenceGrid();
    }

    _createReferenceGrid() {
        // Subtle circular grid
        const gridGeometry = new THREE.RingGeometry(2, 2.02, 64);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        for (let i = 1; i <= 5; i++) {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(i * 2 - 0.02, i * 2 + 0.02, 64),
                gridMaterial
            );
            ring.rotation.x = Math.PI / 2;
            this.scene.add(ring);
        }
    }

    _initState() {
        this.state = new AtomState();

        // Subscribe to state changes
        this.state.subscribe((state, changeType) => {
            this._updateVisualization(state, changeType);
        });
    }

    _initRenderers() {
        this.nucleusRenderer = new NucleusRenderer(this.scene);
        this.electronCloudRenderer = new ElectronCloudRenderer(this.scene);
    }

    _initUI() {
        // Periodic table
        const tableContainer = document.getElementById('periodic-table');
        this.periodicTable = new PeriodicTable(tableContainer, (symbol) => {
            this.state.setElement(symbol);
        });

        // Element info panel
        const infoContainer = document.getElementById('element-info');
        this.elementInfoPanel = new ElementInfoPanel(infoContainer, this.state);

        // Orbital legend
        const legendContainer = document.getElementById('orbital-legend');
        this.orbitalLegend = new OrbitalLegend(legendContainer, (l, visible) => {
            this.electronCloudRenderer.setOrbitalTypeVisibility(l, visible);
        });

        // Visualization controls
        const controlsContainer = document.getElementById('viz-controls');
        this.vizControls = new VisualizationControls(controlsContainer, (settings) => {
            this._onVisualizationSettingsChange(settings);
        });

        // Select hydrogen by default
        this.periodicTable.selectElement('H');
    }

    _onVisualizationSettingsChange(settings) {
        // Update electron renderer with all settings including view mode
        if (this.electronCloudRenderer.updateSettings) {
            this.electronCloudRenderer.updateSettings({
                sphereScale: settings.sphereSize,
                opacity: settings.sphereOpacity,
                density: settings.cloudDensity,
                showSpheres: settings.showSpheres,
                showCloud: settings.showCloud
            });
        }

        // Update nucleus scale
        if (this.nucleusRenderer.updateNucleonScale) {
            this.nucleusRenderer.updateNucleonScale(settings.nucleonSize);
        }
    }

    _updateVisualization(state, changeType) {
        const { element, electronCount, configuration } = state;

        // Update nucleus
        this.nucleusRenderer.update(element.atomicNumber, element.symbol);

        // Update electron cloud
        // For performance, limit total points for heavy elements
        const pointsPerElectron = electronCount > 30 ? 1500 : 3000;

        // Expand configuration to include all m values
        const expandedConfig = [];
        for (const { n, l, electrons } of configuration) {
            // Distribute electrons across m values within the subshell
            let remaining = electrons;
            for (let m = -l; m <= l && remaining > 0; m++) {
                const e = Math.min(2, remaining);
                expandedConfig.push({ n, l, m, electrons: e });
                remaining -= e;
            }
        }

        this.electronCloudRenderer.renderConfiguration(expandedConfig, element.atomicNumber);

        // Adjust camera for atom size
        this.cameraController.adjustForAtom(element.atomicNumber);
    }

    _animate() {
        requestAnimationFrame(this._animate.bind(this));

        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // Update controls
        this.cameraController.update();

        // Animate nucleus
        this.nucleusRenderer.updateGlow(this.camera);

        // Animate electron cloud
        this.electronCloudRenderer.animate(deltaTime);

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    _onResize() {
        // Update camera aspect ratio
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        // Update renderer size
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        // Update electron cloud for new screen size
        this.electronCloudRenderer.onResize();
    }

    dispose() {
        this.nucleusRenderer.dispose();
        this.electronCloudRenderer.dispose();
        this.cameraController.dispose();
        this.renderer.dispose();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PlasmaKeplerApp();
});
