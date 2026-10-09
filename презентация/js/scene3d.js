/**
 * SCENE3D.JS - Three.js WebGL Scene, Industrial Lighting, Shaders, Raycaster & Sparks Particles
 */

const SceneManager = {
  container: null,
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
  raycaster: null,
  mouse: null,
  sparksGroup: null,
  sparksParticles: [],
  clock: null,
  hoveredObject: null,
  isIdleAnimating: true,

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    // 1. Scene Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0d14);
    this.scene.fog = new THREE.FogExp2(0x0a0d14, 0.08);

    // 2. Camera Setup (Cinematic 3/4 perspective)
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
    this.camera.position.set(4.2, 3.2, 4.8);

    // 3. WebGL Renderer with High-End PBR tone mapping & shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going below ground
    this.controls.minDistance = 0.8;
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 0.8, 0);

    // 5. Initialize Camera Controller
    CameraController.init(this.camera, this.controls);

    // 6. Industrial Lighting Setup
    this.setupLighting();

    // 7. Industrial Engineering Grid Floor
    this.setupFloorGrid();

    // 8. Build 3D SENFENG NP 3015 Machine
    MachineBuilder.build(this.scene, (percent) => {
      const fill = document.getElementById('loader-progress-fill');
      const text = document.getElementById('loader-percentage');
      if (fill) fill.style.width = `${percent}%`;
      if (text) text.innerText = `${percent}%`;
      if (percent >= 100) {
        setTimeout(() => {
          const loader = document.getElementById('loading-screen');
          if (loader) loader.classList.add('hidden');
        }, 400);
      }
    });

    // 9. Sparks Particle System
    this.setupSparksSystem();

    // 10. Event Listeners
    this.bindEvents();

    // 11. Start Render Loop
    this.animate();
  },

  setupLighting() {
    // Ambient light (subtle cool blue fill)
    const ambLight = new THREE.AmbientLight(0x223048, 1.2);
    this.scene.add(ambLight);

    // Main Key Directional Light with soft cast shadow
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Cool Cyber Cyan Rim Light (from behind machine)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    rimLight.position.set(-4, 5, -5);
    this.scene.add(rimLight);

    // Senfeng Orange Accent Point Light near electrical cabinet
    const orangePoint = new THREE.PointLight(0xff6b00, 1.8, 6);
    orangePoint.position.set(1.6, 1.2, 0.8);
    this.scene.add(orangePoint);
  },

  setupFloorGrid() {
    // Clean industrial coordinate grid
    const gridHelper = new THREE.GridHelper(16, 32, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Subtle dark reflective floor disc
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.4,
      metalness: 0.85
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.005;
    floor.receiveShadow = true;
    this.scene.add(floor);
  },

  setupSparksSystem() {
    this.sparksGroup = new THREE.Group();
    this.sparksGroup.name = "SPARKS_PARTICLE_SYSTEM";
    this.sparksGroup.visible = false;

    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 80;
    const positions = new Float32Array(sparkCount * 3);
    const velocities = [];

    for (let i = 0; i < sparkCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0.65;
      positions[i * 3 + 2] = 0;
      velocities.push({
        vx: (Math.random() - 0.5) * 0.08,
        vy: -Math.random() * 0.06 - 0.02,
        vz: (Math.random() - 0.5) * 0.08,
        life: Math.random()
      });
    }

    sparkGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const sparkMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.035,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    this.sparksParticles = {
      points: new THREE.Points(sparkGeo, sparkMat),
      velocities,
      count: sparkCount
    };

    this.sparksGroup.add(this.sparksParticles.points);
    this.scene.add(this.sparksGroup);
  },

  updateSparks(cuttingHeadWorldPos) {
    if (!this.sparksGroup.visible || !this.sparksParticles) return;

    const posAttr = this.sparksParticles.points.geometry.attributes.position;
    const vels = this.sparksParticles.velocities;

    for (let i = 0; i < this.sparksParticles.count; i++) {
      let vx = vels[i].vx;
      let vy = vels[i].vy;
      let vz = vels[i].vz;

      posAttr.array[i * 3] += vx;
      posAttr.array[i * 3 + 1] += vy;
      posAttr.array[i * 3 + 2] += vz;

      vels[i].life -= 0.04;

      // Reset spark when life expires or reaches ground
      if (vels[i].life <= 0 || posAttr.array[i * 3 + 1] < 0.2) {
        posAttr.array[i * 3] = cuttingHeadWorldPos.x + (Math.random() - 0.5) * 0.02;
        posAttr.array[i * 3 + 1] = cuttingHeadWorldPos.y - 0.18;
        posAttr.array[i * 3 + 2] = cuttingHeadWorldPos.z + (Math.random() - 0.5) * 0.02;
        vels[i].life = 1.0;
        vels[i].vx = (Math.random() - 0.5) * 0.09;
        vels[i].vy = -Math.random() * 0.06 - 0.03;
        vels[i].vz = (Math.random() - 0.5) * 0.09;
      }
    }
    posAttr.needsUpdate = true;
  },

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Raycast on click
    this.container.addEventListener('pointerdown', (e) => {
      this.isIdleAnimating = false;
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(MachineBuilder.interactiveParts, true);

      if (intersects.length > 0) {
        // Find top interactive tagged object in hierarchy
        let target = intersects[0].object;
        while (target && !target.userData?.isKipiaComponent && target.parent) {
          target = target.parent;
        }

        if (target && target.userData?.isKipiaComponent) {
          if (window.SoundFX) SoundFX.click();
          this.onComponentSelected(target);
        }
      }
    });
  },

  onComponentSelected(obj) {
    const data = obj.userData;
    if (!data) return;

    // Show details drawer
    const drawer = document.getElementById('component-drawer');
    if (!drawer) return;

    const badgeEl = document.getElementById('comp-type-badge');
    if (badgeEl) badgeEl.innerText = data.type || data.direction || "ИНЖЕНЕРЛІК БӨЛШЕК";
    
    const titleEl = document.getElementById('comp-title');
    if (titleEl) titleEl.innerText = data.name || "Компонент атауы";

    const subtitleEl = document.getElementById('comp-subtitle');
    if (subtitleEl) subtitleEl.innerText = `${data.type || 'Өнеркәсіптік құрылғы'} // ${data.spec || ''}`;

    const roleEl = document.getElementById('comp-role');
    if (roleEl) roleEl.innerText = data.role || "Автоматтандырудағы негізгі қызметі...";

    const sigTypeEl = document.getElementById('comp-signal-type');
    if (sigTypeEl) sigTypeEl.innerText = data.signalType || data.control || "EtherCAT / 24V DC";

    const dirEl = document.getElementById('comp-direction');
    if (dirEl) dirEl.innerText = data.feedback || data.direction || "Кері байланыс (Feedback)";

    const specEl = document.getElementById('comp-spec');
    if (specEl) specEl.innerText = data.accuracy || data.spec || "±0.01 mm";

    const safetyEl = document.getElementById('comp-safety-note');
    if (safetyEl) safetyEl.innerText = data.safety || "Қауіпсіздік және аппараттық интерлок тізбегіне қосылған.";

    drawer.classList.add('active');

    // Visual pulse highlight on selected 3D mesh
    const targetMesh = obj.isMesh ? obj : (obj.children && obj.children.find(c => c.isMesh)) || null;
    if (targetMesh && targetMesh.material && targetMesh.material.emissive) {
      const origHex = targetMesh.material.emissive.getHex();
      const origIntensity = targetMesh.material.emissiveIntensity !== undefined ? targetMesh.material.emissiveIntensity : 0.2;
      targetMesh.material.emissive.setHex(0x00f0ff);
      targetMesh.material.emissiveIntensity = 0.9;
      setTimeout(() => {
        if (targetMesh.material && targetMesh.material.emissive) {
          targetMesh.material.emissive.setHex(origHex);
          targetMesh.material.emissiveIntensity = origIntensity;
        }
      }, 700);
    }

    // Smooth camera focus on object
    CameraController.focusOnObject(obj);
  },

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  },

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Idle subtle rotation when idle and in Hero view
    if (this.isIdleAnimating && window.app?.currentMode === 'hero') {
      const radius = 6.4;
      this.camera.position.x = Math.sin(time * 0.08) * radius;
      this.camera.position.z = Math.cos(time * 0.08) * radius;
    }

    this.controls.update();

    // Update sparks if cutting
    if (MachineBuilder.cuttingHeadGroup) {
      const headPos = new THREE.Vector3();
      MachineBuilder.cuttingHeadGroup.getWorldPosition(headPos);
      this.updateSparks(headPos);
    }

    this.renderer.render(this.scene, this.camera);
  }
};
