import type { GameTranslation } from "./en";

const answersLeft = (count: number): string => {
  if (count === 1) {
    return "Залишилась 1 відповідь";
  }
  if (count >= 2 && count <= 4) {
    return `Залишилось ${count} відповіді`;
  }
  return `Залишилось ${count} відповідей`;
};

export const uk: GameTranslation = {
  title: "Прихований код",
  intro:
    "Приховане правило перетворює п’ять чисел на зірці на один результат. Перевірте власні розклади, а потім назвіть результат зірки-завдання.",
  modeLabel: "Режим",
  modes: {
    guided: "З підказкою",
    classic: "Класичний",
    challenge: "Виклик",
  },
  modeDetail: {
    guided:
      "Одне завдання. Проби й відповіді без обмежень. Після трьох хибних відповідей з’являється додатковий приклад. Новий набір цифр можна взяти будь-коли.",
    classic:
      "П’ять завдань, по одному очку. Проби без обмежень. Дві відповіді на завдання. Друга помилка завершує завдання. За сесію зберігаються проби, помилки й час.",
    challenge:
      "П’ять завдань. Шість проб і одна відповідь на завдання. Новий набір цифр не витрачає пробу. Ранніх прикладів немає.",
  },
  newGame: "Нове завдання",
  resign: "Здатися",
  resignPrompt: "Здатися й відкрити правило? Це завершить завдання.",
  resignYes: "Відкрити правило",
  resignNo: "Грати далі",
  controlsTitle: "Гра",
  rulesTitle: "Правила",
  startingTitle: "Початкові умови",
  rules: [
    "Одне приховане правило перетворює п’ять чисел на зірці на один результат.",
    "Зірка-завдання використовує це правило. Шукати треба її результат.",
    "На старті є п’ять цифр від 1 до 6. Поставте кожну цифру на пробну зірку.",
    "Складайте цифри в одній точці, щоб отримати більше число, або лишайте точку порожньою.",
    "Проба показує справжній результат цього розкладу. Неповна зірка не є пробою.",
    "Можна взяти новий набір із п’яти цифр. Попередні результати лишаються в історії.",
    "Відповідь — це результат зірки-завдання, а не таємний код.",
    "Правильна відповідь розв’язує завдання й відкриває правило.",
  ],
  challengeTitle: "Завдання",
  experimentTitle: "Проба",
  notesZoneTitle: "Нотатки",
  puzzleProgress: (current, total) => `Завдання ${current} з ${total}`,
  scoreLabel: (score) => `Рахунок ${score}`,
  timeLabel: (time) => `Час ${time}`,
  testsLabel: (count, max) =>
    max === null ? `Проби ${count}` : `Проби ${count} / ${max}`,
  testsCounter: "Проби",
  answersLeft,
  answersCounter: "Лишилось відповідей",
  addingTo: (point) => `Додаєте до точки ${point}.`,
  placeAll: "Поставте всі п’ять цифр, перш ніж запускати пробу.",
  noTestsLeft: "Проб не залишилось. Результат усе ще можна надіслати.",
  trayLabel: "Цифри",
  addDigit: (face, point) => `Додати ${face} до точки ${point}`,
  trayEmpty: "Усі п’ять цифр уже на зірці.",
  selectPoint: (point) => `Обрати точку ${point}`,
  pointValue: (point, value) => `Точка ${point}, ${value}`,
  emptyPoint: "порожньо",
  emptyMark: "–",
  removeDigit: (face, point) => `Забрати ${face} з точки ${point}`,
  resultUnknown: "Результат невідомий",
  resultDraft: "Ще не перевірено",
  resultLabel: (value) => `Результат ${value}`,
  challengeStarLabel: "Зірка-завдання",
  testStarLabel: "Пробна зірка",
  exampleStarLabel: "Приклад",
  runTest: "Запустити пробу",
  undo: "Назад",
  clear: "Очистити",
  newDigits: "Нові цифри",
  newDigitsPrompt:
    "Взяти п’ять нових цифр? Це очистить зірку, яку ви складаєте.",
  newDigitsYes: "Нові цифри",
  newDigitsNo: "Лишити ці цифри",
  testResult: (result) => `Цей розклад дає ${result}.`,
  submitAnswer: "Надіслати результат",
  answerTitle: "Результат завдання",
  answerLabel: "Результат",
  answerRequired: "Введіть результат.",
  confirmAnswer: "Надіслати результат",
  cancelAnswer: "Грати далі",
  close: "Закрити",
  correct: "Правильно.",
  missed: "Це не той результат.",
  wrong: (left) =>
    left === 1
      ? "Це не той результат. Залишилась 1 відповідь."
      : `Це не той результат. ${answersLeft(left)}.`,
  hintTitle: "Приклад",
  hintText: (result) => `Цей розклад дає ${result}.`,
  revealTitle: "Правило",
  explanations: {
    sumEvens: "Додайте парні числа. Непарні не враховуйте.",
    sumOdds: "Додайте непарні числа. Парні не враховуйте.",
    sumDivisibleBy3: "Додайте числа, що діляться на 3.",
    sumPrimes: "Додайте прості числа. 1 не є простим.",
    sumSquares: "Додайте точні квадрати.",
    sumMultiDigit:
      "Додайте числа з двох або більше цифр. Одноцифрові не враховуйте.",
    maxMinusMin: "Відніміть найменше число від найбільшого.",
    sumGreaterThanNext:
      "Додайте кожне число, яке більше за наступну точку за годинниковою стрілкою. Порожній сусід не рахується.",
    sumContains1: "Додайте числа, у яких є цифра 1.",
  },
  challengeResult: (result) => `Результат завдання — ${result}.`,
  exampleGives: (result) => `Це дає ${result}.`,
  nextPuzzle: "Наступне завдання",
  seeResults: "Підсумки",
  summaryTitle: "Сесія",
  summaryScore: (score, total) => `Рахунок ${score} з ${total}`,
  summaryTests: (count) => `Проби ${count}`,
  summaryMisses: (count) => `Хибні відповіді ${count}`,
  summaryTime: (time) => `Час ${time}`,
  notesLabel: "Нотатки",
  notesPlaceholder: "Гіпотези, розклади й ідеї",
  historyTitle: "Проби",
  historyEmpty: "Проб ще немає.",
  historyPoint: (point, value) => `${point} ${value}`,
  historyResult: (result) => `Результат ${result}`,
  positions: {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
  },
};
