/**
 * AXES.JS - Real-Time CNC Kinematics, Jogging, Homing & Coordinates (DRO)
 * Maps machine coordinates (0-3050 mm X, 0-1530 mm Y, 0-120 mm Z) to Three.js transforms.
 */

const AxesController = {
  // Physical Machine Coordinates (in mm)
  position: {
    x: 1250.420,
    y: 620.180,
    z: 1.000
  },

  // Machine Limits for SENFENG 3015NP (in mm)
  limits: {
    xMin: 0, xMax: 1530,
    yMin: 0, yMax: 3050,
    zMin: 0, zMax: 120
  },

  feedrate: 60, // m/min
  isMoving: false,

  init() {
    this.bindEvents();
    this.update3DTransforms();
    this.updateDRO();
  },

  bindEvents() {
    // Jog Buttons
    const bindJog = (id, axis, dir) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', () => {
        this.jog(axis, dir * 50); // Jog step 50mm
        if (window.SoundFX) SoundFX.click();
      });
    };

    bindJog('jog-x-plus', 'x', 1);
    bindJog('jog-x-minus', 'x', -1);
    bindJog('jog-y-plus', 'y', 1);
    bindJog('jog-y-minus', 'y', -1);
    bindJog('jog-z-plus', 'z', 1);
    bindJog('jog-z-minus', 'z', -1);

    // Home Button
    const homeBtn = document.getElementById('jog-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        this.homeAll();
        if (window.SoundFX) SoundFX.click();
      });
    }

    // Feedrate Slider
    const feedSlider = document.getElementById('feedrate-slider');
    if (feedSlider) {
      feedSlider.addEventListener('input', (e) => {
        this.feedrate = parseInt(e.target.value);
        const feedVal = document.getElementById('feedrate-val');
        if (feedVal) feedVal.innerText = `${this.feedrate} m/min`;
      });
    }
  },

  jog(axis, delta) {
    this.position[axis] = Math.max(
      this.limits[`${axis}Min`],
      Math.min(this.limits[`${axis}Max`], this.position[axis] + delta)
    );
    this.update3DTransforms();
    this.updateDRO();
  },

  moveTo(targetX, targetY, targetZ = null, duration = 1.0, onComplete = null) {
    if (!window.gsap) {
      this.position.x = targetX;
      this.position.y = targetY;
      if (targetZ !== null) this.position.z = targetZ;
      this.update3DTransforms();
      this.updateDRO();
      if (onComplete) onComplete();
      return;
    }

    this.isMoving = true;
    const targetObj = { x: targetX, y: targetY };
    if (targetZ !== null) targetObj.z = targetZ;

    gsap.to(this.position, {
      ...targetObj,
      duration: duration,
      ease: "power1.inOut",
      onUpdate: () => {
        this.update3DTransforms();
        this.updateDRO();
      },
      onComplete: () => {
        this.isMoving = false;
        if (onComplete) onComplete();
      }
    });
  },

  homeAll() {
    this.moveTo(0, 0, 100, 1.8, () => {
      console.log("Homing complete: All axes at Zero reference limit switches.");
    });
  },

  update3DTransforms() {
    // Convert mm coordinates to Three.js scene units
    // X Machine: 0 to 1530mm -> maps to -0.65 to +0.65 on X-Carriage
    const threeX = ((this.position.x / 1530) - 0.5) * 1.3;

    // Y Machine: 0 to 3050mm -> maps to +1.2 to -1.2 on Gantry (Z axis in Three.js)
    const threeY = (0.5 - (this.position.y / 3050)) * 2.4;

    // Z Machine: 0 to 120mm -> maps to -0.05 to +0.08 on Z slide
    const threeZ = ((this.position.z / 120) * 0.12);

    if (MachineBuilder.gantryGroup) {
      MachineBuilder.gantryGroup.position.z = threeY;
    }
    if (MachineBuilder.carriageGroup) {
      MachineBuilder.carriageGroup.position.x = threeX;
    }
    if (MachineBuilder.zSlideGroup) {
      MachineBuilder.zSlideGroup.position.y = threeZ;
    }
  },

  updateDRO() {
    // Update Control View DRO
    const droX = document.getElementById('dro-x');
    const droY = document.getElementById('dro-y');
    const droZ = document.getElementById('dro-z');
    if (droX) droX.innerText = this.position.x.toFixed(3);
    if (droY) droY.innerText = this.position.y.toFixed(3);
    if (droZ) droZ.innerText = this.position.z.toFixed(3);

    // Update Bottom Status Ribbon Coordinates
    const posX = document.getElementById('pos-x-val');
    const posY = document.getElementById('pos-y-val');
    const posZ = document.getElementById('pos-z-val');
    if (posX) posX.innerText = this.position.x.toFixed(2);
    if (posY) posY.innerText = this.position.y.toFixed(2);
    if (posZ) posZ.innerText = this.position.z.toFixed(2);
  }
};
