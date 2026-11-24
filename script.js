
/* =========================================
   1. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
========================================= */

document.addEventListener('DOMContentLoaded', () => {

  const tabButtons = document.querySelectorAll('.tabs__btn');
  const tabSections = document.querySelectorAll('.tab');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {

      const selectedTab = button.dataset.tab;

      tabButtons.forEach(item => {
        item.classList.remove('tabs__btn--active');
      });

      tabSections.forEach(section => {
        section.classList.remove('tab--active');
      });

      button.classList.add('tabs__btn--active');

      const target = document.getElementById(`tab-${selectedTab}`);

      if (target) {
        target.classList.add('tab--active');
      }

    });
  });

});


/* =========================================
   2. КАЛЕНДАРЬ ТРЕНИРОВОК
========================================= */

const calendarGrid = document.getElementById('calendarGrid');
const calendarMonth = document.getElementById('calendarMonth');
const selectedDateTitle = document.getElementById('selectedDateTitle');
const calendarStatus = document.getElementById('calendarStatus');

const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

const calendarKey = 'pinkFitnessCalendar';

let calendarDate = new Date();
let selectedDate = getLocalDateString(new Date());

const workoutNames = {
  A: 'День A — Ягодицы',
  B: 'День B — Ноги и ягодицы',
  C: 'День C — Верх тела',
  rest: 'Отдых'
};

const workoutMarks = {
  A: '🍑',
  B: '💗',
  C: '💜',
  rest: '🌿'
};

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function loadCalendarData() {
  try {
    return JSON.parse(localStorage.getItem(calendarKey)) || {};
  } catch (error) {
    console.error('Ошибка загрузки календаря:', error);
    return {};
  }
}

let calendarData = loadCalendarData();

function saveCalendarData() {
  localStorage.setItem(calendarKey, JSON.stringify(calendarData));
}

function updateCalendarEditor() {
  if (!selectedDateTitle || !calendarStatus) return;

  const [year, month, day] = selectedDate.split('-');

  selectedDateTitle.textContent =
    `Выбрана дата: ${day}.${month}.${year}`;

  const workout = calendarData[selectedDate];

  calendarStatus.textContent = workout
    ? `Отмечено: ${workoutNames[workout]}`
    : 'Пока ничего не отмечено. Выбери тренировку ниже.';

  document.querySelectorAll('.calendar-option').forEach(button => {
    const isActive = button.dataset.workout === workout;

    button.classList.toggle('calendar-option--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function renderCalendar() {
  if (!calendarGrid || !calendarMonth) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  });

  calendarMonth.textContent =
    monthName.charAt(0).toUpperCase() + monthName.slice(1);

  calendarGrid.innerHTML = '';

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day calendar-day--empty';
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateString = getLocalDateString(date);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    button.dataset.date = dateString;

    const workout = calendarData[dateString];

    if (workout) {
      button.classList.add(`calendar-day--${workout}`);
    }

    if (dateString === selectedDate) {
      button.classList.add('calendar-day--selected');
    }

    if (dateString === getLocalDateString(new Date())) {
      button.classList.add('calendar-day--today');
    }

    const number = document.createElement('span');
    number.textContent = day;
    button.appendChild(number);

    if (workout) {
      const mark = document.createElement('span');
      mark.className = 'calendar-day__mark';
      mark.textContent = workoutMarks[workout];
      button.appendChild(mark);
    }

    calendarGrid.appendChild(button);
  }

  updateCalendarEditor();
}


/* =========================================
   3. ВЫБОР ДАТЫ
========================================= */

if (calendarGrid) {
  calendarGrid.addEventListener('click', event => {

    const dayButton = event.target.closest('[data-date]');

    if (!dayButton) return;

    selectedDate = dayButton.dataset.date;

    renderCalendar();

  });
}


/* =========================================
   4. ВЫБОР ТРЕНИРОВКИ
========================================= */

document.querySelectorAll('.calendar-option').forEach(button => {

  button.addEventListener('click', () => {

    const workout = button.dataset.workout;

    if (workout === 'none') {
      delete calendarData[selectedDate];
    } else if (['A', 'B', 'C', 'rest'].includes(workout)) {
      calendarData[selectedDate] = workout;
    } else {
      return;
    }

    saveCalendarData();
    renderCalendar();

  });

});


/* =========================================
   5. ПЕРЕКЛЮЧЕНИЕ МЕСЯЦЕВ
========================================= */

