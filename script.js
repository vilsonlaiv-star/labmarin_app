// ============================================
// СОСТОЯНИЕ
// ============================================
let state = {
    step: 1,
    totalSteps: 50,
    isProfile: false,
    points: {},
    imageLoaded: false,
    isDragging: false,
    mode: 'menu'
};

// ============================================
// ПОДКЛЮЧЕНИЕ К TELEGRAM
// ============================================
let tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); }

// ============================================
// DOM ЭЛЕМЕНТЫ
// ============================================
const mainMenu = document.getElementById('mainMenu');
const analysisMode = document.getElementById('analysisMode');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');
const historyBtn = document.getElementById('historyBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mainImage = document.getElementById('mainImage');
const wrapper = document.getElementById('photoWrapper');
const zoomContainer = document.getElementById('zoomContainer');
const uploadArea = document.getElementById('uploadArea');
const pointName = document.getElementById('pointName');
const stepDesc = document.getElementById('stepDesc');
const tipBtn = document.getElementById('tipBtn');
const confirmBtn = document.getElementById('confirmBtn');
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const sendBtn = document.getElementById('sendBtn');
const controls = document.getElementById('controls');
const nav = document.getElementById('nav');

const tipModal = document.getElementById('tipModal');
const tipText = document.getElementById('tipText');
const tipPhoto = document.getElementById('tipPhoto');
const closeTip = document.getElementById('closeTip');

// ============================================
// ПЕРЕКЛЮЧЕНИЕ МЕНЮ
// ============================================
function showMenu() {
    mainMenu.classList.remove('hidden');
    analysisMode.classList.add('hidden');
    state.mode = 'menu';
    updateLastAnalysis();
}
function showAnalysis() {
    mainMenu.classList.add('hidden');
    analysisMode.classList.remove('hidden');
    state.mode = 'analysis';
}
newAnalysisBtn.addEventListener('click', showAnalysis);
backToMenuBtn.addEventListener('click', showMenu);

// ============================================
// ОБНОВЛЕНИЕ ПОСЛЕДНЕГО АНАЛИЗА
// ============================================
function updateLastAnalysis() {
    const lastDate = document.getElementById('lastDate');
    const lastScore = document.getElementById('lastScore');
    const lastTypes = document.getElementById('lastTypes');
    lastDate.textContent = 'Нет данных';
    lastScore.innerHTML = '— <span>/ 10</span>';
    lastTypes.innerHTML = 'Анфас <span class="ok">⬜</span> Профиль <span class="ok">⬜</span>';
}

// ============================================
// РАЗМЕРЫ КАНВАСА
// ============================================
function resizeCanvas() {
    const rect = wrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawPoints();
}

// ============================================
// АВТО-РАССТАНОВКА ТОЧЕК (УПРОЩЁННАЯ)
// ============================================
function autoPlacePoint(step) {
    const w = canvas.width;
    const h = canvas.height;
    // Базовые пропорции лица (усреднённые)
    const basePoints = {
        1: [w*0.50, h*0.08],  // линия роста волос
        2: [w*0.22, h*0.20],  // левый висок
        3: [w*0.78, h*0.20],  // правый висок
        4: [w*0.50, h*0.22],  // глабелла
        5: [w*0.32, h*0.28],  // левая бровь начало
        6: [w*0.38, h*0.26],  // левая бровь внутр
        7: [w*0.44, h*0.24],  // левая бровь арка
        8: [w*0.50, h*0.24],  // левая бровь пик
        9: [w*0.56, h*0.26],  // левая бровь хвост
        10: [w*0.68, h*0.28], // правая бровь начало
        11: [w*0.62, h*0.26], // правая бровь внутр
        12: [w*0.56, h*0.24], // правая бровь арка
        13: [w*0.50, h*0.24], // правая бровь пик
        14: [w*0.44, h*0.26], // правая бровь хвост
        15: [w*0.38, h*0.36], // левый зрачок
        16: [w*0.62, h*0.36], // правый зрачок
        17: [w*0.32, h*0.36], // левый внутр угол глаза
        18: [w*0.44, h*0.34], // левый внешний угол
        19: [w*0.38, h*0.32], // левое верхнее веко
        20: [w*0.38, h*0.40], // левое нижнее веко
        21: [w*0.68, h*0.36], // правый внутр угол
        22: [w*0.56, h*0.34], // правый внешний угол
        23: [w*0.62, h*0.32], // правое верхнее веко
        24: [w*0.62, h*0.40], // правое нижнее веко
        25: [w*0.50, h*0.30], // назион
        26: [w*0.44, h*0.32], // левый край переносицы
        27: [w*0.56, h*0.32], // правый край переносицы
        28: [w*0.50, h*0.52], // субназале
        29: [w*0.44, h*0.48], // левое крыло носа
        30: [w*0.56, h*0.48], // правое крыло носа
        31: [w*0.50, h*0.46], // кончик носа
        32: [w*0.50, h*0.58], // пик лука купидона
        33: [w*0.50, h*0.60], // впадина лука купидона
        34: [w*0.50, h*0.62], // центр рта
        35: [w*0.42, h*0.62], // левый угол рта
        36: [w*0.58, h*0.62], // правый угол рта
        37: [w*0.50, h*0.66], // центр нижней губы
        38: [w*0.38, h*0.76], // левая точка подбородка
        39: [w*0.62, h*0.76], // правая точка подбородка
        40: [w*0.50, h*0.80], // низ подбородка
        41: [w*0.28, h*0.44], // левая скула
        42: [w*0.72, h*0.44], // правая скула
        43: [w*0.12, h*0.40], // левое ухо
        44: [w*0.88, h*0.40], // правое ухо
        45: [w*0.24, h*0.64], // левый гонион верх
        46: [w*0.24, h*0.70], // левый гонион низ
        47: [w*0.76, h*0.64], // правый гонион верх
        48: [w*0.76, h*0.70], // правый гонион низ
        49: [w*0.28, h*0.88], // левая точка шеи
        50: [w*0.72, h*0.88], // правая точка шеи
    };
    return basePoints[step] || [w*0.50, h*0.50];
}

// ============================================
// ОТРИСОВКА ТОЧЕК (МАЛЕНЬКИЕ, 6px)
// ============================================
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.imageLoaded) return;

    const pointKey = getCurrentPointKey();
    const pos = state.points[pointKey];

    if (pos) {
        const [x, y] = pos;
        // Точка — маленький красный кружок 6px
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3333';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
        // Обводка для контраста
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    } else {
        // Если точки нет — рисуем призрак (серый пунктир)
        const autoPos = autoPlacePoint(state.step);
        ctx.beginPath();
        ctx.arc(autoPos[0], autoPos[1], 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = '#999';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👆 Перетащи', autoPos[0], autoPos[1] - 18);
    }
}

