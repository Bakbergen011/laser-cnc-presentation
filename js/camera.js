/**
 * CAMERA.JS - Cinematic Camera Management, Preset Transitions & Collapsible Dropdown
 * Handles smooth GSAP camera movements for digital twin inspection
 */

const CameraController = {
  camera: null,
  controls: null,
  isTransitioning: false,
  isDropdownOpen: false,

  // Predefined cinematic camera positions tailored for SENFENG 3015NP
  presets: {
    // 7 Core Engineering Presets as specified
    front: {
      position: { x: 0.0, y: 2.2, z: 5.2 },
      target: { x: 0, y: 0.7, z: 0 },
      duration: 1.5,
      name: "[01] FRONT"
    },
    top: {
      position: { x: 0, y: 6.4, z: 0.05 },
      target: { x: 0, y: 0.5, z: 0 },
      duration: 1.5,
      name: "[02] TOP"
    },
    side: {
      position: { x: 5.2, y: 2.0, z: 0.0 },
      target: { x: 0, y: 0.7, z: 0 },
      duration: 1.5,
      name: "[03] SIDE"
    },
    head: {
      position: { x: 0.55, y: 1.35, z: 0.95 },
      target: { x: 0.05, y: 0.88, z: 0.1 },
      duration: 1.2,
      name: "[04] CUTTING HEAD"
    },
    cabinet: {
      position: { x: 2.8, y: 1.25, z: 1.85 },
      target: { x: 1.6, y: 0.85, z: 0.8 },
      duration: 1.4,
      name: "[05] ELECTRICAL CABINET"
    },
    servo: {
      position: { x: 1.8, y: 1.7, z: 1.4 },
      target: { x: 0.3, y: 0.85, z: 0.1 },
      duration: 1.4,
      name: "[06] SERVO SYSTEM"
    },
    station: {
      position: { x: 1.8, y: 1.35, z: 1.8 },
      target: { x: 1.15, y: 1.05, z: 1.0 },
      duration: 1.4,
      name: "[07] OPERATOR STATION"
    },

    // Backward-compatible aliases for existing flows
    overview: {
      position: { x: 4.2, y: 3.2, z: 4.8 },
      target: { x: 0, y: 0.8, z: 0 },
      duration: 1.6,
      name: "Жалпы көрініс"
    },
    gantry: {
      position: { x: 2.2, y: 2.0, z: 2.4 },
      target: { x: 0.2, y: 1.1, z: 0 },
      duration: 1.4,
      name: "X/Y Портал"
    },
    laser: {
      position: { x: 2.8, y: 1.6, z: -0.6 },
      target: { x: 1.6, y: 0.6, z: -0.6 },
      duration: 1.4,
      name: "Лазер көзі"
    },
    chiller: {
      position: { x: -2.8, y: 1.5, z: -1.5 },
      target: { x: -1.6, y: 0.5, z: -0.8 },
      duration: 1.4,
      name: "Чиллер"
    },
    safety: {
      position: { x: 2.6, y: 1.5, z: 2.2 },
      target: { x: 1.2, y: 0.7, z: 0.8 },
      duration: 1.4,
      name: "Қауіпсіздік"
    }
  },

  init(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.bindEvents();
  },

  bindEvents() {
    // Collapsible Trigger Button
    const toggleBtn = document.getElementById('cam-toggle-btn');
    const menu = document.getElementById('cam-dropdown-menu');

    if (toggleBtn && menu) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDropdown();
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.camera-toolbar-wrapper')) {
          this.closeDropdown();
        }
      });
    }

    // Camera preset buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const camKey = btn.dataset.cam;
        if (camKey && this.presets[camKey]) {
          document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const nameEl = document.getElementById('current-cam-name');
          if (nameEl) nameEl.innerText = this.presets[camKey].name;

          this.flyTo(camKey);
          this.closeDropdown();

          if (window.SoundFX) SoundFX.click();
        }
      });
    });
  },

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    const menu = document.getElementById('cam-dropdown-menu');
    const toggleBtn = document.getElementById('cam-toggle-btn');

    if (menu) menu.classList.toggle('hidden', !this.isDropdownOpen);
    if (toggleBtn) toggleBtn.classList.toggle('open', this.isDropdownOpen);

    if (window.SoundFX) SoundFX.click();
  },

  closeDropdown() {
    this.isDropdownOpen = false;
    const menu = document.getElementById('cam-dropdown-menu');
    const toggleBtn = document.getElementById('cam-toggle-btn');

    if (menu) menu.classList.add('hidden');
    if (toggleBtn) toggleBtn.classList.remove('open');
  },

  flyTo(presetKey, customDuration = null, onComplete = null) {
    const preset = this.presets[presetKey];
    if (!preset || !this.camera || !this.controls) return;

    this.isTransitioning = true;
    const dur = customDuration || preset.duration;

    // Update trigger button label
    const nameEl = document.getElementById('current-cam-name');
    if (nameEl && preset.name) nameEl.innerText = preset.name;

    // Update active button state
    document.querySelectorAll('.cam-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cam === presetKey);
    });

    if (window.gsap) {
      gsap.killTweensOf(this.camera.position);
      gsap.killTweensOf(this.controls.target);

      gsap.to(this.camera.position, {
        x: preset.position.x,
        y: preset.position.y,
        z: preset.position.z,
        duration: dur,
        ease: "power2.inOut"
      });

      gsap.to(this.controls.target, {
        x: preset.target.x,
        y: preset.target.y,
        z: preset.target.z,
        duration: dur,
        ease: "power2.inOut",
        onUpdate: () => {
          this.controls.update();
        },
        onComplete: () => {
          this.isTransitioning = false;
          if (onComplete) onComplete();
        }
      });
    } else {
      this.camera.position.set(preset.position.x, preset.position.y, preset.position.z);
      this.controls.target.set(preset.target.x, preset.target.y, preset.target.z);
      this.controls.update();
      this.isTransitioning = false;
      if (onComplete) onComplete();
    }
  },

  focusOnObject(obj3d, offset = { x: 1.2, y: 0.8, z: 1.2 }) {
    if (!obj3d || !this.camera || !this.controls) return;
    
    const worldPos = new THREE.Vector3();
    obj3d.getWorldPosition(worldPos);

    gsap.to(this.camera.position, {
      x: worldPos.x + offset.x,
      y: worldPos.y + offset.y,
      z: worldPos.z + offset.z,
      duration: 1.2,
      ease: "power2.out"
    });

    gsap.to(this.controls.target, {
      x: worldPos.x,
      y: worldPos.y,
      z: worldPos.z,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => this.controls.update()
    });
  }
};
