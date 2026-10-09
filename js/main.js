/**
 * MAIN.JS - Central Application Bootstrap & Navigation Coordinator
 * SENFENG NP 3015 Industrial Automation Digital Twin
 */

const app = {
  currentMode: 'hero', // 'hero', 'architecture', 'sensors', 'control', 'scada', 'safety', 'autocycle', 'faults', 'presentation'
  isExploded: false,
  isEngineeringModalOpen: false,
  isHmiModalOpen: false,
  hmiInterval: null,
  MachineBuilder: null,

  init() {
    console.log("Initializing SENFENG NP 3015 Industrial Automation Digital Twin...");

    // 1. Expose MachineBuilder
    this.MachineBuilder = window.MachineBuilder;

    // 2. Initialize 3D Scene
    SceneManager.init('canvas-container');

    // 3. Initialize Sub-systems
    AxesController.init();
    LaserController.init();
    sensorsApp.init();
    scadaApp.init();
    cncApp.init();
    presentationApp.init();

    // 4. Bind UI Navigation Events
    this.bindNavigation();
    this.bindExplodeControls();
    this.bindGlobalKeys();
    this.bindChapterDock();
    this.startHmiLiveData();
  },

  bindNavigation() {
    // Mode Buttons in Top Nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        if (mode) {
          this.switchMode(mode);
          if (window.SoundFX) SoundFX.click();
        }
      });
    });

    // Sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        SoundFX.enabled = !SoundFX.enabled;
        soundBtn.innerHTML = SoundFX.enabled ? '<i class="fa-solid fa-volume-high"></i>' : '<i class="fa-solid fa-volume-xmark"></i>';
        soundBtn.classList.toggle('active', SoundFX.enabled);
      });
    }

    // Engineering mode toggle
    const engBtn = document.getElementById('eng-mode-btn');
    if (engBtn) {
      engBtn.addEventListener('click', () => {
        this.toggleEngineeringMode();
        if (window.SoundFX) SoundFX.click();
      });
    }

    // Component details drawer close
    const drawerClose = document.getElementById('drawer-close-btn');
    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        const drawer = document.getElementById('component-drawer');
        if (drawer) drawer.classList.remove('active');
        if (window.SoundFX) SoundFX.click();
      });
    }

    // Architecture tabs
    document.querySelectorAll('.arch-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.arch-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.getElementById('arch-tab-signals')?.classList.toggle('active', tab === 'signals');
        document.getElementById('arch-tab-power')?.classList.toggle('active', tab === 'power-control');
        document.getElementById('arch-tab-cabinet')?.classList.toggle('active', tab === 'cabinet-view');
        if (window.SoundFX) SoundFX.click();
      });
    });
  },

  bindChapterDock() {
    document.querySelectorAll('.chap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chapterIdx = parseInt(btn.dataset.chapter);
        if (!isNaN(chapterIdx)) {
          this.goToChapter(chapterIdx);
          if (window.SoundFX) SoundFX.click();
        }
      });
    });
  },

  goToChapter(index) {
    if (this.currentMode !== 'presentation') {
      this.switchMode('presentation');
    }
    presentationApp.goToSlide(index + 1);
    this.updateChapterDock(index);
  },

  updateChapterDock(index) {
    document.querySelectorAll('.chap-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === index);
    });
  },

  switchMode(modeKey) {
    this.currentMode = modeKey;

    // Close camera dropdown if open
    CameraController.closeDropdown();

    // Update Nav Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === modeKey);
    });

    // Hide all HUD views
    document.querySelectorAll('.hud-view').forEach(view => {
      view.classList.remove('active');
    });

    // Show active HUD view
    const targetHud = document.getElementById(`${modeKey}-hud`);
    if (targetHud) {
      targetHud.classList.add('active');
    }

    // Close drawers/modals on view switch
    document.getElementById('component-drawer')?.classList.remove('active');
    document.getElementById('engineering-modal')?.classList.add('hidden');
    document.getElementById('hmi-modal')?.classList.add('hidden');

    // Contextual Camera Movement based on Mode
    if (modeKey === 'hero') {
      CameraController.flyTo('overview');
      SceneManager.isIdleAnimating = true;
      this.updateChapterDock(0);
    } else if (modeKey === 'architecture') {
      CameraController.flyTo('overview');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(1);
    } else if (modeKey === 'sensors') {
      CameraController.flyTo('head');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(6);
    } else if (modeKey === 'control') {
      CameraController.flyTo('gantry');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(2);
    } else if (modeKey === 'scada') {
      CameraController.flyTo('cabinet');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(8);
    } else if (modeKey === 'safety') {
      CameraController.flyTo('safety');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(9);
    } else if (modeKey === 'autocycle') {
      CameraController.flyTo('overview');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(7);
    } else if (modeKey === 'faults') {
      CameraController.flyTo('overview');
      SceneManager.isIdleAnimating = false;
      this.updateChapterDock(10);
    } else if (modeKey === 'presentation') {
      presentationApp.renderCurrentSlide();
      SceneManager.isIdleAnimating = false;
    }
  },

  bindExplodeControls() {
    const explodeBtn = document.getElementById('explode-view-btn');
    if (explodeBtn) {
      explodeBtn.addEventListener('click', () => {
        this.toggleExplodeView();
        if (window.SoundFX) SoundFX.click();
      });
    }

    const slider = document.getElementById('explode-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        const factor = parseFloat(e.target.value) / 100;
        MachineBuilder.setExplodeDistance(factor);
      });
    }

    // Layer checkboxes
    document.querySelectorAll('.layer-toggle').forEach(chk => {
      chk.addEventListener('change', () => {
        const layerIdx = parseInt(chk.dataset.layer);
        MachineBuilder.toggleLayerVisibility(layerIdx, chk.checked);
      });
    });
  },

  toggleExplodeView() {
    this.isExploded = !this.isExploded;
    const panel = document.getElementById('layers-panel');
    const btn = document.getElementById('explode-view-btn');

    if (panel) panel.classList.toggle('hidden', !this.isExploded);
    if (btn) btn.classList.toggle('active', this.isExploded);

    if (this.isExploded) {
      MachineBuilder.setExplodeDistance(0.7);
      CameraController.flyTo('overview', 1.4);
    } else {
      MachineBuilder.setExplodeDistance(0);
    }
  },

  toggleEngineeringMode() {
    this.isEngineeringModalOpen = !this.isEngineeringModalOpen;
    const modal = document.getElementById('engineering-modal');
    if (modal) modal.classList.toggle('hidden', !this.isEngineeringModalOpen);
  },

  toggleHmiModal() {
    this.isHmiModalOpen = !this.isHmiModalOpen;
    const modal = document.getElementById('hmi-modal');
    if (modal) modal.classList.toggle('hidden', !this.isHmiModalOpen);
  },

  startHmiLiveData() {
    // Live micro-fluctuations for the Operator Station HMI
    this.hmiInterval = setInterval(() => {
      const hmiX = document.getElementById('hmi-val-x');
      const hmiY = document.getElementById('hmi-val-y');
      const hmiZ = document.getElementById('hmi-val-z');
      const hmiSpeed = document.getElementById('hmi-val-speed');
      const hmiLaser = document.getElementById('hmi-val-laser');
      const hmiGas = document.getElementById('hmi-val-gas');
      const hmiChiller = document.getElementById('hmi-val-chiller');

      if (hmiX) {
        const baseX = AxesController?.position ? (AxesController.position.x * 2.5 + 500) : 1250.25;
        const jitter = (Math.random() * 0.04 - 0.02).toFixed(2);
        hmiX.innerText = (baseX + parseFloat(jitter)).toFixed(2);
      }
      if (hmiY) {
        const baseY = AxesController?.position ? (AxesController.position.y * 2.5 + 300) : 730.40;
        const jitter = (Math.random() * 0.04 - 0.02).toFixed(2);
        hmiY.innerText = (baseY + parseFloat(jitter)).toFixed(2);
      }
      if (hmiZ) {
        const baseZ = AxesController?.position ? AxesController.position.z : 18.20;
        const jitter = (Math.random() * 0.02 - 0.01).toFixed(2);
        hmiZ.innerText = (baseZ + parseFloat(jitter)).toFixed(2);
      }
      if (hmiSpeed) {
        const jitter = Math.floor(Math.random() * 15 - 7);
        hmiSpeed.innerText = 8500 + jitter;
      }
      if (hmiLaser) {
        const jitter = (Math.random() * 0.6 - 0.3).toFixed(1);
        hmiLaser.innerText = (65.0 + parseFloat(jitter)).toFixed(1);
      }
      if (hmiGas) {
        const jitter = (Math.random() * 0.02 - 0.01).toFixed(2);
        hmiGas.innerText = (1.20 + parseFloat(jitter)).toFixed(2);
      }
      if (hmiChiller) {
        const jitter = (Math.random() * 0.2 - 0.1).toFixed(1);
        hmiChiller.innerText = (22.4 + parseFloat(jitter)).toFixed(1);
      }
    }, 800);
  },

  bindGlobalKeys() {
    window.addEventListener('keydown', (e) => {
      // Presentation navigation
      if (this.currentMode === 'presentation') {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Space' || e.code === 'Space' || e.key === 'PageDown') {
          e.preventDefault();
          presentationApp.nextSlide();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          presentationApp.prevSlide();
        } else if (e.key === 'Home') {
          e.preventDefault();
          presentationApp.goToSlide(1);
        } else if (e.key === 'End') {
          e.preventDefault();
          presentationApp.goToSlide(presentationApp.totalSlides);
        }
      }

      // R key: Universal Reset (Alarms reset, program rewind, or homing)
      if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        if (window.faultsApp) faultsApp.resetAllFaults();
        if (window.safetyApp && safetyApp.isEstopTripped) safetyApp.resetSafety();
        if (window.cncApp && !cncApp.isRunning) cncApp.resetCuttingProgram();
        if (window.AxesController) AxesController.homeAll();
        if (window.SoundFX) SoundFX.click();
      }

      // Escape key: Close modals, drawers, and reset focus
      if (e.key === 'Escape') {
        document.getElementById('component-drawer')?.classList.remove('active');
        document.getElementById('layers-panel')?.classList.add('hidden');
        document.getElementById('engineering-modal')?.classList.add('hidden');
        document.getElementById('hmi-modal')?.classList.add('hidden');
        CameraController.closeDropdown();
      }
    });
  }
};

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = app;
  app.init();
});
