/**
 * Visualization Controls
 * 
 * UI component for adjusting electron visualization settings:
 * - Sphere size
 * - Opacity
 * - Cloud density
 * - View mode toggle
 */

export class VisualizationControls {
    constructor(container, onSettingsChange) {
        this.container = container;
        this.onSettingsChange = onSettingsChange;

        // Default settings
        this.settings = {
            sphereSize: 1.0,
            sphereOpacity: 0.7,
            cloudDensity: 1.0,
            showSpheres: true,
            showCloud: false,
            nucleonSize: 1.0
        };

        this._render();
        this._attachEventListeners();
    }

    _render() {
        this.container.innerHTML = `
      <div class="controls-title">Visualization</div>
      
      <div class="control-group">
        <label class="control-label">View Mode</label>
        <div class="toggle-group">
          <button class="toggle-btn ${this.settings.showSpheres && !this.settings.showCloud ? 'active' : ''}" data-mode="spheres">Spheres</button>
          <button class="toggle-btn ${this.settings.showCloud && !this.settings.showSpheres ? 'active' : ''}" data-mode="cloud">Cloud</button>
          <button class="toggle-btn ${this.settings.showSpheres && this.settings.showCloud ? 'active' : ''}" data-mode="both">Both</button>
        </div>
      </div>
      
      <div class="control-group">
        <label class="control-label">
          Electron Size
          <span class="control-value">${(this.settings.sphereSize * 100).toFixed(0)}%</span>
        </label>
        <input type="range" class="control-slider" id="sphere-size" 
               min="0.2" max="2" step="0.1" value="${this.settings.sphereSize}">
      </div>
      
      <div class="control-group">
        <label class="control-label">
          Electron Opacity
          <span class="control-value">${(this.settings.sphereOpacity * 100).toFixed(0)}%</span>
        </label>
        <input type="range" class="control-slider" id="sphere-opacity" 
               min="0.1" max="1" step="0.05" value="${this.settings.sphereOpacity}">
      </div>
      
      <div class="control-group">
        <label class="control-label">
          Cloud Density
          <span class="control-value">${(this.settings.cloudDensity * 100).toFixed(0)}%</span>
        </label>
        <input type="range" class="control-slider" id="cloud-density" 
               min="0.2" max="2" step="0.1" value="${this.settings.cloudDensity}">
      </div>
      
      <div class="control-group">
        <label class="control-label">
          Nucleon Size
          <span class="control-value">${(this.settings.nucleonSize * 100).toFixed(0)}%</span>
        </label>
        <input type="range" class="control-slider" id="nucleon-size" 
               min="0.5" max="2" step="0.1" value="${this.settings.nucleonSize}">
      </div>
    `;
    }

    _attachEventListeners() {
        // View mode toggles
        this.container.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.settings.showSpheres = mode === 'spheres' || mode === 'both';
                this.settings.showCloud = mode === 'cloud' || mode === 'both';
                this._render();
                this._attachEventListeners();
                this._emitChange();
            });
        });

        // Sphere size slider
        const sphereSizeSlider = this.container.querySelector('#sphere-size');
        if (sphereSizeSlider) {
            sphereSizeSlider.addEventListener('input', (e) => {
                this.settings.sphereSize = parseFloat(e.target.value);
                this._updateValueDisplay(e.target, this.settings.sphereSize);
                this._emitChange();
            });
        }

        // Opacity slider
        const opacitySlider = this.container.querySelector('#sphere-opacity');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                this.settings.sphereOpacity = parseFloat(e.target.value);
                this._updateValueDisplay(e.target, this.settings.sphereOpacity);
                this._emitChange();
            });
        }

        // Cloud density slider
        const densitySlider = this.container.querySelector('#cloud-density');
        if (densitySlider) {
            densitySlider.addEventListener('input', (e) => {
                this.settings.cloudDensity = parseFloat(e.target.value);
                this._updateValueDisplay(e.target, this.settings.cloudDensity);
                this._emitChange();
            });
        }

        // Nucleon size slider
        const nucleonSlider = this.container.querySelector('#nucleon-size');
        if (nucleonSlider) {
            nucleonSlider.addEventListener('input', (e) => {
                this.settings.nucleonSize = parseFloat(e.target.value);
                this._updateValueDisplay(e.target, this.settings.nucleonSize);
                this._emitChange();
            });
        }
    }

    _updateValueDisplay(slider, value) {
        const label = slider.parentElement.querySelector('.control-value');
        if (label) {
            label.textContent = `${(value * 100).toFixed(0)}%`;
        }
    }

    _emitChange() {
        if (this.onSettingsChange) {
            this.onSettingsChange({ ...this.settings });
        }
    }

    getSettings() {
        return { ...this.settings };
    }

    setSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this._render();
        this._attachEventListeners();
    }
}
