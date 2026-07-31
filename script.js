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
    mode: 'menu' // 'menu' | 'analysis'
};

// ============================================
// ПОДКЛЮЧЕНИЕ К TELEGRAM WEB APP
// ============================================
let tg = window.Telegram?.WebApp || null;
if (tg) {
    tg.ready();
    tg.expand();
}

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
const container = document.getElementById('photoContainer');
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
// ПЕРЕКЛЮЧЕНИЕ МЕЖДУ МЕНЮ И АНАЛИЗОМ
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

    // Проверяем, есть ли данные в Telegram Web App
    if (tg && tg.initDataUnsafe?.user) {
        // Здесь можно подгрузить данные из бота
        // Пока показываем заглушку
    }

    // Заглушка — пока нет данных
    lastDate.textContent = 'Нет данных';
    lastScore.innerHTML = '— <span>/ 10</span>';
    lastTypes.innerHTML = 'Анфас <span class="ok">⬜</span> Профиль <span class="ok">⬜</span>';
}

// ============================================
// РАЗМЕРЫ КАНВАСА
// ============================================
function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    drawPoints();
}

// ============================================
// ОТРИСОВКА ТОЧЕК
// ============================================
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.imageLoaded) return;

    const pointKey = getCurrentPointKey();
    if (state.points[pointKey]) {
        const [x, y] = state.points[pointKey];
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 50, 50, 0.85)';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    } else {
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = '#999';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Перетащи точку', canvas.width/2, canvas.height/2 - 24);
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
// ПОДСКАЗКИ
// ============================================
const tips = {
    1: { text: "🔍 Линия роста волос (Трихион)\n\nСамая высокая точка линии роста волос по центру лба.", photo: "" },
    2: { text: "🔍 Левый висок\n\nТочка на левом виске, где заканчивается лобная кость.", photo: "" },
    3: { text: "🔍 Правый висок\n\nТочка на правом виске, где заканчивается лобная кость.", photo: "" },
    4: { text: "🔍 Глабелла\n\nТочка между бровями, над переносицей.", photo: "" },
    5: { text: "🔍 Левая бровь — начало\n\nВнутренний край левой брови у переносицы.", photo: "" },
    6: { text: "🔍 Левая бровь — внутренний угол\n\nЦентральная точка левой брови у переносицы.", photo: "" },
    7: { text: "🔍 Левая бровь — арка\n\nСамая высокая точка левой брови.", photo: "" },
    8: { text: "🔍 Левая бровь — пик\n\nВершина левой брови.", photo: "" },
    9: { text: "🔍 Левая бровь — хвост\n\nВнешний край левой брови.", photo: "" },
    10: { text: "🔍 Правая бровь — начало\n\nВнутренний край правой брови у переносицы.", photo: "" },
    11: { text: "🔍 Правая бровь — внутренний угол\n\nЦентральная точка правой брови у переносицы.", photo: "" },
    12: { text: "🔍 Правая бровь — арка\n\nСамая высокая точка правой брови.", photo: "" },
    13: { text: "🔍 Правая бровь — пик\n\nВершина правой брови.", photo: "" },
    14: { text: "🔍 Правая бровь — хвост\n\nВнешний край правой брови.", photo: "" },
    15: { text: "🔍 Левый зрачок\n\nЦентр левого глаза.", photo: "" },
    16: { text: "🔍 Правый зрачок\n\nЦентр правого глаза.", photo: "" },
    17: { text: "🔍 Левый внутренний угол глаза\n\nУгол левого глаза у переносицы.", photo: "" },
    18: { text: "🔍 Левый внешний угол глаза\n\nВнешний угол левого глаза.", photo: "" },
    19: { text: "🔍 Левое верхнее веко\n\nСамая высокая точка верхнего века левого глаза.", photo: "" },
    20: { text: "🔍 Левое нижнее веко\n\nСамая низкая точка нижнего века левого глаза.", photo: "" },
    21: { text: "🔍 Правый внутренний угол глаза\n\nУгол правого глаза у переносицы.", photo: "" },
    22: { text: "🔍 Правый внешний угол глаза\n\nВнешний угол правого глаза.", photo: "" },
    23: { text: "🔍 Правое верхнее веко\n\nСамая высокая точка верхнего века правого глаза.", photo: "" },
    24: { text: "🔍 Правое нижнее веко\n\nСамая низкая точка нижнего века правого глаза.", photo: "" },
    25: { text: "🔍 Назион\n\nВерхняя точка переносицы.", photo: "" },
    26: { text: "🔍 Левый край переносицы\n\nЛевый край переносицы.", photo: "" },
    27: { text: "🔍 Правый край переносицы\n\nПравый край переносицы.", photo: "" },
    28: { text: "🔍 Субназале\n\nОснование носа.", photo: "" },
    29: { text: "🔍 Левое крыло носа\n\nЛевое крыло носа.", photo: "" },
    30: { text: "🔍 Правое крыло носа\n\nПравое крыло носа.", photo: "" },
    31: { text: "🔍 Кончик носа\n\nСамая выступающая точка носа.", photo: "" },
    32: { text: "🔍 Пик лука Купидона\n\nЦентральная точка верхней губы.", photo: "" },
    33: { text: "🔍 Впадина лука Купидона\n\nВыемка между верхней и нижней губой.", photo: "" },
    34: { text: "🔍 Центр рта\n\nЦентральная точка рта.", photo: "" },
    35: { text: "🔍 Левый угол рта\n\nЛевый угол рта.", photo: "" },
    36: { text: "🔍 Правый угол рта\n\nПравый угол рта.", photo: "" },
    37: { text: "🔍 Центр нижней губы\n\nЦентральная точка нижней губы.", photo: "" },
    38: { text: "🔍 Левая точка подбородка\n\nЛевая точка подбородка.", photo: "" },
    39: { text: "🔍 Правая точка подбородка\n\nПравая точка подбородка.", photo: "" },
    40: { text: "🔍 Низ подбородка\n\nСамая нижняя точка подбородка.", photo: "" },
    41: { text: "🔍 Левая скула\n\nСамая выступающая точка левой скулы.", photo: "" },
    42: { text: "🔍 Правая скула\n\nСамая выступающая точка правой скулы.", photo: "" },
    43: { text: "🔍 Левое ухо\n\nЛевое ухо.", photo: "" },
    44: { text: "🔍 Правое ухо\n\nПравое ухо.", photo: "" },
    45: { text: "🔍 Левый гонион верх\n\nВерхняя точка угла челюсти слева.", photo: "" },
    46: { text: "🔍 Левый гонион низ\n\nНижняя точка угла челюсти слева.", photo: "" },
    47: { text: "🔍 Правый гонион верх\n\nВерхняя точка угла челюсти справа.", photo: "" },
    48: { text: "🔍 Правый гонион низ\n\nНижняя точка угла челюсти справа.", photo: "" },
    49: { text: "🔍 Левая точка шеи\n\nЛевая точка шеи.", photo: "" },
    50: { text: "🔍 Правая точка шеи\n\nПравая точка шеи.", photo: "" },
};

