/**
 * SERVO.JS - Closed-Loop Servo Drive & PID Position Error Convergence Simulation
 * Full closed-loop cycle: Setpoint 100.00mm -> Feedback 98.40mm -> Error 1.60mm -> Correction -> Feedback 99.95mm -> Target 100.00mm
 */

const servoApp = {
  setpointMM: 100.00,
  feedbackMM: 98.40,
  currentErrorMM: 1.60,
  isTesting: false,

  simulateStepResponse() {
    if (this.isTesting) return;
    this.isTesting = true;

    // Progression: Initial Error (1.60mm) -> Fast Correction -> Fine Trimming -> Zero Error Target
    const steps = [
      { feedback: 98.40, error: 1.60, label: "БАСТАПҚЫ КЕРІ БАЙЛАНЫС: 98.40 mm (ҚАТЕЛІК: 1.60 mm)", status: "ERROR DETECTED", bar: 40 },
      { feedback: 99.20, error: 0.80, label: "PID ТҮЗЕТУ: 99.20 mm (ҚАТЕЛІК: 0.80 mm)", status: "CORRECTING...", bar: 65 },
      { feedback: 99.80, error: 0.20, label: "ТОҚ / ЖЫЛДАМДЫҚ КОНТУРЫ: 99.80 mm", status: "TRIMMING...", bar: 85 },
      { feedback: 99.95, error: 0.05, label: "КОНТРОЛЛЕР ТҮЗЕТУІ: 99.95 mm (ҚАТЕЛІК: 0.05 mm)", status: "FINE CORRECTION", bar: 95 },
      { feedback: 100.00, error: 0.00, label: "МАҚСАТТЫ ТҰРАҚТАЛУ: 100.00 mm (ДӘЛДІК: 0.00 mm)", status: "TARGET REACHED", bar: 100 }
    ];
    let stepIndex = 0;

    const clSetpoint = document.getElementById('cl-setpoint');
    const clFeedback = document.getElementById('cl-feedback');
    const clError = document.getElementById('cl-error');
    const clStatus = document.getElementById('cl-status');
    const barFill = document.getElementById('conv-bar-fill');
    const stepEls = document.querySelectorAll('.conv-steps span');

    if (clSetpoint) clSetpoint.innerText = `SETPOINT: ${this.setpointMM.toFixed(2)} mm`;
    if (clStatus) {
      clStatus.className = 'status-pill status-warn';
      clStatus.innerText = 'КОНТРОЛЛЕР ТҮЗЕТУДЕ...';
    }

    const interval = setInterval(() => {
      const s = steps[stepIndex];
      this.currentErrorMM = s.error;
      this.feedbackMM = s.feedback;

      if (clFeedback) clFeedback.innerText = `FEEDBACK: ${s.feedback.toFixed(2)} mm`;
      if (clError) clError.innerText = `Қателік: ${s.error.toFixed(2)} mm`;
      if (barFill) barFill.style.width = `${s.bar}%`;

      stepEls.forEach((el, idx) => {
        el.classList.toggle('active', idx === stepIndex);
      });

      if (window.SoundFX) SoundFX.beep(480 + stepIndex * 130, 'sine', 0.07, 0.03);

      stepIndex++;

      if (stepIndex >= steps.length) {
        clearInterval(interval);
        this.isTesting = false;
        if (clStatus) {
          clStatus.className = 'status-pill status-ready';
          clStatus.innerText = 'TARGET STABLE (100.00 mm)';
        }
        if (clError) clError.innerText = `Қателік: 0.00 mm (Δ → 0.00 mm)`;
        if (window.SoundFX) SoundFX.beep(980, 'sine', 0.18, 0.05);
      }
    }, 450);
  }
};
