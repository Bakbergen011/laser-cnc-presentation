const presentationApp = {
  slides: [
    {
      tag: '01 — КІРІСПЕ ЖӘНЕ ТАҚЫРЫП',
      heading: 'Лазерлік CNC станогын автоматтандыру',
      camera: 'overview',
      body: `
        <div class="pres-highlight-box">
          <b>Негізгі идея:</b> лазерлік CNC станогы — бұл дайындықты, қозғалысты, технологиялық параметрлерді және қауіпсіздікті бір жүйеде үйлестіретін автоматтандырылған өңдеу станогы.
        </div>
        <div class="pres-grid-two">
          <div>
            <p><b>CNC</b> (Computer Numerical Control) — бағдарламалық түрде дайындалған траекторияны, координаталарды және қозғалыс реттілігін нақты осьтерге айналдыратын басқару тәсілі. Бұл машинаны «жазылған программа бойынша» жұмыс істетеді.</p>
            <p>Лазерлік кесу процесте дайындықты өңдеу, пішіннің орындалуы, газды басқару, лазер қуаты, биіктік және қауіпсіздік бір уақытта үйлестіріледі. Оператор тек тапсырманы береді, ал басқару жүйесі суретке сәйкес қозғалысты, жылдамдықты, жанасуды және технологиялық күйді бақылайды.</p>
          </div>
          <div>
            <div class="pres-visual-slot">
              <div class="pres-flow-row">
                <span>Оператор</span><span>→</span><span>HMI</span><span>→</span><span>CNC</span>
              </div>
              <div class="pres-flow-row">
                <span>Станок</span><span>→</span><span>Қозғалыс</span><span>→</span><span>Кесу</span>
              </div>
              <div class="img-caption"><strong>Жұмыс циклі:</strong> тапсырма → траектория → өңдеу → бақылау → аяқтау.</div>
            </div>
          </div>
        </div>
        <ul class="pres-points-list">
          <li>Автоматтандыру өнімділікті арттырады, себебі оператордың бірлік уақытта жасайтын әрекеттері азаяды.</li>
          <li>Қайталанғыштық жоғары, себебі бір программа бірнеше рет бірдей контур бойынша қайталанады.</li>
          <li>Қауіпсіздік жақсарады, себебі қауіпсіздік, блокировка, температура, қысым және E-stop барынша жүйелі бақыланады.</li>
        </ul>
      `
    },
    {
      tag: '02 — СТАНОКТЫҢ ЖАЛПЫ ҚҰРЫЛЫСЫ',
      heading: 'Лазерлік CNC станогының негізгі құрылымдық бөліктері',
      camera: 'overview',
      body: `
        <div class="pres-grid-two">
          <div>
            <ul class="pres-points-list">
              <li><b>Рама</b> — негізгі жүк пен күшті беріліс үшін құрылымдық тіреу; қозғалыс кезінде деформацияны азайтады.</li>
              <li><b>Жұмыс үстелі</b> — материалдың орналасатын беті; кесу, қаптамалық позициялау, тұрақтылық қамтамасыз етіледі.</li>
              <li><b>X, Y, Z осі</b> — кескіш басының кеңістіктік қозғалысын анықтайды; X/Y — жазықтықтағы траектория, Z — фокус арақашықтығын реттеу.</li>
              <li><b>Лазер кесу басы</b> — сәулені формалайды, фокустайды және материалдың үстіне жеткізеді.</li>
            </ul>
          </div>
          <div>
            <ul class="pres-points-list">
              <li><b>Сервоқозғалтқыштар</b> — осьтердің дәл қозғалысын қамтамасыз етеді.</li>
              <li><b>Механикалық беріліс</b> — рейка, шарлы гайка, винт, жетек элементтері.</li>
              <li><b>Басқару шкафы</b> — PLC, CNC, драйверлер, қорек көздері және сигналдық тізбектер.</li>
              <li><b>Газ және салқындату жүйесі</b> — кесу сапасын және лазерді қорғауды қамтамасыз етеді.</li>
            </ul>
          </div>
        </div>
        <div class="pres-visual-slot">
          <div class="pres-structure-boxes">
            <span>Рама</span>
            <span>Жұмыс үстелі</span>
            <span>X/Y/Z</span>
            <span>Лазер басы</span>
            <span>Серво</span>
            <span>Шкаф</span>
          </div>
          <div class="img-caption"><strong>Көрініс:</strong> әрбір блог бір жүйенің ғана бөлігі емес, автоматтандыру тізбегінің логикалық бөлігін құрайды.</div>
        </div>
      `
    },
    {
      tag: '03 — АВТОМАТТАНДЫРУ АРХИТЕКТУРАСЫ',
      heading: 'Бүкіл жүйенің басқару және сигналдық архитектурасы',
      camera: 'overview',
      body: `
        <div class="pres-highlight-box">
          <b>Негізгі тізбек:</b> Оператор → HMI → CNC → қозғалысты басқару → серво жүйесі → механикалық ось → encoder → кері байланыс.
        </div>
        <div class="pres-flow-row compact">
          <span>Оператор</span><span>→</span><span>HMI</span><span>→</span><span>CNC</span><span>→</span><span>Servo Drive</span><span>→</span><span>Motor</span>
        </div>
        <div class="pres-flow-row compact">
          <span>Encoder</span><span>←</span><span>Қозғалыс</span><span>←</span><span>Ось</span><span>←</span><span>Технологиялық күй</span>
        </div>
        <div class="pres-grid-two">
          <div>
            <h4 class="pres-mini-title">Технологиялық басқару бағыты</h4>
            <ul class="pres-points-list">
              <li>Кесу тапсырмасы CNC контроллерге келеді.</li>
              <li>Контроллер лазердің қуатын, газды, биіктікті және траекторияны синхрондайды.</li>
              <li>Лазер көзі, фокус басы, газ клапандары және салқындату жүйесі бір циклі бар технологиялық күйде жұмыс істейді.</li>
            </ul>
          </div>
          <div>
            <h4 class="pres-mini-title">Қорғаныс бағыты</h4>
            <ul class="pres-points-list">
              <li>Қысым датчигі, температура датчигі, E-stop, есік блокировкасы, биіктік датчигі.</li>
              <li>Блокировка актив болғанда CNC немесе PLC жұмысын тоқтатады.</li>
              <li>Ақау кезінде кедергі, хабарламалар және қауіпсіз күй іске қосылады.</li>
            </ul>
          </div>
        </div>
      `
    },
    {
      tag: '04 — CNC КОНТРОЛЛЕРІ',
      heading: 'CNC как координаттар, траектория және синхрондау жүйесі',
      camera: 'gantry',
      body: `
        <div class="pres-grid-two">
          <div>
            <p><b>CNC контроллері</b> — бұл пішін, жол, координат, жылдамдық және лазердің күйін өңдейтін негізгі «ақыл» жүйесі. Ол G-code-ты оқиды, осьтерге орын және жылдамдық тапсырмаларын береді.</p>
            <p>X, Y, Z осьтері өзара үйлестіріледі. Сызықтық қозғалыс, доға, шеңбер, жұлдыз сияқты контурлар бір программада орындалады. Бұл траекторияны минуты ішінде немесе секунт ішінде дұрыс синхрондауды талап етеді.</p>
          </div>
          <div>
            <div class="pres-visual-slot">
              <pre class="pres-code-block">G90
G01 X120 Y80 F8500
M03 S6000
G02 X200 Y100 I40 J0
M05
M30</pre>
              <div class="img-caption"><strong>G-code мысалы:</strong> абсолютті координат, жылдамдық, лазер ON/OFF, доғалық қозғалыс.</div>
            </div>
          </div>
        </div>
        <ul class="pres-points-list">
          <li><b>G90</b> — абсолютті координаталық жүйені таңдайды.</li>
          <li><b>G01</b> — түзу сызықты қозғалыс.</li>
          <li><b>F8500</b> — жылдамдықты мм/минутта задає.</li>
          <li><b>M03 S6000</b> — лазерді қосып, қуатты 6 кВт деңгейіне орнатады.</li>
        </ul>
      `
    },
    {
      tag: '05 — PLC ЖӘНЕ АВТОМАТТАНДЫРУ ЛОГИКАСЫ',
      heading: 'PLC — дискретті және қауіпсіздік логикасының жүретін жүйесі',
      camera: 'cabinet',
      body: `
        <div class="pres-grid-two">
          <div>
            <p><b>PLC</b> (Programmable Logic Controller) — дискретті кірістер мен шығыстар арқылы станоктың жұмыс режимін бақылауды қамтамасыз ететін басқару блокі. Ол E-stop, есік, газ, суыту, дайындық сигналдарын өңдейді.</p>
            <ul class="pres-points-list">
              <li>Дискретті сигналдар — 24V DC, ON/OFF күйі.</li>
              <li>Аналогтық сигналдар — температура, қысым, биіктік, қуат.</li>
              <li>Логикалық блокировкалар — техника қауіпсіздігі және циклдік бастау шарттары.</li>
            </ul>
          </div>
          <div>
            <div class="pres-highlight-box">
              <b>Мысал шарттары:</b><br>
              1. E-stop жоқ.<br>
              2. Қорғаныс есігі жабық.<br>
              3. Салқындату жүйесі дайын.<br>
              4. Газ қысымы қалыпты.<br>
              5. CNC бағдарламасы жүктелді.<br>
              6. Оператор рұқсат берді.
            </div>
          </div>
        </div>
        <p>PLC жұмысы циклдік басқаруға негізделген: сенсор сигналдары қабылданады, логика есептеледі, содан кейін реле, контактор, клапан немесе allow-сигналы шығады. CNC және PLC өзара әрекеттеседі: CNC қозғалыс тапсырмасын береді, PLC — қауіпсіздік, газ, лазер және дайындық шарттарын қадағалайды.</p>
      `
    },
    {
      tag: '06 — СЕРВОЖЕТЕК ЖӘНЕ КЕРІ БАЙЛАНЫС',
      heading: 'Серво жүйесі — дәл позициялау және жүктеменің реттелуі',
      camera: 'gantry',
      body: `
        <div class="pres-highlight-box">
          <b>Негізгі бағыт:</b> CNC тапсырмасы → Servo Drive → Servo Motor → механикалық ось → Encoder → кері байланыс → түзету.
        </div>
        <div class="pres-grid-two">
          <div>
            <ul class="pres-points-list">
              <li>Servo Drive — қозғалыс командаларын аналогты/цифрлық сигналдарға түрлендіреді.</li>
              <li>Servo Motor — осьтің нақты механикалық қозғалысын жасайды.</li>
              <li>Encoder — нақты позиция, жылдамдық және бағыт туралы мәлімет береді.</li>
              <li>Кері байланыс болмаса позиция дәлдігі төмендейді, жүйе ығысып кетуі мүмкін.</li>
            </ul>
          </div>
          <div>
            <div class="pres-visual-slot">
              <div class="pres-metric-row"><span>Берілген мән</span><b>1200.00 мм</b></div>
              <div class="pres-metric-row"><span>Нақты мән</span><b>1199.96 мм</b></div>
              <div class="pres-metric-row"><span>Қате</span><b>0.04 мм</b></div>
              <div class="img-caption"><strong>Кері байланыс:</strong> қате аз болған сайын траекторияға қатаңдық жоғары болады.</div>
            </div>
          </div>
        </div>
        <p>Серво жүйесінде жүктеме, жылдамдық және ток контурлары бір-біріне әсер етеді. Жылдамдық пен позиция параметрлері дәл реттелген кезде кесу сапасы, өлшемдердің қайталанғыштығы мен сериядағы өнімнің тұрақтылығы артады.</p>
      `
    },
    {
      tag: '07 — ЛАЗЕР КӨЗІ ЖӘНЕ КЕСУ БАСЫ',
      heading: 'Лазер көзі — энергияның шығу нүктесі, ал кесу басы — фокус пен бағыттау орны',
      camera: 'head',
      body: `
        <div class="pres-grid-two">
          <div>
            <p><b>Лазер көзі</b> оптикалық энергияны құрайды. Talшықты лазердің ұзындығы және қуаты кесу мүмкіндігіне әсер етеді. Жоғары қуат әрдайым жақсы нәтижеге әкелмейді: материал, қалыңдық, жылдамдық, фокус, газ режимі және бас сапасы бірге жұмыс істейді.</p>
            <ul class="pres-points-list">
              <li>Лазер сәулесі бас арқылы материалдың үстіне жеткізіледі.</li>
              <li>Фокус линзасы лазерді тығыз нүктеге жинайды.</li>
              <li>Қорғаныс әйнегі және саптамалар сәуленің тұрақтылығын қамтамасыз етеді.</li>
              <li>Фокус қашықтығы өзгергенде кесу ширегі және күйі өзгереді.</li>
            </ul>
          </div>
          <div>
            <div class="pres-visual-slot">
              <div class="pres-optic-diagram">
                <span>Лазер</span>
                <span>→</span>
                <span>Сәуле</span>
                <span>→</span>
                <span>Бас</span>
                <span>→</span>
                <span>Материал</span>
              </div>
              <div class="img-caption"><strong>Технология:</strong> энергияның концентрациясы, фокус және қозғалыс синхрондалуы — кесудің негізгі шарты.</div>
            </div>
          </div>
        </div>
      `
    },
    {
      tag: '08 — БИІКТІК ЖӘНЕ ГАЗ ЖҮЙЕСІ',
      heading: 'Кесу басының биіктігі мен газдың рөлі',
      camera: 'head',
      body: `
        <div class="pres-grid-two">
          <div>
            <h4 class="pres-mini-title">Биіктікті басқару</h4>
            <ul class="pres-points-list">
              <li>Кесу басы мен материал арасындағы қашықтық дұрыс болмай қалса, фокус бұзылады.</li>
              <li>Датчик немесе сенсор бас деңгейін бақылайды, кері байланыс арқылы Z осін реттейді.</li>
              <li>Материалдың бетіндегі кедергілер, жабыныс немесе қалыңдықтағы айырмашылық кесілген контурдың сапасына әсер етеді.</li>
            </ul>
          </div>
          <div>
            <h4 class="pres-mini-title">Газ жүйесі</h4>
            <ul class="pres-points-list">
              <li>Көмекші газ жанып тұрған материалдарды жояды және шебені тазартуға көмектеседі.</li>
              <li>Оттегі және азот сөзсіз бірдей емес: олардың әрекеті, жылдамдық және сапа нәтижелері өзгеше.</li>
              <li>Қысым төмен болса, қақпақ, шеті және жанып кеткен материалдың сапасы нашарлайды.</li>
            </ul>
          </div>
        </div>
        <div class="pres-highlight-box">
          <b>Принцип:</b> дұрыс бас биіктігі + дұрыс қысым + дұрыс қуат = тұрақты көше және минималды қақпақтардың пайда болуы.
        </div>
      `
    },
    {
      tag: '09 — САЛҚЫНДАТУ, ДАТЧИКТЕР ЖӘНЕ СИГНАЛДАР',
      heading: 'Температура, қысым, қозғалыс және кедергілік сигналдар',
      camera: 'cabinet',
      body: `
        <table class="pres-table">
          <thead>
            <tr><th>Датчик</th><th>Не бақылайды</th><th>Сигнал</th><th>Жауап</th></tr>
          </thead>
          <tbody>
            <tr><td>Газ датчигі</td><td>Қысым</td><td>Аналогтық</td><td>Газ жүйесін реттейді</td></tr>
            <tr><td>Температура датчигі</td><td>Лазер/салқындату</td><td>Аналогтық</td><td>Қызып кетуді тоқтатады</td></tr>
            <tr><td>Encoder</td><td>Ось координатасы</td><td>Цифрлық / импульстік</td><td>Позицияның шын мәнін береді</td></tr>
            <tr><td>Биіктік датчигі</td><td>Кесу басының қашықтығы</td><td>Аналогтық/цифрлық</td><td>Z биіктігін реттейді</td></tr>
          </tbody>
        </table>
        <p>Дискретті сигналдар — «қосулы/сөндірілген» режим; аналогтық — үздіксіз мән; цифрлық — протоколар мен пакеттер арқылы берілетін мәлімет. Қауіпсіздік жүйесі сигналдың жоғалуын, ақауды және жалған күйді де нормадан басқа мәртебеге ауыстырады.</p>
      `
    },
    {
      tag: '10 — HMI / SCADA / ОПЕРАТОР ПАНЕЛІ',
      heading: 'Оператордың бақылау интерфейсі және телеметрия',
      camera: 'cabinet',
      body: `
        <div class="pres-grid-two">
          <div>
            <p><b>HMI</b> — оператор мен машинаның байланыс беті. Онда X/Y/Z координаталары, қозғалыс жылдамдығы, лазер қуаты, газ қысымы, температура, қауіпсіздік күйі және ақаулар көрсетіледі.</p>
            <ul class="pres-points-list">
              <li>Оператор тапсырманы жүктейді.</li>
              <li>Басқару жүйесі күйді көрсетеді.</li>
              <li>Ақау туындағанда операторға ескерту шығады.</li>
              <li>Бақылаудың барлығы реальді уақыт режимінде жаңартылады.</li>
            </ul>
          </div>
          <div>
            <div class="pres-visual-slot">
              <div class="pres-metric-row"><span>X</span><b>1250.25 мм</b></div>
              <div class="pres-metric-row"><span>Y</span><b>730.40 мм</b></div>
              <div class="pres-metric-row"><span>Laser</span><b>65.0%</b></div>
              <div class="pres-metric-row"><span>Gas</span><b>1.20 MPa</b></div>
              <div class="img-caption"><strong>HMI:</strong> әр көрсеткіш — жүйенің нақты күйін білдіретін «ақпараттық арба».</div>
            </div>
          </div>
        </div>
        <div class="pres-short-desc">SCADA — көпіршік архитектурада бірнеше параметрді, дабылдарды және реттелген историяны біріктіруге арналған бақылау жүйесі. Кез келген CNC станогында міндетті «SCADA» бар деп айтуға болмайды; бұл құраушының және өндірістік архитектураның шешімі.</div>
      `
    },
    {
      tag: '11 — ӨНІМДІЛІК ЖӘНЕ БАРЛЫҚ ЦИКЛІ',
      heading: 'Толық кесу циклі: от тапсырманы дайындаудан аяқталуына дейін',
      camera: 'overview',
      body: `
        <div class="pres-grid-two">
          <div>
            <ul class="pres-points-list">
              <li><b>1.</b> Оператор бөліктің геометриясын немесе G-code бағдарламасын дайындайды.</li>
              <li><b>2.</b> CNC бағдарламаны қабылдап, осьтер мен лазер режимін есептейді.</li>
              <li><b>3.</b> PLC қауіпсіздік, газ, суыту және дайындық шарттарын тексереді.</li>
              <li><b>4.</b> Осьтер бастапқы немесе жұмыс координатасына келеді.</li>
            </ul>
          </div>
          <div>
            <ul class="pres-points-list">
              <li><b>5.</b> Кесу басы қажетті биіктікке және орынға жақындайды.</li>
              <li><b>6.</b> Лазер, газ және фокус бір қажетті күйге орнатылады.</li>
              <li><b>7.</b> CNC траекторияны орындайды, қозғалыс пен қуат синхрондалады.</li>
              <li><b>8.</b> Қауіпсіздік және ақау мониторингі циклдің соңына дейін жұмыс істейді.</li>
            </ul>
          </div>
        </div>
        <p>Балалық кезеңде бағдарлама қозғалыс, технология, кері байланыс және қауіпсіздік модульдерін біріктіріп жұмыс істейді. Кесу аяқталғаннан кейін система қауіпсіз күйге, тоқтау, дабыл, алдыңғы күйге қайта оралу немесе дайындық күйіне өтеді.</p>
      `
    },
    {
      tag: '12 — ҚОРЫТЫНДЫ',
      heading: 'Автоматтандыру жүйесі — біртұтас өңдеу және бақылау тізбегі',
      camera: 'overview',
      body: `
        <div class="pres-highlight-box">
          <b>Қорытынды логика:</b> бағдарлама → басқару → қозғалыс → материалды өңдеу → кері байланыс → бақылау → түзету.
        </div>
        <div class="pres-flow-row">
          <span>CNC</span><span>→</span><span>PLC</span><span>→</span><span>Servo</span><span>→</span><span>Ось</span><span>→</span><span>Лазер</span>
        </div>
        <div class="pres-flow-row">
          <span>Encoder</span><span>→</span><span>Feedback</span><span>→</span><span>Controller</span><span>→</span><span>Optimization</span>
        </div>
        <ul class="pres-points-list">
          <li>CNC — траектория және технологиялық тапсырманы қалыптастырады.</li>
          <li>PLC — қорғаныс, дайындық, клапандар, құрылғылар және логикалық блокировкаларды басқарады.</li>
          <li>Servo — дәл қозғалыс пен позицияны іске асырады.</li>
          <li>Encoder — нақты орын мен қате туралы ақпарат береді.</li>
          <li>Лазер, газ, биіктік және температура жүйелері материалды өңдеудің сапасын сақтайды.</li>
        </ul>
        <div class="pres-short-desc">Нәтижесінде лазерлік CNC станогы — тек механикалық станок емес, бірнеше басқару, сенсор және технологиялық жүйелерден тұратын толық автоматтандырылған өндірістік құрылым.</div>
      `
    }
  ],

  currentIndex: 0,
  totalSlides: 0,

  init() {
    this.totalSlides = this.slides.length;
    this.buildJumpGrid();
    this.renderCurrentSlide();
  },

  buildJumpGrid() {
    const grid = document.getElementById('jump-pills-grid');
    if (!grid) return;

    grid.innerHTML = this.slides.map((slide, index) => `
      <button class="jump-pill-btn ${index === this.currentIndex ? 'active' : ''}" data-index="${index}" type="button">
        <span class="p-num">${String(index + 1).padStart(2, '0')}</span>
        <span class="p-title">${slide.heading}</span>
      </button>
    `).join('');

    grid.querySelectorAll('.jump-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.index);
        this.goToSlide(idx + 1);
      });
    });
  },

  syncJumpPills() {
    const grid = document.getElementById('jump-pills-grid');
    if (!grid) return;

    grid.querySelectorAll('.jump-pill-btn').forEach((btn, idx) => {
      btn.classList.toggle('active', idx === this.currentIndex);
    });
  },

  renderCurrentSlide() {
    const slide = this.slides[this.currentIndex];
    if (!slide) return;

    const tagEl = document.getElementById('pres-section-tag');
    const headingEl = document.getElementById('pres-heading');
    const bodyEl = document.getElementById('pres-body');
    const counterEl = document.getElementById('pres-slide-counter');
    const progressEl = document.getElementById('pres-progress-fill');

    if (tagEl) tagEl.textContent = slide.tag;
    if (headingEl) headingEl.textContent = slide.heading;
    if (bodyEl) bodyEl.innerHTML = slide.body;

    if (counterEl) {
      counterEl.textContent = `СЛАЙД ${String(this.currentIndex + 1).padStart(2, '0')} / ${String(this.totalSlides).padStart(2, '0')}`;
    }

    if (progressEl) {
      const progress = ((this.currentIndex + 1) / this.totalSlides) * 100;
      progressEl.style.width = `${progress}%`;
    }

    this.syncJumpPills();

    if (window.CameraController && slide.camera) {
      CameraController.flyTo(slide.camera, 1.2);
    }
  },

  nextSlide() {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex += 1;
      this.renderCurrentSlide();
    }
  },

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.renderCurrentSlide();
    }
  },

  goToSlide(index) {
    const safeIndex = Math.max(1, Math.min(index, this.totalSlides));
    this.currentIndex = safeIndex - 1;
    this.renderCurrentSlide();
  }
};

window.presentationApp = presentationApp;

