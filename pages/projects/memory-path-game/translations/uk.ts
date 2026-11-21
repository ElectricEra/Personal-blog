import type { GameTranslation } from "./en";

export const uk: GameTranslation = {
  title: "Формульний лабіринт",
  intro:
    "Запам’ятайте 16 чисел. Потім проведіть шлях літерами так, щоб їхні числа дали цільову суму.",
  memorizeLabel: "Запам’ятовувати",
  memorizeOptions: {
    60: "60 секунд",
    30: "30 секунд",
    15: "15 секунд",
    0: "Без таймера",
  },
  newBoard: "Нова дошка",
  flipNow: "Перевернути зараз",
  secondsRemaining: (seconds: number) => `${seconds} с залишилось`,
  boardHidden: "Дошку приховано",
  ready: "Готово",
  solved: (count: number) => `Розв’язано: ${count}`,
  memorizeStatus: "Запам’ятайте числа!",
  routeStatus: (start: string, end: string, target: number) =>
    `${start} → ${end} = ${target}`,
  idleStatus: "Готові грати?",
  memorizeDetail:
    "Запам’ятайте, яке число стоїть у кожній клітинці. Дошка перевернеться на літери.",
  routeDetail: (start: string, end: string, target: number) =>
    `Почніть із ${start} (зелена рамка) і закінчіть на ${end} (золота рамка). Побудуйте шлях, числа якого в сумі дають ${target}.`,
  idleDetail:
    "Натисніть «Нова дошка», щоб побачити числа. Ціль з’явиться, коли дошка перевернеться.",
  boardLabel: "Ігрова дошка 4 на 4",
  cellWithNumber: (letter: string, number: number) =>
    `Клітинка ${letter}, число ${number}`,
  cell: (letter: string) => `Клітинка ${letter}`,
  total: (sum: number, target: number) => `Сума: ${sum} / ${target}`,
  totalHidden: "Сума: —",
  path: (label: string) => `Шлях: ${label}`,
  checkPath: "Перевірити шлях",
  undo: "Скасувати",
  clearPath: "Очистити шлях",
  hideNumbers: "Сховати числа",
  showNumbers: "Показати числа",
  hint: "Лише вгору, вниз, ліворуч або праворуч. Кожну клітинку можна використати один раз. Обидва кінці входять у суму. Натисніть останню клітинку, щоб скасувати її.",
  startAt: (letter: string) => `Почніть із ${letter}.`,
  visitTwice: "Клітинку не можна відвідати двічі.",
  adjacentOnly: "Ходіть лише на сусідню клітинку.",
  endMustBeLast:
    "Кінцева клітинка має бути останньою. Скасуйте хід, щоб змінити маршрут.",
  startAtMarked: "Почніть із позначеної початкової літери.",
  endAtMarked: "Маршрут має закінчуватись на позначеній кінцевій літері.",
  wrongRoute: "Ще не те! Спробуйте змінити маршрут.",
  solvedMessage:
    "Правильно! Ви розв’язали. Натисніть «Нова дошка», щоб зіграти ще.",
  numbersRevealed: "Числа відкрито. Цей раунд більше не зараховується.",
  numbersHidden: "Числа знову приховано.",
};