function getCurrentPointKey() {
    const names = getPointNames();
    return names[state.step - 1] || `point_${state.step}`;
}

function getPointNames() {
    return [
        "линия_роста_волос", "левый_висок", "правый_висок", "глабелла",
        "левая_бровь_начало", "левая_бровь_внутренний_угол", "левая_бровь_арка",
        "левая_бровь_пик", "левая_бровь_хвост", "правая_бровь_начало",
        "правая_бровь_внутренний_угол", "правая_бровь_арка", "правая_бровь_пик",
        "правая_бровь_хвост", "левый_зрачок", "правый_зрачок",
        "левый_внутренний_угол_глаза", "левый_внешний_угол_глаза",
        "левое_верхнее_веко", "левое_нижнее_веко",
        "правый_внутренний_угол_глаза", "правый_внешний_угол_глаза",
        "правое_верхнее_веко", "правое_нижнее_веко",
        "назион", "левый_край_переносицы", "правый_край_переносицы",
        "субназале", "левое_крыло_носа", "правое_крыло_носа",
        "кончик_носа", "пик_лука_купидона", "впадина_лука_купидона",
        "центр_рта", "левый_угол_рта", "правый_угол_рта",
        "центр_нижней_губы", "левая_точка_подбородка", "правая_точка_подбородка",
        "низ_подбородка", "левая_скула", "правая_скула",
        "левое_ухо", "правое_ухо", "левый_гонион_верх", "левый_гонион_низ",
        "правый_гонион_верх", "правый_гонион_низ", "левая_точка_шеи", "правая_точка_шеи"
    ];
}

