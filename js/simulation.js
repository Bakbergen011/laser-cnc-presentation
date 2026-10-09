/**
 * SIMULATION.JS - 13-Step Automated Cutting Cycle Engine & 3D Machine Synchronization
 */

const simulationApp = {
  isCycleRunning: false,
  currentStep: 1,

  steps: [
    {
      idx: 1,
      percent: 0,
      name: "READY",
      title: "СТАНОКТЫ ДАЙЫНДАУ ЖӘНЕ ҚОРЕКТЕНДІРУДІ ТЕКСЕРУ",
      desc: "Барлық 380V және 24V қорек көздері тексерілді. Чиллер компрессоры қосылып, су температурасы қалыпты 22.4°C-қа жетті.",
      autoAction: "PLC жүйелік модульдерін (EtherCAT Master, Remote I/O) инициализациялады.",
      action: (next) => {
        CameraController.flyTo('overview', 1.2, next);
      }
    },
    {
      idx: 2,
      percent: 5,
      name: "SAFETY",
      title: "АППАРАТТЫҚ ҚАУІПСІЗДІК ТІЗБЕГІН ТЕКСЕРУ (SAFETY CHECK)",
      desc: "E-Stop қос NC тізбегі тұйық, есік датчиктері SAFE. Safety Relay релелік блоктары STO арнасын қосты.",
      autoAction: "Safety PLC аппараттық сигналдардың тұтастығын (pulse test) орындады.",
      action: (next) => {
        CameraController.flyTo('cabinet', 1.2, next);
      }
    },
    {
      idx: 3,
      percent: 10,
      name: "HOMING",
      title: "БАРЛЫҚ ОСЬТЕРДІ БАЗАЛЫҚ НҮКТЕГЕ ШЫҒАРУ (HOMING)",
      desc: "X, Y1, Y2, Z осьтері индуктивті референтті датчиктерге тиіп, абсолюттік нөлдік координатаға бекітілді.",
      autoAction: "23-биттік энкодерлердің Z-фазалық меткасы мен абсолютті санағы синхрондалды.",
      action: (next) => {
        AxesController.moveTo(0, 0, 80, 1.4, next);
      }
    },
    {
      idx: 4,
      percent: 15,
      name: "LOAD G-CODE",
      title: "G-КОД ТРАЕКТОРИЯСЫН КОНТРОЛЛЕР ЖАДЫНА ЖҮКТЕУ",
      desc: "CNC жүйесі металл қаңылтыр өлшемі мен кесу сызбасын (ISO G-code) қабылдап, жылдамдық профилін есептеді.",
      autoAction: "Look-Ahead алгоритмі траекторияның бұрыштарындағы үдеу мен тежелуді алдын-ала есептеді.",
      action: (next) => {
        setTimeout(next, 800);
      }
    },
    {
      idx: 5,
      percent: 20,
      name: "POSITIONING",
      title: "БІРІНШІ ТЕСУ НҮКТЕСІНЕ ЖЫЛДАМ ОРЫН АУЫСТЫРУ (G00)",
      desc: "Портал мен каретка 120 м/мин жылдамдықпен бірінші бастапқы кесу координатасына келді.",
      autoAction: "Серводрайверлер ток және жылдамдық контурлары бойынша максималды динамикада жұмыс істеді.",
      action: (next) => {
        CameraController.flyTo('gantry', 1.0);
        AxesController.moveTo(600, 400, 30, 1.2, next);
      }
    },
    {
      idx: 6,
      percent: 35,
      name: "HEIGHT CONTROL",
      title: "СЫЙЫМДЫЛЫҚТЫ ДАТЧИКПЕН БИІКТІКТІ РЕТТЕУ (HEIGHT CONTROL)",
      desc: "Сопло металл бетіне 1.0 мм қашықтыққа дейін төмендеді. Сыйымдылық сигналдық мәні 3.45 pF-ке тұрақталды.",
      autoAction: "Z-осінің жоғары жылдамдықты PID биіктік реттегіші (BCS100) белсендірілді.",
      action: (next) => {
        CameraController.flyTo('head', 1.0);
        AxesController.moveTo(600, 400, 1.0, 0.8, next);
      }
    },
    {
      idx: 7,
      percent: 45,
      name: "GAS ON",
      title: "КӨМЕКШІ ГАЗДЫ ҚОСУ ЖӘНЕ ҚЫСЫМДЫ РЕТТЕУ (GAS ON - M08)",
      desc: "Пропорционалды SMC клапаны Азот (N2) қысымын 8.5 bar деңгейіне дейін көтеріп, кесу аймағын үрледі.",
      autoAction: "Газ қысымы датчигінен 4-20мА сигнал алынып, қысым қалыпты екендігі расталды.",
      action: (next) => {
        GasController.setGasType('N2');
        GasController.setPressure(8.5);
        setTimeout(next, 600);
      }
    },
    {
      idx: 8,
      percent: 55,
      name: "PIERCING",
      title: "МЕТАЛДЫ ЛАЗЕРМЕН ТЕСУ (PIERCING PROCESS)",
      desc: "Лазер сәулесі импульстік режимде 6 кВт қуатпен қаңылтыр металды 0.3 секундта тесіп өтті.",
      autoAction: "Лазер көзіне PLC-ден 0-10V қуат тапсырмасы мен 24V Hardware Shutter Enable берілді.",
      action: (next) => {
        LaserController.turnOn(6.0);
        setTimeout(next, 800);
      }
    },
    {
      idx: 9,
      percent: 65,
      name: "LASER CUTTING",
      title: "КОНТУРДЫ КЕСУ (INTERPOLATION G01 / G02)",
      desc: "X және Y сервожетегі бір мезгілде қисықсызықты интерполяция жасап, металды үздіксіз кесіп шықты.",
      autoAction: "EtherCAT желісі бойынша 1 мс сайын X, Y1, Y2 позиция командалары жіберілді.",
      action: (next) => {
        AxesController.moveTo(900, 600, 1.0, 1.8, () => {
          AxesController.moveTo(700, 800, 1.0, 1.5, next);
        });
      }
    },
    {
      idx: 10,
      percent: 80,
      name: "FEEDBACK",
      title: "БИІКТІКТІ ЖӘНЕ ҚАТЕЛІКТІ АВТО-ТҮЗЕУ (REAL-TIME FEEDBACK)",
      desc: "Металл бетінің термиялық деформациясына қарамастан, Z-осі 1.00 мм арақашықтықты мінсіз ұстап тұрды.",
      autoAction: "Энкодер мен сыйымдылықты датчик нақты уақытта жабық контурлы кері байланыс жасады.",
      action: (next) => {
        setTimeout(next, 700);
      }
    },
    {
      idx: 11,
      percent: 85,
      name: "LASER OFF",
      title: "ЛАЗЕР СӘУЛЕСІН СӨНДІРУ (M05)",
      desc: "Кесу контуры аяқталған бойда лазер генераторы миллисекунд ішінде сәулені өшірді.",
      autoAction: "Fast Optocoupled Gate сигналы лазер сәулеленуін лезде тоқтатты.",
      action: (next) => {
        LaserController.turnOff();
        setTimeout(next, 500);
      }
    },
    {
      idx: 12,
      percent: 90,
      name: "FINISH / GAS OFF",
      title: "ГАЗ КЛАПАНЫН ЖАБУ ЖӘНЕ ҮРЛЕУДІ ТОҚТАТУ (M09)",
      desc: "Электромагниттік пневмоклапан жабылып, газ шығыны үнемделді.",
      autoAction: "DO модуль шығысы 0V-қа ауыстырылды.",
      action: (next) => {
        GasController.setPressure(0);
        setTimeout(next, 500);
      }
    },
    {
      idx: 13,
      percent: 100,
      name: "COMPLETE",
      title: "КЕСКІШ БАСТЫ ҚАУІПСІЗ БИІКТІККЕ КӨТЕРУ ЖӘНЕ ПАРКИНГ",
      desc: "Z-осі 80 мм қауіпсіз биіктікке көтеріліп, келесі дайындаманы тиеуге дайын күйге келді.",
      autoAction: "Цикл сәтті аяқталды (100% COMPLETE). SCADA жүйесінде дайын бөлшек саны 1-ге артты.",
      action: (next) => {
        AxesController.moveTo(AxesController.position.x, AxesController.position.y, 80, 0.8, () => {
          CameraController.flyTo('overview', 1.2, next);
        });
      }
    }
  ],

  runAutoCycle() {
    if (this.isCycleRunning) return;
    this.isCycleRunning = true;
    this.currentStep = 1;

    const btn = document.getElementById('run-cycle-btn');
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ЦИКЛ ОРЫНДАЛУДА...';
      btn.classList.add('active');
    }

    this.executeStep(this.currentStep);
  },

  executeStep(stepNum) {
    if (!this.isCycleRunning || stepNum > this.steps.length) {
      this.finishCycle();
      return;
    }

    const stepData = this.steps[stepNum - 1];
    this.updateHUD(stepData);

    if (window.SoundFX) SoundFX.click();

    stepData.action(() => {
      this.currentStep++;
      if (this.currentStep <= this.steps.length) {
        this.executeStep(this.currentStep);
      } else {
        this.finishCycle();
      }
    });
  },

  updateHUD(stepData) {
    // Update Stepper badges
    const badges = document.querySelectorAll('.step-badge-item');
    badges.forEach((b, idx) => {
      const stepIdx = idx + 1;
      b.classList.remove('active', 'done');
      if (stepIdx === stepData.idx) {
        b.classList.add('active');
      } else if (stepIdx < stepData.idx) {
        b.classList.add('done');
      }
    });

    // Update Progress Bar
    const progressFill = document.getElementById('cycle-progress-fill');
    const progressText = document.getElementById('cycle-progress-percent');
    if (progressFill) progressFill.style.width = `${stepData.percent}%`;
    if (progressText) progressText.innerText = `${stepData.percent}%`;

    // Update Step Text Card
    const numEl = document.getElementById('exec-step-num');
    const titleEl = document.getElementById('exec-step-title');
    const descEl = document.getElementById('exec-step-desc');
    const autoActionEl = document.getElementById('exec-step-auto') || document.getElementById('exec-step-kipia');

    if (numEl) numEl.innerText = `STEP ${String(stepData.idx).padStart(2, '0')} / 13 (${stepData.percent}%)`;
    if (titleEl) titleEl.innerText = stepData.title;
    if (descEl) descEl.innerText = stepData.desc;
    if (autoActionEl) autoActionEl.innerText = stepData.autoAction || stepData.kipia || '';
  },

  finishCycle() {
    this.isCycleRunning = false;
    const btn = document.getElementById('run-cycle-btn');
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-play"></i> ТОЛЫҚ ЦИКЛДІ БАСТАУ';
      btn.classList.remove('active');
    }

    const progressFill = document.getElementById('cycle-progress-fill');
    const progressText = document.getElementById('cycle-progress-percent');
    if (progressFill) progressFill.style.width = '100%';
    if (progressText) progressText.innerText = '100%';

    if (window.SoundFX) SoundFX.beep(1200, 'sine', 0.2, 0.08);
  }
};
