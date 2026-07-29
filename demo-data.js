/**
 * Демо-события планировщика.
 * Даты считаются относительно «сегодня», чтобы текущая неделя/месяц всегда были заполнены.
 * Подключается из index.html; при пустом localStorage вызывается buildDemoEvents().
 */
(function (global) {
  'use strict';

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function toDateStr(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function addDays(d, n) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  function dayOffset(anchor, offset) {
    return toDateStr(addDays(anchor, offset));
  }

  /**
   * @param {Date} [anchor] — опорная дата (по умолчанию сегодня)
   * @returns {object[]}
   */
  function buildDemoEvents(anchor) {
    const today = anchor ? new Date(anchor) : new Date();
    today.setHours(0, 0, 0, 0);
    const ts = new Date().toISOString();

    const templates = [
      /* —— прошедшая неделя —— */
      {
        uid: 'demo_past_standup',
        groupName: 'Работа',
        exerciseName: 'Стендап команды',
        event_date: dayOffset(today, -5),
        start_time: '09:30',
        end_time: '09:45',
        location: 'Meet',
        comment: 'Ежедневный статус',
        color: '#ebe4ff',
        status: 'done',
        repeat_type: 'none'
      },
      {
        uid: 'demo_past_run',
        groupName: 'Спорт',
        exerciseName: 'Пробежка в парке',
        event_date: dayOffset(today, -4),
        start_time: '07:00',
        end_time: '07:40',
        location: 'парк Горького',
        comment: '5 км, лёгкий темп',
        color: '#d9f8e5',
        status: 'done',
        sets: 0,
        reps: 0,
        repeat_type: 'none'
      },
      {
        uid: 'demo_past_dentist',
        groupName: 'Здоровье',
        exerciseName: 'Стоматолог',
        event_date: dayOffset(today, -3),
        start_time: '16:00',
        end_time: '17:00',
        location: 'Клиника «Дента»',
        comment: 'Профосмотр',
        color: '#ffe8df',
        status: 'done',
        repeat_type: 'none'
      },
      {
        uid: 'demo_past_allday',
        groupName: 'Личное',
        exerciseName: 'День рождения Анны',
        event_date: dayOffset(today, -2),
        start_time: '',
        end_time: '',
        is_all_day: true,
        location: '',
        comment: 'Поздравить, купить подарок',
        color: '#d9f4fb',
        status: 'done',
        repeat_type: 'yearly'
      },

      /* —— вчера / сегодня / завтра —— */
      {
        uid: 'demo_yesterday_review',
        groupName: 'Работа',
        exerciseName: 'Ревью кода',
        event_date: dayOffset(today, -1),
        start_time: '14:00',
        end_time: '15:30',
        location: 'офис / Zoom',
        comment: 'PR #248 — планировщик',
        color: '#ebe4ff',
        status: 'done',
        repeat_type: 'none'
      },
      {
        uid: 'demo_today_tasks',
        groupName: 'Прочее',
        exerciseName: 'Список покупок',
        event_date: dayOffset(today, 0),
        start_time: '',
        end_time: '',
        is_all_day: true,
        location: '',
        comment: 'Молоко, хлеб, кофе',
        color: '#e8e0ff',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_today_allday_2',
        groupName: 'Личное',
        exerciseName: 'День плотного графика (тест скролла)',
        event_date: dayOffset(today, 0),
        start_time: '',
        end_time: '',
        is_all_day: true,
        location: '',
        comment: 'Целодневная задача для шапки дня',
        color: '#d9f4fb',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_tomorrow_gym',
        groupName: 'Спорт',
        exerciseName: 'Тренажёрный зал',
        event_date: dayOffset(today, 1),
        start_time: '18:30',
        end_time: '19:45',
        location: 'World Class',
        comment: 'Ноги + кор',
        color: '#d9f8e5',
        status: 'not_started',
        sets: 4,
        reps: 12,
        repeat_type: 'weekly'
      },
      {
        uid: 'demo_tomorrow_1on1',
        groupName: 'Работа',
        exerciseName: '1:1 с руководителем',
        event_date: dayOffset(today, 1),
        start_time: '11:00',
        end_time: '11:30',
        location: 'Meet',
        comment: '',
        color: '#ebe4ff',
        status: 'not_started',
        repeat_type: 'weekly'
      },

      /* —— ближайшие дни —— */
      {
        uid: 'demo_plus2_doctor',
        groupName: 'Здоровье',
        exerciseName: 'Анализы крови',
        event_date: dayOffset(today, 2),
        start_time: '08:00',
        end_time: '08:30',
        location: 'Инвитро',
        comment: 'Натощак',
        color: '#ffe8df',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus2_movie',
        groupName: 'Личное',
        exerciseName: 'Кино с друзьями',
        event_date: dayOffset(today, 2),
        start_time: '19:40',
        end_time: '22:00',
        location: 'Каро 11',
        comment: '',
        color: '#d9f4fb',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus3_workshop',
        groupName: 'Работа',
        exerciseName: 'Воркшоп по дизайну',
        event_date: dayOffset(today, 3),
        start_time: '10:00',
        end_time: '13:00',
        location: 'коворкинг',
        comment: 'Принести ноутбук',
        color: '#ebe4ff',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus3_yoga',
        groupName: 'Спорт',
        exerciseName: 'Йога',
        event_date: dayOffset(today, 3),
        start_time: '07:30',
        end_time: '08:30',
        location: 'студия «Дыхание»',
        comment: '',
        color: '#d9f8e5',
        status: 'not_started',
        repeat_type: 'weekly'
      },
      {
        uid: 'demo_plus4_deadline',
        groupName: 'Работа',
        exerciseName: 'Дедлайн: презентация клиенту',
        event_date: dayOffset(today, 4),
        start_time: '',
        end_time: '',
        is_all_day: true,
        location: '',
        comment: 'Отправить до 18:00',
        color: '#ebe4ff',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus5_family',
        groupName: 'Личное',
        exerciseName: 'Ужин у родителей',
        event_date: dayOffset(today, 5),
        start_time: '18:00',
        end_time: '21:00',
        location: 'дома у родителей',
        comment: '',
        color: '#d9f4fb',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus6_hike',
        groupName: 'Спорт',
        exerciseName: 'Прогулка за городом',
        event_date: dayOffset(today, 6),
        start_time: '10:00',
        end_time: '15:00',
        location: 'Раифа',
        comment: 'Взять воду и перекус',
        color: '#d9f8e5',
        status: 'not_started',
        repeat_type: 'none'
      },

      /* —— дальше / custom repeat —— */
      {
        uid: 'demo_plus8_custom',
        groupName: 'Прочее',
        exerciseName: 'Полив цветов',
        event_date: dayOffset(today, 1),
        start_time: '20:00',
        end_time: '20:15',
        location: 'дома',
        comment: 'Каждые 3 дня',
        color: '#e8e0ff',
        status: 'not_started',
        repeat_type: 'custom',
        repeat_rule: {
          interval: 3,
          unit: 'day',
          weekdays: [],
          end: { type: 'never' }
        },
        instruction: ''
      },
      {
        uid: 'demo_plus10_vaccine',
        groupName: 'Здоровье',
        exerciseName: 'Прививка / ревакцинация',
        event_date: dayOffset(today, 10),
        start_time: '12:00',
        end_time: '12:30',
        location: 'поликлиника',
        comment: 'Запись подтверждена',
        color: '#ffe8df',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus14_trip',
        groupName: 'Личное',
        exerciseName: 'Командировка / выезд',
        event_date: dayOffset(today, 14),
        start_time: '',
        end_time: '',
        is_all_day: true,
        location: 'Казань → Москва',
        comment: 'Билеты в календаре почты',
        color: '#d9f4fb',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_plus14_flight',
        groupName: 'Личное',
        exerciseName: 'Вылет SU1234',
        event_date: dayOffset(today, 14),
        start_time: '06:40',
        end_time: '08:20',
        location: 'KZN',
        comment: 'Регистрация за 2 часа',
        color: '#d9f4fb',
        status: 'not_started',
        repeat_type: 'none'
      },
      {
        uid: 'demo_month_rent',
        groupName: 'Прочее',
        exerciseName: 'Оплата ЖКХ',
        event_date: dayOffset(today, 7),
        start_time: '',
        end_time: '',
        is_all_day: true,
        location: '',
        comment: 'Через приложение банка',
        color: '#e8e0ff',
        status: 'not_started',
        repeat_type: 'monthly'
      }
    ];

    /* Плотный график на весь текущий день (00:00–23:30) — тест скролла вида «День» */
    const todaySlots = [
      { h: 0,  m: 15, dur: 45, group: 'Личное',  title: 'Ночной звонок / часовой пояс', color: '#d9f4fb' },
      { h: 1,  m: 0,  dur: 50, group: 'Прочее',  title: 'Фоновая задача 01:00', color: '#e8e0ff' },
      { h: 2,  m: 10, dur: 40, group: 'Личное',  title: 'Рейс / ночной трансфер', color: '#d9f4fb' },
      { h: 3,  m: 0,  dur: 45, group: 'Прочее',  title: 'Слот 03:00', color: '#e8e0ff' },
      { h: 4,  m: 20, dur: 40, group: 'Здоровье', title: 'Ранний подъём / вода', color: '#ffe8df' },
      { h: 5,  m: 0,  dur: 30, group: 'Спорт',   title: 'Зарядка', color: '#d9f8e5' },
      { h: 5,  m: 45, dur: 40, group: 'Личное',  title: 'Завтрак', color: '#d9f4fb' },
      { h: 6,  m: 30, dur: 45, group: 'Работа',  title: 'Почта и планирование дня', color: '#ebe4ff' },
      { h: 7,  m: 30, dur: 50, group: 'Работа',  title: 'Дорога / вход в офис', color: '#ebe4ff' },
      { h: 8,  m: 30, dur: 55, group: 'Работа',  title: 'Стендап', color: '#ebe4ff' },
      { h: 9,  m: 0,  dur: 180, group: 'Работа',  title: 'Глубокая работа: модуль A (3 ч)', color: '#ebe4ff' },
      { h: 12, m: 20, dur: 50, group: 'Личное',  title: 'Обед', color: '#d9f4fb' },
      { h: 13, m: 20, dur: 50, group: 'Работа',  title: 'Короткий синк', color: '#ebe4ff' },
      { h: 14, m: 30, dur: 120, group: 'Работа',  title: 'Воркшоп с командой (2 ч)', color: '#ebe4ff' },
      { h: 17, m: 0,  dur: 45, group: 'Спорт',   title: 'Прогулка / разминка', color: '#d9f8e5' },
      { h: 18, m: 0,  dur: 120, group: 'Спорт',   title: 'Тренажёрный зал (2 ч)', color: '#d9f8e5' },
      { h: 20, m: 30, dur: 50, group: 'Личное',  title: 'Ужин', color: '#d9f4fb' },
      { h: 21, m: 30, dur: 45, group: 'Прочее',  title: 'Чтение / учёба', color: '#e8e0ff' },
      { h: 22, m: 30, dur: 40, group: 'Здоровье', title: 'Растяжка перед сном', color: '#ffe8df' },
      { h: 23, m: 15, dur: 40, group: 'Личное',  title: 'Подготовка ко сну', color: '#d9f4fb' }
    ];

    todaySlots.forEach(function (s, i) {
      const startMins = s.h * 60 + s.m;
      const endMins = Math.min(startMins + s.dur, 24 * 60 - 1);
      templates.push({
        uid: 'demo_today_slot_' + i,
        groupName: s.group,
        exerciseName: s.title,
        event_date: dayOffset(today, 0),
        start_time: pad(s.h) + ':' + pad(s.m),
        end_time: pad(Math.floor(endMins / 60)) + ':' + pad(endMins % 60),
        location: '',
        comment: 'Демо-слот для проверки скролла',
        color: s.color,
        status: 'not_started',
        repeat_type: 'none'
      });
    });

    return templates.map(function (t) {
      return Object.assign({
        sets: 0,
        reps: 0,
        instruction: '',
        status: 'not_started',
        start_time: '',
        end_time: '',
        location: '',
        comment: '',
        color: '',
        is_all_day: false,
        repeat_type: 'none',
        repeat_rule: null,
        last_modified: ts,
        is_deleted: false
      }, t);
    });
  }

  global.buildDemoEvents = buildDemoEvents;
  global.DEMO_DATA_VERSION = 3;
})(typeof window !== 'undefined' ? window : this);