// ============================================
// ЗАГРУЗКА ФОТО + АВТО-РАССТАНОВКА
// ============================================
function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        mainImage.src = e.target.result;
        mainImage.onload = () => {
            state.imageLoaded = true;
            uploadArea.style.display = 'none';
            mainImage.style.display = 'block';
            canvas.style.display = 'block';
            controls.style.display = 'flex';
            nav.style.display = 'flex';

            // === АВТО-РАССТАНОВКА ТОЧЕК ===
            const names = getPointNames();
            for (let i = 0; i < names.length; i++) {
                const key = names[i];
                if (!state.points[key]) {
                    const autoPos = autoPlacePoint(i + 1);
                    state.points[key] = autoPos;
                }
            }

            resizeCanvas();
            updateUI();
        };
    };
    reader.readAsDataURL(file);
}

// ============================================
// ЗАГРУЗКА ЧЕРЕЗ КЛИК
// ============================================
uploadArea.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        if (e.target.files[0]) {
            loadImage(e.target.files[0]);
        }
    };
    input.click();
});

// ============================================
// ОБНОВЛЕНИЕ UI
// ============================================
function updateUI() {
    const names = getPointNames();
    const currentName = names[state.step - 1] || `Точка ${state.step}`;
    pointName.textContent = currentName.replace(/_/g, ' ').toUpperCase();
    stepDesc.textContent = `Шаг ${state.step} из ${state.totalSteps}`;

    backBtn.disabled = state.step === 1;
    nextBtn.textContent = state.step === state.totalSteps ? '🏁 Финиш' : 'Далее ▶️';

    const allPoints = names.every(name => state.points[name]);
    sendBtn.disabled = !allPoints;
    sendBtn.style.display = allPoints ? 'block' : 'none';

    drawPoints();
}

// ============================================
// ПЕРЕТАСКИВАНИЕ ТОЧЕК
// ============================================
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function onPointerDown(e) {
    if (!state.imageLoaded) return;
    const pos = getPos(e);
    state.isDragging = true;
    const pointKey = getCurrentPointKey();
    state.points[pointKey] = [pos.x, pos.y];
    drawPoints();
}

function onPointerMove(e) {
    if (!state.isDragging || !state.imageLoaded) return;
    const pos = getPos(e);
    const pointKey = getCurrentPointKey();
    state.points[pointKey] = [pos.x, pos.y];
    drawPoints();
}

function onPointerUp() {
    state.isDragging = false;
    drawPoints();
}

canvas.addEventListener('mousedown', onPointerDown);
canvas.addEventListener('mousemove', onPointerMove);
canvas.addEventListener('mouseup', onPointerUp);
canvas.addEventListener('mouseleave', onPointerUp);
canvas.addEventListener('touchstart', onPointerDown);
canvas.addEventListener('touchmove', onPointerMove);
canvas.addEventListener('touchend', onPointerUp);
canvas.addEventListener('touchcancel', onPointerUp);

// ============================================
// КНОПКИ
// ============================================

// Подсказка (упрощённая)
tipBtn.addEventListener('click', () => {
    tipText.textContent = '🔍 Найди точку на фото и перетащи её в нужное место.';
    tipPhoto.style.display = 'none';
    tipModal.classList.add('active');
});
closeTip.addEventListener('click', () => {
    tipModal.classList.remove('active');
});

// Подтвердить точку
confirmBtn.addEventListener('click', () => {
    const pointKey = getCurrentPointKey();
    if (!state.points[pointKey]) {
        state.points[pointKey] = autoPlacePoint(state.step);
        drawPoints();
    }
    if (state.step < state.totalSteps) {
        state.step++;
        updateUI();
    }
});

// Назад
backBtn.addEventListener('click', () => {
    if (state.step > 1) {
        state.step--;
        updateUI();
    }
});

// Далее
nextBtn.addEventListener('click', () => {
    const pointKey = getCurrentPointKey();
    if (!state.points[pointKey]) {
        alert('⚠️ Сначала отметь точку!');
        return;
    }
    if (state.step < state.totalSteps) {
        state.step++;
        updateUI();
    } else {
        sendResultsToBot();
    }
});

// ============================================
// О      
