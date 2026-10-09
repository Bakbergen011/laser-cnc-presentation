/**
 * SAFETY.JS - Hardware Safety Loop, STO (Safe Torque Off) & Dual-Channel E-Stop Logic
 */

const safetyApp = {
  isEstopTripped: false,

  toggleEmergencyStop() {
    this.isEstopTripped = !this.isEstopTripped;
    const btn = document.getElementById('physical-estop-btn');
    const badge = document.getElementById('estop-status-text');
    const logText = document.getElementById('safety-log-text');
    const machineState = document.getElementById('machine-state-badge');

    // Indicators
    const laserIndicator = document.getElementById('safety-laser-status');
    const servoIndicator = document.getElementById('safety-servo-status');
    const axisIndicator = document.getElementById('safety-axis-status');
    const gasIndicator = document.getElementById('safety-gas-status');
    const alarmIndicator = document.getElementById('safety-alarm-status');
    const alarmBanner = document.getElementById('safety-alarm-banner');

    // Circuit Nodes
    const nodeEstop = document.getElementById('node-estop');
    const nodeRelay = document.getElementById('node-relay');
    const nodeSto = document.getElementById('node-sto');
    const nodeLaser = document.getElementById('node-laser-shutoff');

    if (this.isEstopTripped) {
      if (btn) btn.classList.add('tripped');
      if (badge) {
        badge.className = 'estop-status-badge text-red';
        badge.innerText = 'АВАРИЯ: E-STOP БАСЫЛДЫ (NC ТІЗБЕГІ АШЫҚ)';
      }
      if (machineState) {
        machineState.className = 'status-pill status-alarm';
        machineState.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> EMERGENCY STOP';
      }

      // Update circuit visual state to TRIP
      this.setNodeState(nodeEstop, 'OPEN (0V)', false);
      this.setNodeState(nodeRelay, 'DE-ENERGIZED', false);
      this.setNodeState(nodeSto, 'STO ACTIVE (NO TORQUE)', false);
      this.setNodeState(nodeLaser, 'HARDWARE BLOCKED', false);

      // Section 14 exact status display:
      // LASER -> OFF, SERVO -> STO, AXIS -> STOP, GAS -> OFF, ALARM -> ACTIVE
      if (laserIndicator) { laserIndicator.className = 'status-pill status-alarm'; laserIndicator.innerText = 'OFF'; }
      if (servoIndicator) { servoIndicator.className = 'status-pill status-alarm'; servoIndicator.innerText = 'STO'; }
      if (axisIndicator) { axisIndicator.className = 'status-pill status-alarm'; axisIndicator.innerText = 'STOP'; }
      if (gasIndicator) { gasIndicator.className = 'status-pill status-alarm'; gasIndicator.innerText = 'OFF'; }
      if (alarmIndicator) { alarmIndicator.className = 'status-pill status-alarm animate-pulse'; alarmIndicator.innerText = 'ACTIVE'; }
      if (alarmBanner) alarmBanner.classList.remove('hidden');

      // Immediate hardware actions
      LaserController.turnOff();
      GasController.setPressure(0);
      cncApp.stopCuttingProgram();

      if (logText) {
        logText.innerHTML = `
          <span class="text-red">[TRIP 0.00ms] E-STOP Dual Channel Contacts OPEN (NC broken).</span><br>
          <span class="text-red">[TRIP 1.20ms] Safety Relay de-energized -> STO active (0V).</span><br>
          <span class="text-red">[TRIP 2.40ms] Servo IGBT Drivers disabled -> Zero Torque (AXIS STOP).</span><br>
          <span class="text-red">[TRIP 3.00ms] Laser Shutter Hardware Interlock tripped -> LASER OFF.</span><br>
          <span class="text-red">[TRIP 3.50ms] Assist Gas Solenoid shut -> GAS OFF. ALARM ACTIVE.</span>
        `;
      }

      if (window.SoundFX) SoundFX.alarm();
    } else {
      this.resetSafety();
    }
  },

  resetSafety() {
    this.isEstopTripped = false;
    const btn = document.getElementById('physical-estop-btn');
    const badge = document.getElementById('estop-status-text');
    const logText = document.getElementById('safety-log-text');
    const machineState = document.getElementById('machine-state-badge');

    const laserIndicator = document.getElementById('safety-laser-status');
    const servoIndicator = document.getElementById('safety-servo-status');
    const axisIndicator = document.getElementById('safety-axis-status');
    const gasIndicator = document.getElementById('safety-gas-status');
    const alarmIndicator = document.getElementById('safety-alarm-status');
    const alarmBanner = document.getElementById('safety-alarm-banner');

    const nodeEstop = document.getElementById('node-estop');
    const nodeRelay = document.getElementById('node-relay');
    const nodeSto = document.getElementById('node-sto');
    const nodeLaser = document.getElementById('node-laser-shutoff');

    if (btn) btn.classList.remove('tripped');
    if (badge) {
      badge.className = 'estop-status-badge';
      badge.innerText = 'ЖҮЙЕ ҚАЛЫПТЫ: СЕНІМДІ ТҰЙЫҚТАЛҒАН (NC)';
    }
    if (machineState) {
      machineState.className = 'status-pill status-ready';
      machineState.innerHTML = '<i class="fa-solid fa-circle-check"></i> READY (ДАЙЫН)';
    }

    if (laserIndicator) { laserIndicator.className = 'status-pill status-ready'; laserIndicator.innerText = 'STANDBY'; }
    if (servoIndicator) { servoIndicator.className = 'status-pill status-ready'; servoIndicator.innerText = 'ENABLED'; }
    if (axisIndicator) { axisIndicator.className = 'status-pill status-ready'; axisIndicator.innerText = 'READY'; }
    if (gasIndicator) { gasIndicator.className = 'status-pill status-ready'; gasIndicator.innerText = 'READY'; }
    if (alarmIndicator) { alarmIndicator.className = 'status-pill status-ready'; alarmIndicator.innerText = 'CLEARED'; }
    if (alarmBanner) alarmBanner.classList.add('hidden');

    this.setNodeState(nodeEstop, 'CLOSED (24V)', true);
    this.setNodeState(nodeRelay, 'ENERGIZED', true);
    this.setNodeState(nodeSto, 'TORQUE ENABLED', true);
    this.setNodeState(nodeLaser, 'PERMITTED', true);

    GasController.setPressure(8.2);

    if (logText) {
      logText.innerHTML = `
        [OK] Dual safety channels 1 & 2 verified.<br>
        [OK] Safety Relay contactors closed.<br>
        [OK] STO inputs high (24V). Axes torque ready.<br>
        [OK] Hardware interlocks closed. Normal operation restored.
      `;
    }

    if (window.SoundFX) SoundFX.beep(880, 'sine', 0.1, 0.04);
  },

  setNodeState(node, text, isOk) {
    if (!node) return;
    const stateEl = node.querySelector('.node-state');
    if (stateEl) {
      stateEl.className = `node-state ${isOk ? 'ok' : 'tripped'}`;
      stateEl.innerText = text;
    }
  }
};
