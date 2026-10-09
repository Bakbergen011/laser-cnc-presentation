/**
 * SCADA.JS - Real-Time SCADA/HMI Dashboard & Chart.js Telemetry Graphs
 */

const scadaApp = {
  charts: {},
  maxDataPoints: 20,

  init() {
    this.initCharts();
    this.startStreaming();
  },

  initCharts() {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } }
        }
      },
      elements: {
        point: { radius: 0 },
        line: { tension: 0.35, borderWidth: 2 }
      }
    };

    // 1. Speed Chart (Cyan)
    const ctxSpeed = document.getElementById('chart-speed');
    if (ctxSpeed) {
      this.charts.speed = new Chart(ctxSpeed, {
        type: 'line',
        data: {
          labels: Array(this.maxDataPoints).fill(''),
          datasets: [{
            data: Array(this.maxDataPoints).fill(45),
            borderColor: '#00f0ff',
            backgroundColor: 'rgba(0, 240, 255, 0.1)',
            fill: true
          }]
        },
        options: commonOptions
      });
    }

    // 2. Power Chart (Yellow)
    const ctxPower = document.getElementById('chart-power');
    if (ctxPower) {
      this.charts.power = new Chart(ctxPower, {
        type: 'line',
        data: {
          labels: Array(this.maxDataPoints).fill(''),
          datasets: [{
            data: Array(this.maxDataPoints).fill(6.0),
            borderColor: '#ffcc00',
            backgroundColor: 'rgba(255, 204, 0, 0.1)',
            fill: true
          }]
        },
        options: commonOptions
      });
    }

    // 3. Temp Chart (Blue)
    const ctxTemp = document.getElementById('chart-temp');
    if (ctxTemp) {
      this.charts.temp = new Chart(ctxTemp, {
        type: 'line',
        data: {
          labels: Array(this.maxDataPoints).fill(''),
          datasets: [{
            data: Array(this.maxDataPoints).fill(22.4),
            borderColor: '#0099ff',
            backgroundColor: 'rgba(0, 153, 255, 0.1)',
            fill: true
          }]
        },
        options: commonOptions
      });
    }

    // 4. Gas Chart (Green)
    const ctxGas = document.getElementById('chart-gas');
    if (ctxGas) {
      this.charts.gas = new Chart(ctxGas, {
        type: 'line',
        data: {
          labels: Array(this.maxDataPoints).fill(''),
          datasets: [{
            data: Array(this.maxDataPoints).fill(8.2),
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            fill: true
          }]
        },
        options: commonOptions
      });
    }
  },

  startStreaming() {
    setInterval(() => {
      // Speed stream
      if (this.charts.speed) {
        const speedVal = cncApp.isRunning ? (60 + (Math.random() - 0.5) * 8) : (Math.random() * 2);
        this.pushData(this.charts.speed, speedVal);
        const el = document.getElementById('chart-speed-val');
        if (el) el.innerText = `${speedVal.toFixed(1)} m/min`;
      }

      // Power stream
      if (this.charts.power) {
        const pwrVal = LaserController.isLaserActive ? LaserController.powerKW : 0;
        this.pushData(this.charts.power, pwrVal);
      }

      // Temp stream
      if (this.charts.temp) {
        const tempVal = ChillerController.laserTempC + (Math.random() - 0.5) * 0.15;
        this.pushData(this.charts.temp, tempVal);
      }

      // Gas stream
      if (this.charts.gas) {
        const gasVal = GasController.pressureBar + (Math.random() - 0.5) * 0.1;
        this.pushData(this.charts.gas, gasVal);
      }
    }, 1000);
  },

  pushData(chart, value) {
    const data = chart.data.datasets[0].data;
    data.push(value);
    if (data.length > this.maxDataPoints) {
      data.shift();
    }
    chart.update('none');
  }
};
