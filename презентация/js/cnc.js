/**
 * CNC.JS - Extended Industrial G-Code Program, Toolpath Trajectory & Multi-Part Cutting Engine
 */

const cncApp = {
  isRunning: false,
  currentLineIndex: 0,
  totalCutLengthMM: 0,
  totalProgramSteps: 34,

  // Full Realistic Multi-Part Laser Cutting Job on 3050x1530mm Sheet
  cuttingProgram: [
    { num: 'N010', cmd: 'G21', comment: '(Metric Units Millimeters)', type: 'setup' },
    { num: 'N020', cmd: 'G90', comment: '(Absolute Coordinate Programming)', type: 'setup' },
    { num: 'N030', cmd: 'G54', comment: '(Workpiece Coordinate System 1 Active)', type: 'setup' },
    { num: 'N040', cmd: 'M08 P8.5', comment: '(High-Pressure Assist Gas N2 ON, 8.5 bar)', type: 'gas_on', gas: 'N2', pressure: 8.5 },
    { num: 'N050', cmd: 'G04 P250', comment: '(Gas Pre-flow & Pressure Stabilization Delay)', type: 'dwell', ms: 250 },
    
    // --- PART 1: INDUSTRIAL MOUNTING FLANGE (Outer Contour & Arcs) ---
    { num: 'N060', cmd: 'G00 X350.00 Y250.00 Z50.00', comment: '(Part 1: Rapid Travel to Piercing Lead-in)', type: 'rapid', x: 350, y: 250, z: 50 },
    { num: 'N070', cmd: 'G01 Z1.00 F3000', comment: '(Capacitive Auto-Height Tracking to 1.0mm)', type: 'height_track', z: 1.0 },
    { num: 'N080', cmd: 'M03 S6000', comment: '(Laser ON 6.0kW High-Frequency Piercing)', type: 'laser_on', kw: 6.0, z: 1.0, dwellMs: 300 },
    { num: 'N090', cmd: 'G01 X380.00 F5000', comment: '(Lead-in Linear Smooth Cut)', type: 'cut', x: 380, y: 250, z: 1.0, length: 30 },
    { num: 'N100', cmd: 'G01 X750.00 F6500', comment: '(Linear Cut: Flange Bottom Edge)', type: 'cut', x: 750, y: 250, z: 1.0, length: 370 },
    { num: 'N110', cmd: 'G02 X800.00 Y300.00 R50.00', comment: '(Circular Arc: Bottom-Right Corner Radius)', type: 'cut', x: 800, y: 300, z: 1.0, length: 78.5 },
    { num: 'N120', cmd: 'G01 Y550.00', comment: '(Linear Cut: Flange Right Side)', type: 'cut', x: 800, y: 550, z: 1.0, length: 250 },
    { num: 'N130', cmd: 'G02 X750.00 Y600.00 R50.00', comment: '(Circular Arc: Top-Right Corner Radius)', type: 'cut', x: 750, y: 600, z: 1.0, length: 78.5 },
    { num: 'N140', cmd: 'G01 X380.00', comment: '(Linear Cut: Flange Top Edge)', type: 'cut', x: 380, y: 600, z: 1.0, length: 370 },
    { num: 'N150', cmd: 'G02 X330.00 Y550.00 R50.00', comment: '(Circular Arc: Top-Left Corner Radius)', type: 'cut', x: 330, y: 550, z: 1.0, length: 78.5 },
    { num: 'N160', cmd: 'G01 Y300.00', comment: '(Linear Cut: Flange Left Side)', type: 'cut', x: 330, y: 300, z: 1.0, length: 250 },
    { num: 'N170', cmd: 'G02 X380.00 Y250.00 R50.00', comment: '(Close Profile & Smooth Lead-out)', type: 'cut', x: 380, y: 250, z: 1.0, length: 78.5 },
    { num: 'N180', cmd: 'M05', comment: '(Part 1 Laser OFF)', type: 'laser_off' },
    
    // --- PART 2: INNER MOUNTING HOLES (Circular Interpolation) ---
    { num: 'N190', cmd: 'G00 Z30.00', comment: '(Z-Axis Rapid Retract to Clearance Height)', type: 'rapid_z', z: 30 },
    { num: 'N200', cmd: 'G00 X565.00 Y425.00', comment: '(Part 2: Rapid to Center Hole Position)', type: 'rapid', x: 565, y: 425, z: 30 },
    { num: 'N210', cmd: 'G01 Z1.00 F4000', comment: '(Capacitive Sensor Engaged)', type: 'height_track', z: 1.0 },
    { num: 'N220', cmd: 'M03 S7000', comment: '(Laser ON 7.0kW Center Piercing)', type: 'laser_on', kw: 7.0, z: 1.0, dwellMs: 200 },
    { num: 'N230', cmd: 'G02 X565.00 Y425.00 I0.0 J-60.0 F4500', comment: '(Full 360° Circular Hole ⌀120mm Cut)', type: 'cut', x: 565, y: 425, z: 1.0, length: 377 },
    { num: 'N240', cmd: 'M05', comment: '(Hole Cut Complete: Laser OFF)', type: 'laser_off' },
    
    // --- PART 3: HEAVY-DUTY BRACKET (Chamfered Precision Profile) ---
    { num: 'N250', cmd: 'G00 Z40.00', comment: '(Z-Axis Retract for Part 3 Jump)', type: 'rapid_z', z: 40 },
    { num: 'N260', cmd: 'G00 X950.00 Y200.00', comment: '(Part 3: Rapid Travel to Nesting Area B)', type: 'rapid', x: 950, y: 200, z: 40 },
    { num: 'N270', cmd: 'G01 Z1.00 F3500', comment: '(Height Tracking Auto Lock 1.0mm)', type: 'height_track', z: 1.0 },
    { num: 'N280', cmd: 'M03 S6000', comment: '(Laser ON 6.0kW Piercing)', type: 'laser_on', kw: 6.0, z: 1.0, dwellMs: 250 },
    { num: 'N290', cmd: 'G01 X1250.00 F6000', comment: '(Linear Cut: Base Line)', type: 'cut', x: 1250, y: 200, z: 1.0, length: 300 },
    { num: 'N300', cmd: 'G01 X1350.00 Y450.00', comment: '(Diagonal Cut: 45° Chamfered Rib)', type: 'cut', x: 1350, y: 450, z: 1.0, length: 269 },
    { num: 'N310', cmd: 'G01 X950.00 Y450.00', comment: '(Linear Cut: Top Bracket Flange)', type: 'cut', x: 950, y: 450, z: 1.0, length: 400 },
    { num: 'N320', cmd: 'G01 X950.00 Y200.00', comment: '(Close Bracket Contour)', type: 'cut', x: 950, y: 200, z: 1.0, length: 250 },
    { num: 'N330', cmd: 'M05', comment: '(Laser OFF)', type: 'laser_off' },
    
    // --- JOB COMPLETE & SAFE PARKING ---
    { num: 'N340', cmd: 'M09', comment: '(Assist Gas OFF & Line Purge)', type: 'gas_off' },
    { num: 'N350', cmd: 'G00 Z100.00', comment: '(Z-Axis Full Retract to Safe Park Height)', type: 'rapid_z', z: 100 },
    { num: 'N360', cmd: 'G00 X0.00 Y0.00', comment: '(Return to Home / Unloading Position)', type: 'rapid', x: 0, y: 0, z: 100 },
    { num: 'N370', cmd: 'M30', comment: '(Program End & Rewind - Parts Ready)', type: 'end' }
  ],

  init() {
    this.renderGcodeList();
    this.updateMetrics();
  },

  renderGcodeList() {
    const listEl = document.getElementById('gcode-editor-list');
    if (!listEl) return;

    listEl.innerHTML = this.cuttingProgram.map((line, idx) => `
      <div class="gcode-line ${idx === 0 ? 'active-line' : ''}" id="gcode-row-${idx}">
        <span class="ln-num">${line.num}</span>
        <span class="ln-cmd">${line.cmd}</span>
        <span class="ln-comment">${line.comment}</span>
      </div>
    `).join('');
  },

  startCuttingProgram() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentLineIndex = 0;
    this.totalCutLengthMM = 0;

    const startBtn = document.getElementById('start-cut-btn');
    const badge = document.getElementById('gcode-status-badge');

    if (startBtn) {
      startBtn.classList.add('active');
      startBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> КЕСУ ТРАЕКТОРИЯСЫ ОРЫНДАЛУДА...';
    }
    if (badge) {
      badge.className = 'badge-mode status-warn';
      badge.innerText = 'EXECUTING (КЕСУДЕ)';
    }

    this.executeNextStep();
  },

  executeNextStep() {
    if (!this.isRunning || this.currentLineIndex >= this.cuttingProgram.length) {
      this.finishCuttingProgram();
      return;
    }

    const step = this.cuttingProgram[this.currentLineIndex];
    this.highlightRow(this.currentLineIndex);
    this.updateMetrics();

    // 1. Setup & Gas commands
    if (step.type === 'setup') {
      setTimeout(() => {
        this.currentLineIndex++;
        this.executeNextStep();
      }, 150);
    } else if (step.type === 'gas_on') {
      GasController.setGasType(step.gas);
      GasController.setPressure(step.pressure);
      setTimeout(() => {
        this.currentLineIndex++;
        this.executeNextStep();
      }, 250);
    } else if (step.type === 'dwell') {
      setTimeout(() => {
        this.currentLineIndex++;
        this.executeNextStep();
      }, step.ms);
    } else if (step.type === 'rapid') {
      AxesController.moveTo(step.x, step.y, step.z, 0.9, () => {
        this.currentLineIndex++;
        this.executeNextStep();
      });
    } else if (step.type === 'rapid_z') {
      AxesController.moveTo(AxesController.position.x, AxesController.position.y, step.z, 0.4, () => {
        this.currentLineIndex++;
        this.executeNextStep();
      });
    } else if (step.type === 'height_track') {
      AxesController.moveTo(AxesController.position.x, AxesController.position.y, step.z, 0.35, () => {
        this.currentLineIndex++;
        this.executeNextStep();
      });
    } else if (step.type === 'laser_on') {
      LaserController.turnOn(step.kw);
      setTimeout(() => {
        this.currentLineIndex++;
        this.executeNextStep();
      }, step.dwellMs || 250);
    } else if (step.type === 'cut') {
      this.totalCutLengthMM += (step.length || 50);
      AxesController.moveTo(step.x, step.y, step.z, 0.95, () => {
        this.currentLineIndex++;
        this.executeNextStep();
      });
    } else if (step.type === 'laser_off') {
      LaserController.turnOff();
      setTimeout(() => {
        this.currentLineIndex++;
        this.executeNextStep();
      }, 150);
    } else if (step.type === 'gas_off') {
      GasController.setPressure(0);
      setTimeout(() => {
        this.currentLineIndex++;
        this.executeNextStep();
      }, 150);
    } else if (step.type === 'end') {
      this.finishCuttingProgram();
    }
  },

  highlightRow(idx) {
    const listEl = document.getElementById('gcode-editor-list');
    const rows = document.querySelectorAll('.gcode-line');
    
    rows.forEach((r, i) => {
      r.classList.remove('active-line');
      if (i < idx) r.classList.add('completed-line');
    });

    const activeRow = document.getElementById(`gcode-row-${idx}`);
    if (activeRow) {
      activeRow.classList.add('active-line');
      activeRow.classList.remove('completed-line');
      // Auto-scroll list to keep active line centered
      if (listEl) {
        listEl.scrollTop = activeRow.offsetTop - listEl.offsetTop - 80;
      }
    }
  },

  updateMetrics() {
    const stepEl = document.getElementById('gcode-step-counter');
    const progEl = document.getElementById('gcode-progress-percent');
    const cutEl = document.getElementById('gcode-cut-length');

    const total = this.cuttingProgram.length;
    const curr = Math.min(total, this.currentLineIndex + 1);
    const pct = Math.round((curr / total) * 100);

    if (stepEl) stepEl.innerText = `${String(curr).padStart(2, '0')} / ${total}`;
    if (progEl) progEl.innerText = `${pct}%`;
    if (cutEl) cutEl.innerText = `${this.totalCutLengthMM.toFixed(1)} mm`;
  },

  stopCuttingProgram() {
    this.isRunning = false;
    LaserController.turnOff();

    const startBtn = document.getElementById('start-cut-btn');
    const badge = document.getElementById('gcode-status-badge');

    if (startBtn) {
      startBtn.classList.remove('active');
      startBtn.innerHTML = '<i class="fa-solid fa-scissors"></i> [START CUTTING] ТОЛЫҚ КЕСУ ТРАЕКТОРИЯСЫН БАСТАУ';
    }
    if (badge) {
      badge.className = 'badge-mode';
      badge.innerText = 'PAUSED / STOPPED';
    }
  },

  resetCuttingProgram() {
    this.stopCuttingProgram();
    this.currentLineIndex = 0;
    this.totalCutLengthMM = 0;
    this.highlightRow(0);
    this.updateMetrics();
    AxesController.homeAll();

    const badge = document.getElementById('gcode-status-badge');
    if (badge) {
      badge.className = 'badge-mode';
      badge.innerText = 'READY';
    }
    if (window.SoundFX) SoundFX.click();
  },

  finishCuttingProgram() {
    this.isRunning = false;
    LaserController.turnOff();

    const startBtn = document.getElementById('start-cut-btn');
    const badge = document.getElementById('gcode-status-badge');

    if (startBtn) {
      startBtn.classList.remove('active');
      startBtn.innerHTML = '<i class="fa-solid fa-check"></i> КЕСУ СӘТТІ АЯҚТАЛДЫ (START AGAIN)';
    }
    if (badge) {
      badge.className = 'badge-mode status-ready';
      badge.innerText = 'COMPLETED (100%)';
    }

    if (window.SoundFX) SoundFX.beep(1200, 'sine', 0.25, 0.08);
  }
};
