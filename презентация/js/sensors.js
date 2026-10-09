/**
 * SENSORS.JS - Industrial Transducers, Capacitive Height Sensor & 4-Part Diagnostic Cards
 */

const sensorsApp = {
  sensorsList: [
    {
      id: 'enc_x',
      name: 'X-Axis Оптикалық Абсолютті Энкодер',
      location: 'X-Сервомотор',
      type: 'BiSS-C / Serial',
      value: '1250.420',
      unit: 'mm',
      status: 'NORMAL',
      sensor: '23-bit Optical Absolute Encoder (8 388 608 cpr)',
      signal: 'BiSS-C Point-to-Point цифрлық синхронды шинасы (5V RS485)',
      controller: 'X-Axis Servo Drive DSP + CNC Controller Cyclic CSP',
      action: '1 мс сайын позицияны өлшеп, қателікті (Following Error) түзейді',
      cam: 'servo'
    },
    {
      id: 'cap_height',
      name: 'Сыйымдылықты биіктік датчигі (BCS100)',
      location: 'Кескіш сопло',
      type: 'AI (0–10V)',
      value: '1.02',
      unit: 'mm',
      status: 'TRACKING',
      sensor: 'Capacitive Nozzle Sensor Ring (C ~ ε·A/d)',
      signal: '0–10V DC Analog Input (AI) немесе жоғары жиілікті RF контур',
      controller: 'Z-Axis BCS100 / EtherCAT Real-Time Auto-Height модулі',
      action: 'Металл майысқанда Z-сервосын лезде көтеріп/түсіріп 1.00 мм ұстайды',
      cam: 'head'
    },
    {
      id: 'limit_x',
      name: 'X+/X- Индуктивті шектеуіштер (Limit Switch)',
      location: 'Портал соңы',
      type: 'DI (24V PNP)',
      value: 'CLOSED',
      unit: 'Logic',
      status: 'SAFE',
      sensor: 'Inductive Proximity Sensor (24V DC PNP Normally Closed)',
      signal: '24V DC Discrete Digital Input (DI 0.4 / DI 0.5)',
      controller: 'PLC Remote I/O + Серводрайвер Hard-Limit кірісі',
      action: 'Шектен асып кету кезінде ості аппараттық жедел тоқтатады (Hard Stop)',
      cam: 'gantry'
    },
    {
      id: 'press_gas',
      name: 'Көмекші газ қысымы датчигі (Pressure Switch)',
      location: 'Газ коллекторы',
      type: 'AI (4–20mA)',
      value: '8.2',
      unit: 'bar',
      status: 'NORMAL',
      sensor: 'Piezoresistive Pressure Transmitter (0–25 bar)',
      signal: '4–20 mA Current Loop (Аналогтық кіріс AI 2)',
      controller: 'PLC Analog Slice Module + SMC Пропорционалды клапаны',
      action: 'Қысым 4 bar-дан төмендесе линза бүлінбеуі үшін лазерді өшіреді',
      cam: 'head'
    },
    {
      id: 'temp_laser',
      name: 'Лазер көзінің температура датчигі (PT100)',
      location: 'Лазер модульдері',
      type: 'AI (4–20mA)',
      value: '22.4',
      unit: '°C',
      status: 'NORMAL',
      sensor: 'PT100 Platinum RTD Temperature Sensor (Class A)',
      signal: '4–20 mA немесе RTD 3-сымды кедергі өлшеу каналы',
      controller: 'Чиллер температуралық микроконтроллері + PLC AI 1',
      action: 'Температура 30°C асқанда 24V Hardware Laser Enable тізбегін ашады',
      cam: 'chiller'
    },
    {
      id: 'flow_chiller',
      name: 'Салқындатқыш су ағыны релесі (Flow Switch)',
      location: 'Чиллер гидравликасы',
      type: 'DI (24V DC)',
      value: '32.5',
      unit: 'L/min',
      status: 'FLOW OK',
      sensor: 'Magnetic Rotor Water Flow Sensor & Reed Switch',
      signal: '24V DC Digital Input (DI Chiller Flow OK)',
      controller: 'Чиллер интерлок тізбегі + PLC DI 0.2',
      action: 'Су ағыны < 15 L/min болса лазер көзін бірден бұғаттайды',
      cam: 'chiller'
    },
    {
      id: 'estop_loop',
      name: 'Авариялық E-Stop қауіпсіздік тізбегі',
      location: 'Қауіпсіздік релесі',
      type: 'Dual NC Hardware',
      value: 'ARMED',
      unit: '24V DC',
      status: 'SAFE',
      sensor: 'Dual-Channel Normally Closed Pushbutton & Interlock Switches',
      signal: 'Қос арналы 24V DC импульстік бақылау тізбегі (Test Pulses)',
      controller: 'Hardware Safety Relay (Pilz PNOZ) + STO Channels',
      action: 'Серво драйверлердің күштік IGBT транзисторларын 15 мс-те өшіреді',
      cam: 'station'
    }
  ],

  selectedSensorId: 'cap_height',

  // Capacitive Height Tracking State
  capState: {
    gapMM: 1.00,
    capacitancePF: 3.45,
    analogVolt: 5.00,
    targetGapMM: 1.00
  },

  init() {
    this.renderTable();
    this.renderFourPartCard(this.selectedSensorId);
    this.startLiveTelemetry();
  },

  selectSensor(sensorId) {
    this.selectedSensorId = sensorId;
    this.renderFourPartCard(sensorId);

    // Highlight row
    document.querySelectorAll('#sensors-table tr').forEach(r => r.classList.remove('selected-sensor-row'));
    const targetRow = document.getElementById(`row-${sensorId}`);
    if (targetRow) targetRow.classList.add('selected-sensor-row');

    const s = this.sensorsList.find(x => x.id === sensorId);
    if (s && s.cam) {
      CameraController.flyTo(s.cam, 1.2);
    }
    if (window.SoundFX) SoundFX.click();
  },

  renderFourPartCard(sensorId) {
    const s = this.sensorsList.find(x => x.id === sensorId) || this.sensorsList[0];
    if (!s) return;

    const elSensor = document.getElementById('card-sensor-name');
    const elSignal = document.getElementById('card-signal-val');
    const elController = document.getElementById('card-controller-val');
    const elAction = document.getElementById('card-action-val');
    const elBadge = document.getElementById('card-sensor-badge');

    if (elSensor) elSensor.innerText = s.sensor || s.name;
    if (elSignal) elSignal.innerText = s.signal || s.type;
    if (elController) elController.innerText = s.controller || "PLC / CNC Контроллер";
    if (elAction) elAction.innerText = s.action || "Автоматты реттеу және қорғау";
    if (elBadge) elBadge.innerText = `${s.name} // [${s.status}]`;
  },

  renderTable() {
    const tbody = document.querySelector('#sensors-table tbody');
    if (!tbody) return;

    tbody.innerHTML = this.sensorsList.map(s => `
      <tr id="row-${s.id}" class="${s.id === this.selectedSensorId ? 'selected-sensor-row' : ''}" onclick="sensorsApp.selectSensor('${s.id}')" style="cursor: pointer;">
        <td><strong class="text-white"><i class="fa-solid fa-crosshairs text-cyan"></i> ${s.name}</strong></td>
        <td><span class="text-muted">${s.location}</span></td>
        <td><span class="signal-tag ${s.type.includes('AI') ? 'ai' : s.type.includes('DI') ? 'dio' : 'bus'}">${s.type}</span></td>
        <td><b id="val-${s.id}">${s.value}</b></td>
        <td>${s.unit}</td>
        <td><span class="status-pill status-ready" id="stat-${s.id}">${s.status}</span></td>
      </tr>
    `).join('');
  },

  startLiveTelemetry() {
    setInterval(() => {
      // Micro-oscillate live values for realistic industrial feel
      const tempSensor = this.sensorsList.find(s => s.id === 'temp_laser');
      if (tempSensor) {
        const val = (22.3 + Math.random() * 0.2).toFixed(1);
        const el = document.getElementById('val-temp_laser');
        if (el) el.innerText = val;
        const hudChiller = document.getElementById('hud-chiller-temp');
        if (hudChiller) hudChiller.innerText = val;
        const chartTemp = document.getElementById('chart-temp-val');
        if (chartTemp) chartTemp.innerText = `${val} °C`;
      }

      const gasSensor = this.sensorsList.find(s => s.id === 'press_gas');
      if (gasSensor) {
        const val = (8.15 + Math.random() * 0.1).toFixed(1);
        const el = document.getElementById('val-press_gas');
        if (el) el.innerText = val;
        const hudGas = document.getElementById('hud-gas-press');
        if (hudGas) hudGas.innerText = val;
        const chartGas = document.getElementById('chart-gas-val');
        if (chartGas) chartGas.innerText = `${val} bar`;
      }
    }, 1200);
  },

  // Interactive Capacitive Height Sensor Demonstration
  triggerSheetDeform(deltaMM) {
    this.capState.gapMM += deltaMM;
    // C is inversely proportional to distance (C ~ εA/d)
    this.capState.capacitancePF = (3.45 / this.capState.gapMM);
    this.capState.analogVolt = (this.capState.gapMM * 5.0);

    // Animate visual sheet deform
    const sheetEl = document.getElementById('sim-sheet');
    if (sheetEl) {
      sheetEl.style.transform = `translateY(${deltaMM * 18}px)`;
    }

    this.updateCapUI();
    if (window.SoundFX) SoundFX.click();
  },

  resetHeightAuto() {
    // Fast closed-loop Z-correction
    const nozzleEl = document.getElementById('sim-nozzle');
    const sheetEl = document.getElementById('sim-sheet');

    if (window.gsap) {
      gsap.to(this.capState, {
        gapMM: 1.00,
        capacitancePF: 3.45,
        analogVolt: 5.00,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => this.updateCapUI()
      });

      if (nozzleEl) {
        gsap.to(nozzleEl, { y: 0, duration: 0.5 });
      }
      if (sheetEl) {
        gsap.to(sheetEl, { y: 0, duration: 0.5 });
      }
    } else {
      this.capState.gapMM = 1.00;
      this.capState.capacitancePF = 3.45;
      this.capState.analogVolt = 5.00;
      this.updateCapUI();
    }

    if (window.SoundFX) SoundFX.beep(600, 'sine', 0.1, 0.05);
  },

  updateCapUI() {
    const gapVal = document.getElementById('sim-gap-value');
    const capVal = document.getElementById('sim-cap-value');
    const voltVal = document.getElementById('sim-volt-value');
    const hudGap = document.getElementById('hud-gap-val');

    if (gapVal) gapVal.innerText = `${this.capState.gapMM.toFixed(2)} mm`;
    if (capVal) capVal.innerText = `${this.capState.capacitancePF.toFixed(2)} pF`;
    if (voltVal) voltVal.innerText = `${this.capState.analogVolt.toFixed(2)} V`;
    if (hudGap) hudGap.innerText = `${this.capState.gapMM.toFixed(2)}`;
  }
};
