/**
 * LASER.JS - Fiber Laser Source, Autofocus Head, Beam Optics & Cutting Sparks
 */

const LaserController = {
  powerKW: 6.0,
  maxPowerKW: 12.0,
  isLaserActive: false,
  shutterOpen: false,
  focalPositionMM: 0.0, // Focal shift ±10mm

  init() {
    this.updateHUD();
  },

  setLaserPower(kw) {
    this.powerKW = Math.max(0, Math.min(this.maxPowerKW, kw));
    this.updateHUD();
  },

  turnOn(kw = null) {
    if (kw !== null) this.powerKW = kw;
    this.isLaserActive = true;
    this.shutterOpen = true;

    // Show 3D beam & sparks
    if (MachineBuilder.laserBeamMesh) {
      MachineBuilder.laserBeamMesh.visible = true;
    }
    if (SceneManager.sparksGroup) {
      SceneManager.sparksGroup.visible = true;
    }

    if (window.SoundFX) SoundFX.laserPulse();
    this.updateHUD();
  },

  turnOff() {
    this.isLaserActive = false;
    this.shutterOpen = false;

    // Hide 3D beam & sparks
    if (MachineBuilder.laserBeamMesh) {
      MachineBuilder.laserBeamMesh.visible = false;
    }
    if (SceneManager.sparksGroup) {
      SceneManager.sparksGroup.visible = false;
    }

    this.updateHUD();
  },

  updateHUD() {
    const powerHud = document.getElementById('hud-power-val');
    if (powerHud) powerHud.innerHTML = `${this.powerKW.toFixed(1)} <small>kW</small>`;

    const chartPower = document.getElementById('chart-power-val');
    if (chartPower) chartPower.innerText = `${this.powerKW.toFixed(1)} kW`;
  }
};
