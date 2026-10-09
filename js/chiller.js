/**
 * CHILLER.JS - Dual-Circuit Industrial Water Chiller & Interlock Logic
 */

const ChillerController = {
  laserTempC: 22.4,
  opticsTempC: 28.0,
  waterFlowLMin: 32.5,
  isCompressorOn: true,
  isInterlockAlarm: false,

  setLaserTemp(celsius) {
    this.laserTempC = celsius;
    const hudTemp = document.getElementById('hud-chiller-temp');
    if (hudTemp) hudTemp.innerText = celsius.toFixed(1);

    const chartTemp = document.getElementById('chart-temp-val');
    if (chartTemp) chartTemp.innerText = `${celsius.toFixed(1)} °C`;

    // Interlock check: if temperature > 30°C, emergency shutoff laser
    if (this.laserTempC > 30.0) {
      this.isInterlockAlarm = true;
      LaserController.turnOff();
      console.warn("CHILLER INTERLOCK: High water temperature! Laser cut off.");
    } else {
      this.isInterlockAlarm = false;
    }
  },

  setFlowRate(lmin) {
    this.waterFlowLMin = lmin;
    if (this.waterFlowLMin < 15.0) {
      this.isInterlockAlarm = true;
      LaserController.turnOff();
      console.warn("CHILLER INTERLOCK: Low water flow! Laser cut off.");
    }
  }
};