if (prevMonthBtn) {
  prevMonthBtn.addEventListener('click', () => {

    calendarDate = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() - 1,
      1
    );

    renderCalendar();

  });
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener('click', () => {

    calendarDate = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth() + 1,
      1
    );

    renderCalendar();

  });
}


/* =========================================
   6. ЗАПУСК КАЛЕНДАРЯ
========================================= */

renderCalendar();

/* =========================================
   7. ДНЕВНИК ПИТАНИЯ
========================================= */

const foodName = document.getElementById('foodName');
const foodCal = document.getElementById('foodCal');
const foodProt = document.getElementById('foodProt');

const addFoodBtn = document.getElementById('addFoodBtn');
const foodList = document.getElementById('foodList');

const calTotal = document.getElementById('calTotal');
const protTotal = document.getElementById('protTotal');

const calBar = document.getElementById('calBar');
const protBar = document.getElementById('protBar');

const foodCount = document.getElementById('foodCount');
const resetDayBtn = document.getElementById('resetDayBtn');

const foodStorageKey = 'pinkFitnessFood';

const calorieGoal = 2100;
const proteinGoal = 90;

function getTodayKey() {
  return new Date().toLocaleDateString('sv-SE');
}

function loadFood() {
  try {
    const saved = JSON.parse(localStorage.getItem(foodStorageKey)) || {};
    return saved[getTodayKey()] || [];
  } catch (error) {
    console.error('Ошибка загрузки питания:', error);
    return [];
  }
}

let foodData = loadFood();

function saveFood() {
  const allFood = JSON.parse(localStorage.getItem(foodStorageKey) || '{}');

  allFood[getTodayKey()] = foodData;

  localStorage.setItem(foodStorageKey, JSON.stringify(allFood));
}

function renderFood() {
  if (!foodList) return;

  foodList.innerHTML = '';

  let totalCalories = 0;
  let totalProtein = 0;

  foodData.forEach((food, index) => {
    totalCalories += food.calories;
    totalProtein += food.protein;

    const item = document.createElement('div');
    item.className = 'food-entry';

    const info = document.createElement('div');

    const name = document.createElement('strong');
    name.textContent = food.name;

    const details = document.createElement('p');
    details.textContent =
      `${food.calories} ккал · Белок: ${food.protein} г`;

    info.appendChild(name);
    info.appendChild(details);

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '✕';
    removeButton.className = 'food-remove';
    removeButton.setAttribute('aria-label', 'Удалить продукт');

    removeButton.addEventListener('click', () => {
      foodData.splice(index, 1);
      saveFood();
      renderFood();
    });

    item.appendChild(info);
    item.appendChild(removeButton);

    foodList.appendChild(item);
  });

  if (foodData.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'note';
    empty.textContent = 'Пока пусто. Добавь первый продукт.';
    foodList.appendChild(empty);
  }

  calTotal.textContent =
    `${totalCalories} / ${calorieGoal} ккал`;

  protTotal.textContent =
    `${totalProtein} / ${proteinGoal} г`;

  calBar.style.width =
    `${Math.min(totalCalories / calorieGoal * 100, 100)}%`;

  protBar.style.width =
    `${Math.min(totalProtein / proteinGoal * 100, 100)}%`;

  if (foodCount) {
    foodCount.textContent = foodData.length;
  }
}

if (addFoodBtn) {
  addFoodBtn.addEventListener('click', () => {

    const name = foodName.value.trim();
    const calories = Number(foodCal.value);
    const protein = Number(foodProt.value);

    if (!name) {
      alert('Напиши название продукта.');
      foodName.focus();
      return;
    }

    if (
      foodCal.value.trim() === '' ||
      foodProt.value.trim() === '' ||
      !Number.isFinite(calories) ||
      !Number.isFinite(protein) ||
      calories < 0 ||
      protein < 0
    ) {
      alert('Укажи корректное количество калорий и белка.');
      return;
    }

    foodData.push({
      name: name,
      calories: calories,
      protein: protein
    });

    saveFood();
    renderFood();

    foodName.value = '';
    foodCal.value = '';
    foodProt.value = '';

    foodName.focus();

  });
}

if (resetDayBtn) {
  resetDayBtn.addEventListener('click', () => {

    if (!confirm('Удалить все продукты за сегодня?')) return;

    foodData = [];
    saveFood();
    renderFood();

  });
}

renderFood();

