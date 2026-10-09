/**
 * FAULTS.JS - Industrial Fault Simulator & Automation Diagnostic Expert System
 */

const faultsApp = {
  faults: {
    encoder_loss: {
      code: 'ALARM 104: X-AXIS ENCODER FEEDBACK LOSS',
      symptom: 'X-осінің позиция қателігі (Following Error) шектен асты, кері байланыс үзілді.',
      action: 'Контроллер X-серводрайверін STO режиміне түсірді. Кесу жедел тоқтатылды.',
      fix: 'Энкодердің RJ45/M12 кабель қосқышын, BiSS-C экрандалуын және 5V қорегін тексеру.',
      focusCam: 'servo',
      affectedComp: 'servo_x'
    },
    servo_overload: {
      code: 'ALARM 201: Y1 SERVO DRIVE OVERCURRENT',
      symptom: 'Y1 жетегінің тогы номиналдан (8.5A) асып, IGBT драйвері қызып кетті.',
      action: 'Y-осінің қозғалысы бұғатталды, Gantry синхронизациясы үзілмеуі үшін Y2 де тоқтатылды.',
      fix: 'Механикалық бағыттауыштарды, редуктордың кептелуін (backlash) және майлануын тексеру.',
      focusCam: 'servo',
      affectedComp: 'servo_y1'
    },
    chiller_temp_high: {
      code: 'ALARM 302: CHILLER WATER OVERTEMPERATURE (>32°C)',
      symptom: 'Лазер генераторына берілетін салқындатқыш су температурасы қауіпті шектен асты (34.5°C).',
      action: 'Hardware Interlock лазер сәулесінің шығысын (Laser Enable 24V) лезде өшірді.',
      fix: 'Чиллер фреон қысымын, радиатор сүзгісінің ластануын және су деңгейін тексеру.',
      focusCam: 'chiller',
      affectedComp: 'chiller'
    },
    gas_pressure_low: {
      code: 'ALARM 405: ASSIST GAS PRESSURE LOW (< 4 BAR)',
      symptom: 'Көмекші газ коллекторындағы қысым релесі (Pressure Switch) ашылып кетті (1.8 bar).',
      action: 'Лазер өшіріліп, металдың күйіп кетуі мен линзаның былғануына жол берілмеді.',
      fix: 'Газ балонындағы (N2/O2) қалдықты және пропорционалды SMC клапанын тексеру.',
      focusCam: 'head',
      affectedComp: 'gas_manifold'
    },
    door_open: {
      code: 'ALARM 015: SAFETY ENCLOSURE DOOR OPEN',
      symptom: 'Қорғаныс кабинасының немесе электр шкафының есік интерлогы (Door Interlock) ашылды.',
      action: 'Қауіпсіздік релесі STO тізбегін ажыратып, лазер сәулесін блоктады.',
      fix: 'Шкаф немесе кабина есігін мықтап жауып, Safety Reset батырмасын басу.',
      focusCam: 'cabinet',
      affectedComp: 'cnc_cabinet'
    },
    capacitive_error: {
      code: 'ALARM 501: CAPACITIVE NOZZLE COLLISION',
      symptom: 'Кескіш сопло металл қаңылтырға соғылды (Сыйымдылық шекті максимумға жетті).',
      action: 'Z-осі жедел түрде 50 мм жоғары көтеріліп, авариялық тежеу басылды.',
      fix: 'Керамикалық сақинаның (ceramic ring) тұтастығын және 0-10V калибрлеуін тексеру.',
      focusCam: 'head',
      affectedComp: 'laser_head'
    },
    estop_tripped: {
      code: 'ALARM 001: EMERGENCY STOP TRIPPED',
      symptom: 'Оператор немесе қауіпсіздік релесі авариялық тоқтату батырмасын басты.',
      action: 'Күштік 380V тізбек пен STO арнасы бірден ажыратылып, барлық жүйелер тоқтатылды.',
      fix: 'E-Stop батырмасын бұрап босату және Safety Relay-ді қайта бастау (Reset).',
      focusCam: 'station',
      affectedComp: 'estop_button'
    }
  },

  triggerFault(faultKey) {
    const f = this.faults[faultKey];
    if (!f) return;

    // Update Diagnostics Card
    const symptomEl = document.getElementById('diag-symptom');
    const codeEl = document.getElementById('diag-code');
    const actionEl = document.getElementById('diag-action');
    const fixEl = document.getElementById('diag-fix');

    if (symptomEl) symptomEl.innerText = f.symptom;
    if (codeEl) codeEl.innerText = f.code;
    if (actionEl) actionEl.innerText = f.action;
    if (fixEl) fixEl.innerText = f.fix;

    // Add Alarm to SCADA Log
    this.addAlarmLog(f.code);

    // Stop laser & cutting
    LaserController.turnOff();
    cncApp.stopCuttingProgram();

    // Machine State Alarm
    const stateBadge = document.getElementById('machine-state-badge');
    if (stateBadge) {
      stateBadge.className = 'status-pill status-alarm';
      stateBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${f.code.split(':')[0]}`;
    }

    // Camera Focus
    if (f.focusCam) {
      CameraController.flyTo(f.focusCam, 1.2);
    }

    if (window.SoundFX) SoundFX.alarm();
  },

  addAlarmLog(msg) {
    const logList = document.getElementById('alarm-log-list');
    if (!logList) return;

    const timeStr = new Date().toLocaleTimeString();
    const li = document.createElement('li');
    li.className = 'log-item alarm';
    li.innerHTML = `<span class="time">${timeStr}</span> [FAULT] ${msg}`;
    logList.insertBefore(li, logList.firstChild);
  },

  resetAllFaults() {
    const symptomEl = document.getElementById('diag-symptom');
    const codeEl = document.getElementById('diag-code');
    const actionEl = document.getElementById('diag-action');
    const fixEl = document.getElementById('diag-fix');

    if (symptomEl) symptomEl.innerText = 'Жүйе қалыпты жұмыс істеп тұр';
    if (codeEl) codeEl.innerText = 'ALARM 000: SYSTEM READY';
    if (actionEl) actionEl.innerText = 'Автоматты блоктау қажет етілмейді';
    if (fixEl) fixEl.innerText = 'Кабель экраны, жерге қосу (PE), 24V тұрақтылықты бақылау.';

    const stateBadge = document.getElementById('machine-state-badge');
    if (stateBadge) {
      stateBadge.className = 'status-pill status-ready';
      stateBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> READY (ДАЙЫН)';
    }

    const logList = document.getElementById('alarm-log-list');
    if (logList) {
      const timeStr = new Date().toLocaleTimeString();
      const li = document.createElement('li');
      li.className = 'log-item ok';
      li.innerHTML = `<span class="time">${timeStr}</span> [INFO] Барлық ақаулар қалпына келтірілді (Reset OK).`;
      logList.insertBefore(li, logList.firstChild);
    }

    CameraController.flyTo('overview', 1.2);
    if (window.SoundFX) SoundFX.beep(880, 'sine', 0.1, 0.05);
  }
};