// ============================================
// ЗАГРУЗКА ФОТО
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
    if (allPoints) {
        sendBtn.style.display = 'block';
        sendBtn.textContent = '📊 Получить результат';
    } else {
        sendBtn.style.display = 'none';
    }

    drawPoints();
}

// ============================================
// СОБЫТИЯ КАНВАСА (ПЕРЕТАСКИВАНИЕ)
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

function onPointerUp(e) {
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

// Подсказка
tipBtn.addEventListener('click', () => {
    const tip = tips[state.step] || { text: 'Подсказка не найдена', photo: '' };
    tipText.textContent = tip.text;
    if (tip.photo) {
        tipPhoto.src = tip.photo;
        tipPhoto.style.display = 'block';
    } else {
        tipPhoto.style.display = 'none';
    }
    tipModal.classList.add('active');
});

closeTip.addEventListener('click', () => {
    tipModal.classList.remove('active');
});

// Подтвердить точку
confirmBtn.addEventListener('click', () => {
    const pointKey = getCurrentPointKey();
    if (!state.points[pointKey]) {
        state.points[pointKey] = [canvas.width/2, canvas.height/2];
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
// ОТПРАВКА РЕЗУЛЬТАТОВ В БОТА
// ============================================
function sendResultsToBot() {
    if (!tg) {
        alert('❌ Не удалось подключиться к Telegram. Проверь, что открываешь приложение через бота.');
        return;
    }

    const data = {
        points: state.points,
        type: state.isProfile ? 'profile' : 'anfas',
        total: state.totalSteps
    };

    tg.sendData(JSON.stringify(data));
    tg.close();
}

sendBtn.addEventListener('click', sendResultsToBot);

// ============================================
// НИЖНЕЕ МЕНЮ
// ============================================
document.getElementById('supportBtn').addEventListener('click', () => {
    alert('🆘 Поддержка\n\nEmail: support@faceharmony.com\nTelegram: @FaceHarmonySupport');
});

document.getElementById('termsBtn').addEventListener('click', () => {
    alert('📋 Условия использования\n\n1. Бот предоставляет аналитические данные\n2. Фото не сохраняются\n3. Полный анализ — 50 ⭐️');
});

document.getElementById('privacyBtn').addEventListener('click', () => {
    alert('🔒 Конфиденциальность\n\n• Фото не хранятся\n• Данные зашифрованы\n• Не передаются третьим лицам');
});

document.getElementById('discordBtn').addEventListener('click', () => {
    alert('💬 Discord\n\nПрисоединяйся: https://discord.gg/faceharmony');
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
updateUI();
window.addEventListener('resize', resizeCanvas);
showMenu();
