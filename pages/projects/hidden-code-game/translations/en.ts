import type { Position } from "../logic/positions";
import type { RuleId } from "../logic/rules";
import type { Mode } from "../logic/session";

export const en = {
  title: "Hidden Code",
  intro:
    "A hidden rule turns five numbers on a star into one result. Test your own arrangements, then name the challenge star’s result.",
  modeLabel: "Mode",
  modes: {
    guided: "Guided",
    classic: "Classic",
    challenge: "Challenge",
  } satisfies Record<Mode, string>,
  modeDetail: {
    guided:
      "One puzzle. Unlimited tests and answers. After three wrong answers, an extra example appears. You can roll a new set of digits at any time.",
    classic:
      "Five puzzles, one point each. Unlimited tests. Two answers per puzzle. A second miss ends that puzzle. Tests, misses, and time are kept for the session.",
    challenge:
      "Five puzzles. Six tests and one answer per puzzle. A new set of digits does not spend a test. No examples are revealed early.",
  } satisfies Record<Mode, string>,
  newGame: "New puzzle",
  resign: "Resign",
  resignPrompt: "Resign and reveal the rule? This ends the puzzle.",
  resignYes: "Reveal the rule",
  resignNo: "Keep playing",
  controlsTitle: "Game",
  rulesTitle: "Rules",
  startingTitle: "Starting information",
  rules: [
    "One hidden rule turns the five numbers on a star into a single result.",
    "The challenge star uses that rule. You are looking for its result.",
    "You start with five digits from 1 to 6. Place every digit on the test star.",
    "Join digits on one point to make a larger number, or leave a point empty.",
    "A test shows the true result of that arrangement. An incomplete star is not a test.",
    "You can roll a new set of five digits. Earlier results stay in the history.",
    "Your answer is the challenge result, not a secret code.",
    "A correct answer solves the puzzle and reveals the rule.",
  ],
  challengeTitle: "Challenge",
  experimentTitle: "Experiment",
  notesZoneTitle: "Notes",
  puzzleProgress: (current: number, total: number) =>
    `Puzzle ${current} of ${total}`,
  scoreLabel: (score: number) => `Score ${score}`,
  timeLabel: (time: string) => `Time ${time}`,
  testsLabel: (count: number, max: number | null) =>
    max === null ? `Tests ${count}` : `Tests ${count} / ${max}`,
  testsCounter: "Tests",
  answersLeft: (count: number) =>
    count === 1 ? "1 answer left" : `${count} answers left`,
  answersCounter: "Answers left",
  addingTo: (point: string) => `Adding to point ${point}.`,
  placeAll: "Place all five digits before running a test.",
  noTestsLeft: "No tests left. You can still submit the result.",
  trayLabel: "Digits",
  addDigit: (face: number, point: string) => `Add ${face} to point ${point}`,
  trayEmpty: "All five digits are on the star.",
  selectPoint: (point: string) => `Select point ${point}`,
  pointValue: (point: string, value: string) => `Point ${point}, ${value}`,
  emptyPoint: "empty",
  emptyMark: "–",
  removeDigit: (face: number, point: string) =>
    `Remove ${face} from point ${point}`,
  resultUnknown: "Result unknown",
  resultDraft: "Not tested yet",
  resultLabel: (value: string) => `Result ${value}`,
  challengeStarLabel: "Challenge star",
  testStarLabel: "Test star",
  exampleStarLabel: "Example",
  runTest: "Run test",
  undo: "Undo",
  clear: "Clear",
  newDigits: "New digits",
  newDigitsPrompt:
    "Roll five new digits? This clears the star you are building.",
  newDigitsYes: "Roll digits",
  newDigitsNo: "Keep these digits",
  testResult: (result: number) => `That arrangement gives ${result}.`,
  submitAnswer: "Submit result",
  answerTitle: "Challenge result",
  answerLabel: "Result",
  answerRequired: "Enter the result.",
  confirmAnswer: "Submit result",
  cancelAnswer: "Keep playing",
  close: "Close",
  correct: "Correct.",
  missed: "That is not the result.",
  wrong: (left: number) =>
    left === 1
      ? "That is not the result. 1 answer left."
      : `That is not the result. ${left} answers left.`,
  hintTitle: "Example",
  hintText: (result: number) => `This arrangement produces ${result}.`,
  revealTitle: "The rule",
  explanations: {
    sumEvens: "Add the even numbers. Leave the odd numbers out.",
    sumOdds: "Add the odd numbers. Leave the even numbers out.",
    sumDivisibleBy3: "Add the numbers that are divisible by 3.",
    sumPrimes: "Add the prime numbers. 1 is not prime.",
    sumSquares: "Add the perfect squares.",
    sumMultiDigit:
      "Add the numbers with two or more digits. Single digits are left out.",
    maxMinusMin: "Subtract the smallest number from the largest.",
    sumGreaterThanNext:
      "Add each number that is greater than the next point clockwise. An empty neighbor does not count.",
    sumContains1: "Add the numbers that contain the digit 1.",
  } satisfies Record<RuleId, string>,
  challengeResult: (result: number) => `The challenge result is ${result}.`,
  exampleGives: (result: number) => `This gives ${result}.`,
  nextPuzzle: "Next puzzle",
  seeResults: "See results",
  summaryTitle: "Session",
  summaryScore: (score: number, total: number) => `Score ${score} of ${total}`,
  summaryTests: (count: number) => `Tests ${count}`,
  summaryMisses: (count: number) => `Wrong answers ${count}`,
  summaryTime: (time: string) => `Time ${time}`,
  notesLabel: "Notes",
  notesPlaceholder: "Hypotheses, arrangements, and ideas",
  historyTitle: "Tests",
  historyEmpty: "No tests yet.",
  historyPoint: (point: string, value: string) => `${point} ${value}`,
  historyResult: (result: number) => `Result ${result}`,
  positions: {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
  } satisfies Record<Position, string>,
};

export type GameTranslation = typeof en;
