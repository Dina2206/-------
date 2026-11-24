
/* ============================================
   ТАЙМЕР ТРЕНИРОВОК
   ============================================ */

const overlay = document.getElementById('timerOverlay');
const timerTitle = document.getElementById('timerTitle');
const timerPhase = document.getElementById('timerPhase');
const timerBig = document.getElementById('timerBig');
const timerUnit = document.getElementById('timerUnit');
const timerRing = document.getElementById('timerRing');
const timerNum = document.getElementById('timerNum');

const btnPause = document.getElementById('btnPause');
const btnPlus = document.getElementById('btnPlus');
const btnSkip = document.getElementById('btnSkip');
const soundToggle = document.getElementById('soundToggle');

const circumference = 552.9;

let interval = null;
let remaining = 0;
let total = 0;

let phase = 'idle';
let paused = false;
let soundEnabled = true;

let currentSet = 1;
let totalSets = 1;


/* ============================================
   ЗВУКОВОЙ СИГНАЛ
   ============================================ */

function playBeep(frequency = 700) {

  if (!soundEnabled) return;

  try {
    const AudioCtx =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) return;

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.frequency.value = frequency;

    oscillator.connect(gain);
    gain.connect(context.destination);

    gain.gain.setValueAtTime(0.15, context.currentTime);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);

    oscillator.onended = () => context.close();

  } catch (error) {
    console.warn('Не удалось воспроизвести звук', error);
  }
}


/* ============================================
   ОБНОВЛЕНИЕ ТАЙМЕРА НА ЭКРАНЕ
   ============================================ */

function updateDisplay() {

  timerBig.textContent = remaining;

  timerUnit.textContent = 'секунд';

  const progress = total > 0
    ? (total - remaining) / total
    : 0;

  timerRing.style.strokeDashoffset =
    circumference * progress;

  timerNum.classList.toggle(
    'timer__num--warning',
    phase === 'work' && remaining <= 3
  );

  if (phase === 'work') {
    timerTitle.textContent =
      `${timerExerciseName} · Подход ${currentSet} из ${totalSets}`;
  }
}

let timerExerciseName = '';


/* ============================================
   ЗАПУСК ЭТАПА
   ============================================ */

function startPhase(name, seconds) {

  clearInterval(interval);

  phase = name;
  remaining = seconds;
  total = seconds;
  paused = false;

  const phases = {
    prep: 'Приготовься',
    work: 'Выполнение упражнения',
    rest: 'Отдых'
  };

  timerPhase.textContent = phases[name];

  btnPause.textContent = '⏸ Пауза';

  updateDisplay();

  interval = setInterval(() => {

    if (paused) return;

    remaining--;

    // Звуковое предупреждение за 3 секунды
    if (phase === 'work' && remaining === 3) {
      playBeep(900);
    }

    if (remaining <= 0) {

      if (phase === 'prep') {

        playBeep(750);
        startPhase('work', 45);
        return;
      }

      if (phase === 'work') {

        playBeep(1000);
        startPhase('rest', 60);
        return;
      }

      if (phase === 'rest') {

        if (currentSet < totalSets) {

          currentSet++;

          playBeep(750);
          startPhase('prep', 3);

        } else {

          playBeep(1000);
          closeTimer();
        }

        return;
      }
    }

    updateDisplay();

  }, 1000);
}


/* ============================================
   ОТКРЫТИЕ ТАЙМЕРА
   ============================================ */

window.startExerciseTimer = function(name, sets = 1) {

  timerExerciseName = name;

  totalSets = Math.max(1, sets);
  currentSet = 1;

  timerTitle.textContent = name;

  overlay.classList.add('timer--open');
  overlay.setAttribute('aria-hidden', 'false');

  startPhase('prep', 3);
};


/* ============================================
   ЗАКРЫТИЕ ТАЙМЕРА
   ============================================ */

function closeTimer() {

  clearInterval(interval);

  phase = 'idle';
  paused = false;

  overlay.classList.remove('timer--open');
  overlay.setAttribute('aria-hidden', 'true');
}


/* ============================================
   ПАУЗА
   ============================================ */

btnPause.addEventListener('click', () => {

  if (phase === 'idle') return;

  paused = !paused;

  btnPause.textContent = paused
    ? '▶ Продолжить'
    : '⏸ Пауза';

});


/* ============================================
   ДОБАВИТЬ 30 СЕКУНД
   ============================================ */

btnPlus.addEventListener('click', () => {

  if (phase === 'idle') return;

  remaining += 30;
  total += 30;

  updateDisplay();

});


/* ============================================
   ПРОПУСТИТЬ ЭТАП
   ============================================ */

btnSkip.addEventListener('click', () => {

  if (phase === 'prep') {

    playBeep();
    startPhase('work', 45);

  } else if (phase === 'work') {

    playBeep();
    startPhase('rest', 60);

  } else if (phase === 'rest') {

    if (currentSet < totalSets) {

      currentSet++;
      startPhase('prep', 3);

    } else {

      closeTimer();
    }
  }

});


/* ============================================
   ЗВУК ВКЛ / ВЫКЛ
   ============================================ */

soundToggle.addEventListener('click', () => {

  soundEnabled = !soundEnabled;

  soundToggle.textContent = soundEnabled
    ? '🔊'
    : '🔇';

});
