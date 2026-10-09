/**
 * MACHINE.JS - SENFENG NP 3015 Procedural & GLTF 3D Digital Twin Model
 * Faithfully represents the SENFENG NP Series Open-Bed Fiber Laser Sheet Cutter
 */

const MachineBuilder = {
  rootGroup: null,
  layers: {}, // Group components into 8 structural layers for explosion view
  interactiveParts: [], // Clickable parts for component info drawer
  
  // Moving sub-assemblies for real-time kinematics
  gantryGroup: null, // Moves along Y axis
  carriageGroup: null, // Moves along X axis (on gantry)
  zSlideGroup: null, // Moves along Z axis (on carriage)
  cuttingHeadGroup: null,
  laserBeamMesh: null,
  sparksEmitter: null,

  // Electrical Cabinet & HMI Station
  cabinetGroup: null,
  cabinetDoorGroup: null,
  isCabinetOpen: false,
  operatorStationGroup: null,
  hmiScreenMesh: null,

  // Materials palette
  materials: {},

  initMaterials() {
    // Dark graphite metallic industrial paint
    this.materials.machineDark = new THREE.MeshStandardMaterial({
      color: 0x141820,
      metalness: 0.8,
      roughness: 0.35,
      name: "MachineDarkMetal"
    });

    // Senfeng trademark accent orange / red
    this.materials.accentOrange = new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x331500,
      name: "SenfengOrange"
    });

    // Industrial Safety Yellow (Relays & safety enclosures)
    this.materials.safetyYellow = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.2,
      roughness: 0.4,
      name: "SafetyYellow"
    });

    // Industrial Safety Red (E-Stop mushroom & breakers)
    this.materials.safetyRed = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.3,
      roughness: 0.3,
      name: "SafetyRed"
    });

    // Industrial PLC / Automation Module Housing (Siemens/Beckhoff gray)
    this.materials.plcHousing = new THREE.MeshStandardMaterial({
      color: 0x253248,
      metalness: 0.5,
      roughness: 0.4,
      name: "PLCHousing"
    });

    // Industrial Cabinet Galvanized Steel Backplate
    this.materials.cabinetBackplate = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.25,
      name: "CabinetBackplate"
    });

    // Aviation extruded aluminum gantry beam (silver/metallic)
    this.materials.aviationAlu = new THREE.MeshStandardMaterial({
      color: 0xc8d1dc,
      metalness: 0.9,
      roughness: 0.25,
      name: "AviationAluminum"
    });

    // Linear guide rails & rack (precision polished steel)
    this.materials.polishedSteel = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15,
      name: "PolishedSteel"
    });

    // Cutting table serrated steel slats
    this.materials.slatSteel = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.5,
      name: "SlatSteel"
    });

    // Brass/Copper capacitive nozzle
    this.materials.copperNozzle = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.85,
      roughness: 0.2,
      name: "CopperNozzle"
    });

    // Sheet metal workpiece (raw stainless steel)
    this.materials.sheetMetal = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.85,
      roughness: 0.3,
      name: "SheetWorkpiece"
    });

    // Blue tinted glass / acrylic & cabinet display
    this.materials.displayScreen = new THREE.MeshStandardMaterial({
      color: 0x051525,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4,
      metalness: 0.5,
      roughness: 0.1
    });

    // Glowing laser beam material
    this.materials.laserCore = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9
    });
    this.materials.laserGlow = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide
    });
  },

  build(scene, onProgress = null) {
    this.initMaterials();
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "SENFENG_3015NP_ROOT";

    // Initialize 8 architectural layers
    for (let i = 1; i <= 8; i++) {
      const layerGrp = new THREE.Group();
      layerGrp.name = `Layer_${i}`;
      this.layers[i] = layerGrp;
      this.rootGroup.add(layerGrp);
    }

    // Try loading GLB model first if available
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(
      'models/senfeng_np_3015.glb',
      (gltf) => {
        console.log("GLB Model loaded successfully!");
        this.rootGroup.add(gltf.scene);
        this.setupInteractiveMesh(gltf.scene);
        if (onProgress) onProgress(100);
      },
      (xhr) => {
        if (onProgress && xhr.total > 0) {
          onProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (error) => {
        console.info("GLB not found, generating High-Precision Procedural SENFENG NP 3015 Model.");
        this.buildProceduralModel();
        if (onProgress) onProgress(100);
      }
    );

    scene.add(this.rootGroup);
    return this.rootGroup;
  },

  buildProceduralModel() {
    // 1. LAYER 1: MECHANICAL BED & FRAME (Open-Bed Architecture 3050x1530mm)
    this.buildBedFrame();

    // 2. LAYER 2: SERVO MOTION SYSTEM & GANTRY (X & Y Dual-Drive)
    this.buildGantryAndMotion();

    // 3. LAYER 3: FIBER LASER SOURCE & OPTICAL CUTTING HEAD
    this.buildLaserAndOptics();

    // 4. LAYER 4: PNEUMATICS & GAS MANIFOLD (O2, N2, Air)
    this.buildPneumaticsAndGas();

    // 5. LAYER 5: DUAL-CIRCUIT WATER CHILLER
    this.buildChillerCabinet();

    // 6. LAYER 6: SENSORS & TRANSDUCERS (Capacitive, Limit, Encoders)
    this.buildSensorsAndSwitches();

    // 7. LAYER 7: PLC & CNC ELECTRICAL CONTROL CABINET
    this.buildElectricalCabinet();

    // 8. LAYER 8: HARDWARE SAFETY (E-Stop, STO, Light Barriers)
    this.buildSafetyDevices();

    // Sheet metal raw plate on table
    this.buildWorkpiece();
  },

  // ==================== LAYER 1: MACHINE BED ====================
  buildBedFrame() {
    const layer = this.layers[1];

    // Main heavy welded tubular machine base (Length 3.6m, Width 1.9m, Height 0.65m)
    const baseGeo = new THREE.BoxGeometry(2.0, 0.45, 3.8);
    const baseMesh = new THREE.Mesh(baseGeo, this.materials.machineDark);
    baseMesh.position.set(0, 0.35, 0);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    this.tagComponent(baseMesh, "frame", "Станоктың негізгі станинасы (Heavy-Duty Welded Bed)", 
      "Жоғары температуралық күйдіруден (annealing) өткен тұтас дәнекерленген болат станина. Үдеу кезіндегі (1.2G) дірілді өшіреді.",
      "Mechanical Base", "Passive Frame", "Rigidity > 1100 kg", "DI/DO талап етпейді");
    layer.add(baseMesh);

    // Bed side skirts with Senfeng Orange styling stripes
    const stripeGeo = new THREE.BoxGeometry(2.04, 0.08, 3.82);
    const stripeMesh = new THREE.Mesh(stripeGeo, this.materials.accentOrange);
    stripeMesh.position.set(0, 0.48, 0);
    layer.add(stripeMesh);

    // Bed support legs (6 heavy-duty leveling feet)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.2, 16);
    const legPositions = [
      [-0.9, 0.1, -1.6], [0.9, 0.1, -1.6],
      [-0.9, 0.1, 0.0],  [0.9, 0.1, 0.0],
      [-0.9, 0.1, 1.6],  [0.9, 0.1, 1.6]
    ];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, this.materials.polishedSteel);
      leg.position.set(...pos);
      leg.castShadow = true;
      layer.add(leg);
    });

    // Cutting table serrated blade slats (28 blades along Z)
    const tableGroup = new THREE.Group();
    const slatGeo = new THREE.BoxGeometry(1.53, 0.08, 0.005);
    for (let i = -1.4; i <= 1.4; i += 0.1) {
      const slat = new THREE.Mesh(slatGeo, this.materials.slatSteel);
      slat.position.set(0, 0.62, i);
      slat.castShadow = true;
      tableGroup.add(slat);
    }

    // Ball transfer units along front/rear edges for smooth sheet loading
    const ballGeo = new THREE.SphereGeometry(0.02, 12, 12);
    for (let x = -0.7; x <= 0.7; x += 0.25) {
      const ball1 = new THREE.Mesh(ballGeo, this.materials.polishedSteel);
      ball1.position.set(x, 0.65, 1.55);
      tableGroup.add(ball1);
      const ball2 = new THREE.Mesh(ballGeo, this.materials.polishedSteel);
      ball2.position.set(x, 0.65, -1.55);
      tableGroup.add(ball2);
    }

    this.tagComponent(tableGroup, "work_table", "Кесу үстелі және шарлы бағыттауыштар (Serrated Slats & Ball Units)",
      "Қаңылтыр металды жылдам және сызатсыз тиеуге арналған инелі тісті болат тіліктер мен шарлы подшипниктер кешені.",
      "Work Table", "Load Support", "Max 1100 kg Sheet", "Қолдау модулі");
    layer.add(tableGroup);

    // Left and Right Y-axis Precision Linear Guide Rails & Helical Racks
    const railGeo = new THREE.BoxGeometry(0.06, 0.06, 3.6);
    const railLeft = new THREE.Mesh(railGeo, this.materials.polishedSteel);
    railLeft.position.set(-0.85, 0.62, 0);
    layer.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, this.materials.polishedSteel);
    railRight.position.set(0.85, 0.62, 0);
    layer.add(railRight);
  },

  // ==================== LAYER 2: GANTRY & MOTION ====================
  buildGantryAndMotion() {
    const layer = this.layers[2];

    // Gantry assembly group (moves along Z in Three.js coordinates, corresponding to Machine Y-axis)
    this.gantryGroup = new THREE.Group();
    this.gantryGroup.name = "GANTRY_Y_ASSEMBLY";
    this.gantryGroup.position.set(0, 0, 0);

    // 5th Generation Aviation Extruded Aluminum Gantry Beam (Senfeng trademark light & rigid)
    const beamGeo = new THREE.BoxGeometry(1.95, 0.22, 0.16);
    const beamMesh = new THREE.Mesh(beamGeo, this.materials.aviationAlu);
    beamMesh.position.set(0, 0.88, 0);
    beamMesh.castShadow = true;
    this.tagComponent(beamMesh, "gantry_beam", "5-буын авиациялық алюминий портал балкасы (Extruded Aluminum Gantry)",
      "Аса жоғары динамикалық жылдамдық (120 м/мин, 1.2G) пен деформациясыз тұрақтылықты қамтамасыз ететін жеңіл әрі қатты қорытпа.",
      "Mechanical Beam", "Crossbeam Y-Axis", "Rigidity 450 MPa", "Салмағы 60% жеңілдетілген");
    this.gantryGroup.add(beamMesh);

    // Dual Y-Drive Endplates & Planetary Reducers (Y1 Left & Y2 Right)
    const sidePlateGeo = new THREE.BoxGeometry(0.12, 0.42, 0.36);
    const leftPlate = new THREE.Mesh(sidePlateGeo, this.materials.machineDark);
    leftPlate.position.set(-0.88, 0.74, 0);
    this.gantryGroup.add(leftPlate);

    const rightPlate = new THREE.Mesh(sidePlateGeo, this.materials.machineDark);
    rightPlate.position.set(0.88, 0.74, 0);
    this.gantryGroup.add(rightPlate);

    // Y1 and Y2 AC Servo Motors with Integrated 23-bit Optical Absolute Encoders
    const servoGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.22, 16);
    const servoY1 = new THREE.Mesh(servoGeo, this.materials.machineDark);
    servoY1.rotation.x = Math.PI / 2;
    servoY1.position.set(-0.88, 0.65, 0.16);
    this.tagComponent(servoY1, "servo_y1", "Y1 Сервомотор және 23-бит Энкодер (Y-Axis Dual Drive Master)",
      "Синхронды сервоқозғалтқыш. Порталдың сол жағын жоғары дәлдікпен қозғайды. EtherCAT шинасы арқылы Y2 сервосымен 1мс циклде синхрондалған.",
      "EtherCAT / 380V PWM", "Actuator + Feedback", "3000 RPM / 23-bit", "Gantry Sync Error < 0.01 mm");
    this.gantryGroup.add(servoY1);

    const servoY2 = new THREE.Mesh(servoGeo, this.materials.machineDark);
    servoY2.rotation.x = Math.PI / 2;
    servoY2.position.set(0.88, 0.65, 0.16);
    this.tagComponent(servoY2, "servo_y2", "Y2 Сервомотор және 23-бит Энкодер (Y-Axis Dual Drive Slave)",
      "Порталдың оң жағын қозғайтын синхрондалған сервожетегі. Gantry skewing (қисаю) қателігін болдырмайды.",
      "EtherCAT / 380V PWM", "Actuator + Feedback", "3000 RPM / 23-bit", "Dual-Drive Sync");
    this.gantryGroup.add(servoY2);

    // X-Carriage moving along the beam (X axis)
    this.carriageGroup = new THREE.Group();
    this.carriageGroup.name = "CARRIAGE_X_ASSEMBLY";
    this.carriageGroup.position.set(0, 0.88, 0.1);

    const carriagePlateGeo = new THREE.BoxGeometry(0.24, 0.28, 0.12);
    const carriagePlate = new THREE.Mesh(carriagePlateGeo, this.materials.machineDark);
    this.carriageGroup.add(carriagePlate);

    // X-Axis Servo Motor
    const servoX = new THREE.Mesh(servoGeo, this.materials.machineDark);
    servoX.position.set(0.12, 0.12, 0);
    this.tagComponent(servoX, "servo_x", "X-осінің Сервомоторы мен Энкодері (X-Axis Servo Drive)",
      "Кескіш каретканы портал бойымен 120 м/мин жылдамдықпен жылжытады. Жоғары дәлдікті редуктор мен шестерня-рейка жұбы.",
      "EtherCAT Motion", "Actuator", "1.5 kW / 3000 RPM", "Positioning ±0.05 mm");
    this.carriageGroup.add(servoX);

    // Z-Axis Vertical Slide Slide Group
    this.zSlideGroup = new THREE.Group();
    this.zSlideGroup.name = "Z_SLIDE_ASSEMBLY";
    this.zSlideGroup.position.set(0, 0, 0.08);

    const zPlateGeo = new THREE.BoxGeometry(0.16, 0.32, 0.06);
    const zPlate = new THREE.Mesh(zPlateGeo, this.materials.polishedSteel);
    this.zSlideGroup.add(zPlate);

    // Z-Axis Servo with Brake
    const zServoGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.15, 16);
    const servoZ = new THREE.Mesh(zServoGeo, this.materials.machineDark);
    servoZ.position.set(0, 0.18, 0);
    this.tagComponent(servoZ, "servo_z", "Z-осінің Сервомоторы және Тежеуіш (Z-Axis Servo + Brake)",
      "Кескіш бастиектің тік биіктігін өте жылдам реттейді. Электр өшкенде бастиекті құлатпайтын аппараттық электромагниттік тежеуішпен (brake) жабдықталған.",
      "24V Brake + EtherCAT", "Actuator", "0.75 kW / 3000 RPM", "Auto Height Gap Response < 5 ms");
    this.zSlideGroup.add(servoZ);

    this.carriageGroup.add(this.zSlideGroup);
    this.gantryGroup.add(this.carriageGroup);
    layer.add(this.gantryGroup);
  },

  // ==================== LAYER 3: LASER & OPTICS ====================
  buildLaserAndOptics() {
    const layer = this.layers[3];

    // Fiber Laser Source Cabinet (Raycus / IPG Industrial Fiber Resonator 3–12 kW)
    const laserCabGeo = new THREE.BoxGeometry(0.65, 1.1, 0.7);
    const laserCab = new THREE.Mesh(laserCabGeo, this.materials.machineDark);
    laserCab.position.set(1.6, 0.55, -0.6);
    laserCab.castShadow = true;

    // Laser front panel badge
    const badgeGeo = new THREE.BoxGeometry(0.5, 0.12, 0.02);
    const badge = new THREE.Mesh(badgeGeo, this.materials.accentOrange);
    badge.position.set(0, 0.35, 0.36);
    laserCab.add(badge);

    this.tagComponent(laserCab, "laser_source", "Талшықты лазер көзі (Fiber Laser Source 3–12 kW)",
      "Иттербийлі талшықты лазер генераторы (λ = 1070 нм). Электр-оптикалық ПӘК > 40%. Лазер бастиегіне QBH брондалған оптикалық талшық арқылы қосылған.",
      "380V Power + 24V Laser Enable", "Source", "λ = 1.07 µm, 6 kW", "QBH Interface + Interlock");
    layer.add(laserCab);

    // QBH Armored Optical Fiber Cable routing to head (procedural curve)
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.6, 1.0, -0.6),
      new THREE.Vector3(1.2, 1.5, 0.0),
      new THREE.Vector3(0.5, 1.4, 0.2),
      new THREE.Vector3(0.0, 1.0, 0.2)
    ]);
    const fiberGeo = new THREE.TubeGeometry(curve, 32, 0.015, 8, false);
    const fiberMesh = new THREE.Mesh(fiberGeo, this.materials.accentOrange);
    layer.add(fiberMesh);

    // Autofocus Fiber Laser Cutting Head (Raytools/Precitec Industrial Type)
    this.cuttingHeadGroup = new THREE.Group();
    this.cuttingHeadGroup.name = "CUTTING_HEAD_GROUP";
    this.cuttingHeadGroup.position.set(0, -0.05, 0.06);

    // Head main aluminum body
    const headBodyGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.32, 16);
    const headBody = new THREE.Mesh(headBodyGeo, this.materials.aviationAlu);
    this.cuttingHeadGroup.add(headBody);

    // Collimation & Focus Optics Housing
    const opticsRingGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.08, 16);
    const opticsRing = new THREE.Mesh(opticsRingGeo, this.materials.accentOrange);
    opticsRing.position.set(0, 0.05, 0);
    this.cuttingHeadGroup.add(opticsRing);

    // Pure Copper Cutting Nozzle with Capacitive Sensor Ring
    const nozzleGeo = new THREE.ConeGeometry(0.035, 0.06, 16);
    const nozzle = new THREE.Mesh(nozzleGeo, this.materials.copperNozzle);
    nozzle.position.set(0, -0.18, 0);
    nozzle.rotation.x = Math.PI;
    this.tagComponent(this.cuttingHeadGroup, "laser_head", "Автофокусты лазерлік кескіш бас (Autofocus Cutting Head & Optics)",
      "Коллимациялық линза, қорғаныс әйнегі, автофокус жетегі және біріктірілген сопло. Металды балқытуға қажетті сәулені нүктеге фокустайды.",
      "Optics + AI Height (0-10V)", "Process Head", "Focal range ±10mm", "Beam spot: 0.1 mm");
    this.cuttingHeadGroup.add(nozzle);

    // Laser Beam Ray Visualizer (converging cone to sheet)
    const beamGeo = new THREE.ConeGeometry(0.02, 0.18, 16);
    this.laserBeamMesh = new THREE.Mesh(beamGeo, this.materials.laserCore);
    this.laserBeamMesh.position.set(0, -0.26, 0);
    this.laserBeamMesh.visible = false; // Turned on during cutting/simulation
    this.cuttingHeadGroup.add(this.laserBeamMesh);

    this.zSlideGroup.add(this.cuttingHeadGroup);
  },

  // ==================== LAYER 4: PNEUMATICS & GAS ====================
  buildPneumaticsAndGas() {
    const layer = this.layers[4];

    // Proportional Gas Valve & Solenoid Manifold Box (O2, N2, Compressed Air)
    const gasManifoldGeo = new THREE.BoxGeometry(0.3, 0.25, 0.15);
    const gasManifold = new THREE.Mesh(gasManifoldGeo, this.materials.machineDark);
    gasManifold.position.set(0.8, 0.8, -0.15);

    // 3 color-coded gas inlet ports (O2 Blue, N2 Green, Air Yellow)
    const portGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.04, 12);
    const o2Port = new THREE.Mesh(portGeo, new THREE.MeshStandardMaterial({ color: 0x0099ff }));
    o2Port.position.set(-0.08, -0.13, 0);
    gasManifold.add(o2Port);

    const n2Port = new THREE.Mesh(portGeo, new THREE.MeshStandardMaterial({ color: 0x00ff88 }));
    n2Port.position.set(0, -0.13, 0);
    gasManifold.add(n2Port);

    const airPort = new THREE.Mesh(portGeo, new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
    airPort.position.set(0.08, -0.13, 0);
    gasManifold.add(airPort);

    this.tagComponent(gasManifold, "gas_manifold", "Пневматикалық көмекші газ клапандар блогы (Proportional Gas Manifold)",
      "Оттек (O2), Азот (N2) және сығылған ауа қысымын пропорционалды реттегіш (SMC 0–25 bar) және электромагниттік клапандар арқылы автоматты басқару.",
      "Analog Output (0-10V) + 24V Solenoid", "Pneumatic Control", "0.5 – 25 bar", "Кесу сапасы мен жылдамдығын арттырады");
    this.gantryGroup.add(gasManifold);
  },

  // ==================== LAYER 5: CHILLER SYSTEM ====================
  buildChillerCabinet() {
    const layer = this.layers[5];

    // Dual-Circuit Industrial Water Chiller (Hanli / S&A Dual Temp)
    const chillerGeo = new THREE.BoxGeometry(0.7, 0.95, 0.75);
    const chiller = new THREE.Mesh(chillerGeo, this.materials.machineDark);
    chiller.position.set(-1.6, 0.48, -0.8);
    chiller.castShadow = true;

    // Chiller front vent slats
    const ventGeo = new THREE.BoxGeometry(0.5, 0.35, 0.02);
    const vent = new THREE.Mesh(ventGeo, this.materials.slatSteel);
    vent.position.set(0, -0.15, 0.38);
    chiller.add(vent);

    // Chiller LED Temperature Display (22.4°C Laser / 28.0°C Optics)
    const tempDispGeo = new THREE.BoxGeometry(0.2, 0.08, 0.02);
    const tempDisp = new THREE.Mesh(tempDispGeo, this.materials.displayScreen);
    tempDisp.position.set(0, 0.28, 0.38);
    chiller.add(tempDisp);

    this.tagComponent(chiller, "chiller", "Екі контурлы чиллер салқындату жүйесі (Dual-Circuit Water Chiller)",
      "Лазер генераторына төмен температуралы (22.4°C) және оптикалық бастиекке тұрақты (28.0°C) дистилденген су береді. Ағын датчигі және температуралық интерлокпен жабдықталған.",
      "AI (PT100) + DI (Flow Interlock)", "Cooling", "Dual Circuit ±0.5°C", "T > 32°C кезінде лазер сәулесі бірден өшеді");
    layer.add(chiller);
  },

  // ==================== LAYER 6: SENSORS & TRANSDUCERS ====================
  buildSensorsAndSwitches() {
    const layer = this.layers[6];

    // Capacitive Height Sensor Nozzle Tip (already attached to cutting head)
    // Add Inductive Limit Proximity Switches at Axis Ends (X+, X-, Y+, Y-)
    const limitGeo = new THREE.BoxGeometry(0.04, 0.04, 0.06);
    const limitMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });

    const limitXPos = new THREE.Mesh(limitGeo, limitMat);
    limitXPos.position.set(0.9, 0.9, 0);
    this.tagComponent(limitXPos, "limit_x_plus", "X+ Осінің Индуктивті Шектеуіш Датчигі (X+ Hardware Limit Switch)",
      "Каретканың шектік шекарадан асып кетуін (overtravel) аппараттық деңгейде болдырмайтын 24V PNP датчик.",
      "Digital Input (24V DC PNP)", "Safety Sensor", "NC Тізбек", "Жедел тежеу (Hard Stop)");
    this.gantryGroup.add(limitXPos);
  },

  // ==================== LAYER 7: PLC & CNC ELECTRICAL CABINET & OPERATOR STATION ====================
  buildElectricalCabinet() {
    const layer = this.layers[7];

    // Main Cabinet Group
    this.cabinetGroup = new THREE.Group();
    this.cabinetGroup.name = "ELECTRICAL_CABINET_GROUP";
    this.cabinetGroup.position.set(1.6, 0.75, 0.8);

    // 1. Cabinet Main Enclosure Housing (Dark industrial graphite steel, open front)
    const cabOuterGeo = new THREE.BoxGeometry(0.82, 1.45, 0.58);
    const cabinetBody = new THREE.Mesh(cabOuterGeo, this.materials.machineDark);
    cabinetBody.castShadow = true;
    cabinetBody.receiveShadow = true;
    this.cabinetGroup.add(cabinetBody);

    // Cabinet Interior Galvanized Backplate
    const backplateGeo = new THREE.BoxGeometry(0.76, 1.38, 0.02);
    const backplate = new THREE.Mesh(backplateGeo, this.materials.cabinetBackplate);
    backplate.position.set(0, 0, -0.22);
    this.cabinetGroup.add(backplate);

    // Top, Middle, Bottom Polished Steel DIN Rails (3 horizontal rails)
    const dinRailGeo = new THREE.BoxGeometry(0.72, 0.035, 0.015);
    const railYPositions = [0.42, 0.04, -0.38];
    railYPositions.forEach((yPos) => {
      const rail = new THREE.Mesh(dinRailGeo, this.materials.polishedSteel);
      rail.position.set(0, yPos, -0.20);
      rail.castShadow = true;
      this.cabinetGroup.add(rail);
    });

    // ---------------- TOP DIN RAIL COMPONENTS ----------------
    // 1) Main Circuit Breaker (QF1 380V 3P)
    const breakerGroup = new THREE.Group();
    breakerGroup.position.set(-0.25, 0.44, -0.14);
    const breakerBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.11), this.materials.plcHousing);
    breakerBody.castShadow = true;
    const breakerToggle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.05), this.materials.safetyRed);
    breakerToggle.position.set(0, 0.02, 0.06);
    breakerGroup.add(breakerBody, breakerToggle);
    this.tagComponent(breakerGroup, "main_breaker", "Бас автоматты ажыратқыш QF1 (Main 380V Circuit Breaker)",
      "3-фазалы 380V желілік қоректі қорғау және қолмен қосу/ажырату құрылғысы.",
      "380V AC 3P", "Power Input", "In = 63A / Icu = 50kA", "Электродинамикалық қорғаныс", {
        type: "Molded Case Breaker (MCCB 3P 63A)",
        feedback: "DI көмекші контакт (Қалыпты жабық)",
        control: "Қолмен басқару / Аппараттық расцепитель",
        accuracy: "Жылдамдық < 10 ms ажырату"
      });
    this.cabinetGroup.add(breakerGroup);

    // 2) Main AC Magnetic Contactor (KM1)
    const contactorGroup = new THREE.Group();
    contactorGroup.position.set(-0.11, 0.44, -0.14);
    const contMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 0.10), this.materials.machineDark);
    contMesh.castShadow = true;
    contactorGroup.add(contMesh);
    this.tagComponent(contactorGroup, "main_contactor", "Күштік магниттік контактор KM1 (AC Main Contactor)",
      "380V күштік сервошинаны қауіпсіздік релесі мен PLC пәрменімен қосу/ажырату.",
      "24V DC Coil / 380V 40A", "Power Switching", "AC-3 40A Режимі", "STO тізбегіне тәуелді", {
        type: "Magnetic Contactor (3P + 1NO/1NC)",
        feedback: "Mirror Contact (DI Contactor Status)",
        control: "DO 0.0 + Safety Relay Interlock",
        accuracy: "Механикалық ресурс: 10 млн цикл"
      });
    this.cabinetGroup.add(contactorGroup);

    // 3) Industrial 24V DC Power Supply (PSU 480W)
    const psuGroup = new THREE.Group();
    psuGroup.position.set(0.12, 0.44, -0.13);
    const psuMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.17, 0.12), this.materials.polishedSteel);
    psuMesh.castShadow = true;
    const psuLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    psuLed.position.set(0.06, 0.05, 0.065);
    psuGroup.add(psuMesh, psuLed);
    this.tagComponent(psuGroup, "power_supply", "24V DC Импульстік қорек көзі (24V 20A Power Supply)",
      "380V айнымалы токты тұрақты 24V DC кернеуге түрлендіріп, PLC, датчиктер мен логиканы қоректендіреді.",
      "Input 380V AC / Output 24V DC", "Power Supply", "24V DC 20A (480W)", "Overload & Thermal Protection", {
        type: "Industrial DIN Rail Switch-Mode PSU",
        feedback: "DC OK релелік шығыс (DI 24V Health)",
        control: "Тұрақты кернеу стабилизаторы",
        accuracy: "Пульсация < 50 mV, ПӘК 94%"
      });
    this.cabinetGroup.add(psuGroup);

    // ---------------- MIDDLE DIN RAIL COMPONENTS ----------------
    // 4) PLC Controller CPU Module (EtherCAT Master)
    const plcGroup = new THREE.Group();
    plcGroup.position.set(-0.24, 0.05, -0.14);
    const plcMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.11), this.materials.plcHousing);
    plcMesh.castShadow = true;
    const plcLed = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    plcLed.position.set(0.04, 0.05, 0.06);
    plcGroup.add(plcMesh, plcLed);
    this.tagComponent(plcGroup, "plc_controller", "EtherCAT Master PLC Бас Контроллері (Real-Time PLC CPU)",
      "Станоктың барлық автоматтандыру логикасын, циклдерін және 1 мс EtherCAT шинасын синхронды басқаратын бас процессор.",
      "EtherCAT 100 Mbps Master", "Automation Controller", "Cycle Time: 1.0 ms / Jitter < 1 µs", "Galvanic Isolation 2.5 kV", {
        type: "Real-Time Embedded Soft-PLC",
        feedback: "EtherCAT Cyclic State (OP/SAFE-OP)",
        control: "IEC 61131-3 бағдарламалау (ST, LD)",
        accuracy: "Джиттер < 1 µs, детерминистік"
      });
    this.cabinetGroup.add(plcGroup);

    // 5) CNC Real-Time Motion Controller Slice
    const cncGroup = new THREE.Group();
    cncGroup.position.set(-0.09, 0.05, -0.14);
    const cncMesh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.11), this.materials.plcHousing);
    cncMesh.castShadow = true;
    cncGroup.add(cncMesh);
    this.tagComponent(cncGroup, "cnc_module", "CNC Интерполятор және Траектория модулі (CNC Motion Controller)",
      "G-кодты өңдеп, Look-Ahead алгоритмі арқылы бұрыштар мен радиустарды жоғары дәлдікпен есептейтін аппараттық модуль.",
      "Real-time Motion Bus", "Trajectory Planner", "500 Block Look-Ahead", "S-Curve Acceleration", {
        type: "Multi-Axis Real-Time CNC Kernel",
        feedback: "Нақты осьтік координаталар (DRO)",
        control: "G00/G01/G02/G03 + M-Codes",
        accuracy: "Интерполяция қателігі < 0.005 mm"
      });
    this.cabinetGroup.add(cncGroup);

    // 6) Safety Relay (Pilz / PNOZ STO Relay)
    const safetyRelayGroup = new THREE.Group();
    safetyRelayGroup.position.set(0.05, 0.05, -0.14);
    const relayMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.10), this.materials.safetyYellow);
    relayMesh.castShadow = true;
    const relayLed = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    relayLed.position.set(0, 0.04, 0.055);
    safetyRelayGroup.add(relayMesh, relayLed);
    this.tagComponent(safetyRelayGroup, "safety_relay", "Аппараттық Қауіпсіздік Релесі (Pilz PNOZ STO Safety Relay)",
      "Қос каналды E-Stop және есік интерлоктарын бақылап, серводрайверлердің STO арнасын тікелей ажырататын модуль.",
      "Dual Channel NC (24V)", "Safety Supervisor", "SIL 3 / Cat. 4 / PL e", "Бағдарламалық іркіліске тәуелсіз", {
        type: "Hardware Safety Relay Module",
        feedback: "Redundant Guided Contacts (DI Safety State)",
        control: "Аппараттық логикалық тізбек",
        accuracy: "Реакция уақыты < 15 ms STO өшіру"
      });
    this.cabinetGroup.add(safetyRelayGroup);

    // 7) Digital & Analog I/O Slice Modules
    const ioGroup = new THREE.Group();
    ioGroup.position.set(0.20, 0.05, -0.14);
    const ioMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.09), this.materials.plcHousing);
    ioMesh.castShadow = true;
    ioGroup.add(ioMesh);
    this.tagComponent(ioGroup, "io_modules", "Дискретті және Аналогтық I/O модульдері (16DI / 16DO / 4AI / 2AO)",
      "Сыйымдылықты биіктік датчигі (0-10V), газ қысымы (4-20mA), шектеуіштер мен клапандарды байланыстыратын блок.",
      "DI/DO/AI/AO Optocoupled", "Signal Conditioning", "16-bit ADC/DAC", "24V DC PNP / NPN", {
        type: "EtherCAT Distributed Remote I/O",
        feedback: "I/O Telemetry Status Register",
        control: "PLC Cyclic I/O Image",
        accuracy: "Аналогтық өлшеу дәлдігі: 0.1%"
      });
    this.cabinetGroup.add(ioGroup);

    // ---------------- BOTTOM DIN RAIL COMPONENTS ----------------
    // 8) AC Servo Drives Array (X, Y1, Y2, Z Drives with Heatsinks)
    const drivesGroup = new THREE.Group();
    drivesGroup.position.set(-0.10, -0.36, -0.12);
    // 4 drives side-by-side
    for (let d = 0; d < 4; d++) {
      const driveMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.14), this.materials.machineDark);
      driveMesh.position.set((d - 1.5) * 0.09, 0, 0);
      driveMesh.castShadow = true;
      // 7-segment green mini display
      const ledDisp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.01), this.materials.displayScreen);
      ledDisp.position.set(0, 0.07, 0.075);
      driveMesh.add(ledDisp);
      drivesGroup.add(driveMesh);
    }
    this.tagComponent(drivesGroup, "servo_drives", "X / Y1 / Y2 / Z Серводрайверлер кешені (4x AC Servo Drives + STO)",
      "4 сервомотордың тогын, жылдамдығын және орнын 23-биттік жабық контурда реттейтін күштік IGBT инверторлар кешені.",
      "380V AC Input / PWM Motor Output", "Drive Inverter", "3000 RPM / 23-bit Optical Feedback", "Hardware STO Integrated", {
        type: "Digital AC Servo Drive (EtherCAT CoE)",
        feedback: "BiSS-C / EnDat 23-bit Optical Absolute",
        control: "CSP (Cyclic Synchronous Position)",
        accuracy: "Ток контуры: 62.5 µs, Орын: 1.0 ms"
      });
    this.cabinetGroup.add(drivesGroup);

    // 9) Weidmüller Terminal Blocks (XT1 / XT2 Power & Signal Terminals)
    const terminalsGroup = new THREE.Group();
    terminalsGroup.position.set(0.20, -0.38, -0.14);
    const termMesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.10, 0.08), this.materials.aviationAlu);
    termMesh.castShadow = true;
    terminalsGroup.add(termMesh);
    this.tagComponent(terminalsGroup, "terminal_blocks", "Клеммалық колодкалар XT1/XT2 (Terminal Blocks & Power Distribution)",
      "Күштік 380V желісі мен 24V экрандалған сигнал сымдарын сұрыптап таратуға арналған өндірістік серіппелі клеммалар.",
      "Weidmüller DIN Terminals", "Wiring Interface", "Screwless Push-In 6 mm²", "Shielded Earth PE Clamps", {
        type: "Multi-tier Industrial Terminal Strip",
        feedback: "Нүктелік диагностикалық тестерлер",
        control: "Кроссировкалық тарату",
        accuracy: "EMC экрандау және сенімді байланыс"
      });
    this.cabinetGroup.add(terminalsGroup);

    // ---------------- HINGED CABINET FRONT DOOR ----------------
    // Hinge pivot located at left edge of front face: x = -0.41, z = +0.28
    this.cabinetDoorGroup = new THREE.Group();
    this.cabinetDoorGroup.name = "CABINET_DOOR_GROUP";
    this.cabinetDoorGroup.position.set(-0.41, 0, 0.29);

    // Door Panel Mesh (offset by +0.40 along X so it pivots along its left edge)
    const doorPanelGeo = new THREE.BoxGeometry(0.80, 1.43, 0.02);
    const doorMesh = new THREE.Mesh(doorPanelGeo, this.materials.machineDark);
    doorMesh.position.set(0.40, 0, 0);
    doorMesh.castShadow = true;

    // Senfeng Orange Accent Brand Stripe on door
    const doorStripe = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.06, 0.005), this.materials.accentOrange);
    doorStripe.position.set(0, 0.35, 0.012);
    doorMesh.add(doorStripe);

    // Acrylic Inspection Window on door
    const doorWindow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.70, 0.01), this.materials.displayScreen);
    doorWindow.position.set(0, -0.05, 0.012);
    doorMesh.add(doorWindow);

    // Industrial Chrome Door Handle & Keylock
    const handleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.22, 12);
    const doorHandle = new THREE.Mesh(handleGeo, this.materials.polishedSteel);
    doorHandle.position.set(0.34, 0, 0.035);
    doorMesh.add(doorHandle);

    this.cabinetDoorGroup.add(doorMesh);
    this.cabinetGroup.add(this.cabinetDoorGroup);

    // Tag entire cabinet for general click
    this.tagComponent(cabinetBody, "cnc_cabinet", "CNC & PLC Электр басқару шкафы (Electrical Control Cabinet)",
      "380V күштік және 24V басқару жабдықтары, PLC, CNC, серводрайверлер мен қауіпсіздік релесі орналасқан бас орталық.",
      "380V AC / 24V DC / EtherCAT", "Central Automation Cabinet", "IP54 / Rittal Industrial", "Қос каналды STO қауіпсіздік", {
        type: "Industrial CNC & PLC Enclosure",
        feedback: "Температура және есік интерлогы",
        control: "Орталық автоматтандыру блогы",
        accuracy: "Климат-бақылау: мәжбүрлі желдеткіш"
      });

    layer.add(this.cabinetGroup);

    // 2. Build Industrial PC & Large Operator Station (HMI)
    this.buildOperatorStation(layer);
  },

  // ==================== OPERATOR WORKSTATION & LARGE HMI ====================
  buildOperatorStation(layer) {
    this.operatorStationGroup = new THREE.Group();
    this.operatorStationGroup.name = "OPERATOR_WORKSTATION_HMI";
    this.operatorStationGroup.position.set(1.15, 0, 1.45);

    // Heavy Industrial Pedestal Stand (metallic dark)
    const standGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.95, 16);
    const stand = new THREE.Mesh(standGeo, this.materials.machineDark);
    stand.position.set(0, 0.48, 0);
    stand.castShadow = true;
    this.operatorStationGroup.add(stand);

    // Pedestal Base Plate (bolted to floor)
    const basePlateGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.04, 16);
    const basePlate = new THREE.Mesh(basePlateGeo, this.materials.polishedSteel);
    basePlate.position.set(0, 0.02, 0);
    basePlate.castShadow = true;
    this.operatorStationGroup.add(basePlate);

    // Articulated Swivel Arm
    const armGeo = new THREE.BoxGeometry(0.08, 0.08, 0.25);
    const arm = new THREE.Mesh(armGeo, this.materials.aviationAlu);
    arm.position.set(0, 0.95, 0.08);
    this.operatorStationGroup.add(arm);

    // Operator Console Console Desk (Keyboard & Touchpad Tray)
    const deskGeo = new THREE.BoxGeometry(0.56, 0.05, 0.28);
    const desk = new THREE.Mesh(deskGeo, this.materials.machineDark);
    desk.position.set(0, 0.96, 0.22);
    desk.rotation.x = 0.15; // Slightly angled towards operator
    desk.castShadow = true;
    this.operatorStationGroup.add(desk);

    // Physical Emergency Stop Button on operator desk
    const estopBase = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.05), this.materials.safetyYellow);
    estopBase.position.set(0.22, 0.04, 0.05);
    const estopMushroom = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.025, 16), this.materials.safetyRed);
    estopMushroom.position.set(0, 0.025, 0);
    estopBase.add(estopMushroom);
    desk.add(estopBase);

    // Large Industrial 24-Inch HMI Widescreen Monitor (Rotated towards operator)
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0, 1.25, 0.16);
    monitorGroup.rotation.x = -0.12;

    const monitorBezelGeo = new THREE.BoxGeometry(0.62, 0.38, 0.04);
    const monitorBezel = new THREE.Mesh(monitorBezelGeo, this.materials.machineDark);
    monitorBezel.castShadow = true;

    // Glowing active HMI Screen showing CNC parameters
    const screenGeo = new THREE.PlaneGeometry(0.58, 0.34);
    this.hmiScreenMesh = new THREE.Mesh(screenGeo, this.materials.displayScreen);
    this.hmiScreenMesh.position.set(0, 0, 0.022);
    monitorGroup.add(monitorBezel, this.hmiScreenMesh);
    this.operatorStationGroup.add(monitorGroup);

    // Tag Operator Station
    this.tagComponent(this.operatorStationGroup, "operator_station", "Өнеркәсіптік Операторлық Компьютер және Үлкен HMI Мониторы",
      "Industrial PC, сенсорлық үлкен экран, пернетақта консолі және жедел E-Stop батырмасымен жабдықталған оператор бекеті.",
      "Ethernet TCP/IP + RS-485", "Operator Interface", "24-Inch Full HD / IP65 Touch", "Қолмен басқару және жедел тоқтату", {
        type: "Industrial PC + Large HMI Workstation",
        feedback: "Нақты уақыттық CNC диспетчерлік экраны",
        control: "Сенсорлық экран / G-код жүктеу",
        accuracy: "1920×1080 Full HD, жылдамдығы 100 Hz"
      });

    layer.add(this.operatorStationGroup);
  },

  // Toggle Cabinet Door Open / Closed with smooth GSAP animation
  toggleCabinetDoor(forceOpen = null) {
    if (!this.cabinetDoorGroup) return false;
    this.isCabinetOpen = forceOpen !== null ? forceOpen : !this.isCabinetOpen;
    const targetAngle = this.isCabinetOpen ? -Math.PI * 0.65 : 0;

    if (window.gsap) {
      gsap.to(this.cabinetDoorGroup.rotation, {
        y: targetAngle,
        duration: 1.2,
        ease: "power2.inOut"
      });
    } else {
      this.cabinetDoorGroup.rotation.y = targetAngle;
    }

    // Update UI button state if present
    const btn = document.getElementById('cabinet-door-toggle-btn');
    if (btn) {
      btn.classList.toggle('active', this.isCabinetOpen);
      btn.innerHTML = this.isCabinetOpen ?
        '<i class="fa-solid fa-door-closed"></i> <span>ШКАФТЫ ЖАБУ</span>' :
        '<i class="fa-solid fa-door-open"></i> <span>ШКАФТЫ АШУ (OPEN CABINET)</span>';
    }

    if (window.SoundFX) SoundFX.click();
    return this.isCabinetOpen;
  },

  // ==================== LAYER 8: HARDWARE SAFETY ====================
  buildSafetyDevices() {
    const layer = this.layers[8];

    // Physical Red Mushroom Emergency Stop (E-Stop) on bed corner
    const estopBaseGeo = new THREE.BoxGeometry(0.08, 0.08, 0.06);
    const estopBase = new THREE.Mesh(estopBaseGeo, this.materials.safetyYellow);
    estopBase.position.set(1.05, 0.68, 1.65);

    const estopButtonGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16);
    const estopButton = new THREE.Mesh(estopButtonGeo, this.materials.safetyRed);
    estopButton.position.set(0, 0, 0.04);
    estopButton.rotation.x = Math.PI / 2;
    estopBase.add(estopButton);

    this.tagComponent(estopBase, "estop_button", "Аппараттық Авариялық Тоқтату Батырмасы (Physical Hardware E-Stop)",
      "Қос каналды қалыпты-тұйықталған (NC) қауіпсіздік тізбегі. Басылғанда сервожетектердің STO (Safe Torque Off) кірісіне түсіп, күштік моментті бірден ажыратады.",
      "Dual NC Hardware Safety Loop", "Safety Device", "SIL3 / Cat.4 / PLe", "Бағдарламалық қателіктерге тәуелсіз", {
        type: "Emergency Stop Pushbutton (EN ISO 13850)",
        feedback: "Dual NC 24V Hardware Loop",
        control: "Safe Torque Off (STO) тікелей ажырату",
        accuracy: "Реакция уақыты < 15 ms"
      });
    layer.add(estopBase);
  },

  // Raw sheet workpiece lying on the cutting table
  buildWorkpiece() {
    const sheetGeo = new THREE.BoxGeometry(1.3, 0.003, 2.4);
    const sheetMesh = new THREE.Mesh(sheetGeo, this.materials.sheetMetal);
    sheetMesh.position.set(0, 0.67, 0);
    sheetMesh.receiveShadow = true;
    this.layers[1].add(sheetMesh);
  },

  // Attach metadata and register mesh for raycasting click detection
  tagComponent(mesh, id, name, role, signalType, direction, spec, safety, extra = {}) {
    mesh.userData = {
      isAutoComponent: true,
      isKipiaComponent: true, // Keep for backward-compatibility
      id,
      name,
      role, // Function
      signalType,
      direction,
      spec,
      safety,
      // 5 Core Engineering Specification Fields
      type: extra.type || direction || "Инженерлік торап",
      feedback: extra.feedback || "Өнеркәсіптік шина (EtherCAT)",
      control: extra.control || "CNC / PLC контроллері",
      accuracy: extra.accuracy || spec || "Closed-loop control"
    };
    this.interactiveParts.push(mesh);
  },

  setupInteractiveMesh(root) {
    root.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  },

  // Set layer explosion distance (Explode mode)
  setExplodeDistance(factor = 0) {
    if (this.layers[1]) this.layers[1].position.set(0, 0, 0);
    if (this.layers[2]) this.layers[2].position.set(0, factor * 0.4, 0); // Gantry
    if (this.layers[3]) this.layers[3].position.set(factor * 0.6, factor * 0.7, -factor * 0.3); // Laser
    if (this.layers[4]) this.layers[4].position.set(0, factor * 0.9, 0); // Gas
    if (this.layers[5]) this.layers[5].position.set(-factor * 0.7, factor * 0.5, -factor * 0.3); // Chiller
    if (this.layers[6]) this.layers[6].position.set(0, factor * 1.1, 0); // Sensors
    if (this.layers[7]) this.layers[7].position.set(factor * 0.8, factor * 0.6, factor * 0.5); // Cabinet
    if (this.layers[8]) this.layers[8].position.set(factor * 0.5, factor * 0.8, factor * 0.7); // Safety
  },

  toggleLayerVisibility(layerIndex, visible) {
    if (this.layers[layerIndex]) {
      this.layers[layerIndex].visible = visible;
    }
  }
};
