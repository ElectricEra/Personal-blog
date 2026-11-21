export const en = {
  title: "Formula Maze",
  intro:
    "Memorize 16 numbers. Then draw a path across the letter board to hit the target sum.",
  memorizeLabel: "Memorize for",
  memorizeOptions: {
    60: "60 seconds",
    30: "30 seconds",
    15: "15 seconds",
    0: "Skip memorizing timer",
  },
  newBoard: "New board",
  flipNow: "Flip board now",
  secondsRemaining: (seconds: number) => `${seconds}s remaining`,
  boardHidden: "Board hidden",
  ready: "Ready",
  solved: (count: number) => `Solved: ${count}`,
  memorizeStatus: "Memorize the numbers!",
  routeStatus: (start: string, end: string, target: number) =>
    `${start} → ${end} = ${target}`,
  idleStatus: "Ready to play?",
  memorizeDetail:
    "Remember which number belongs to each position. The board will flip to letters.",
  routeDetail: (start: string, end: string, target: number) =>
    `Start on ${start} (green border), finish on ${end} (gold border). Build a path whose numbers add up to ${target}.`,
  idleDetail:
    "Press “New board” to view the numbers. You'll get a target after the board flips.",
  boardLabel: "4 by 4 game board",
  cellWithNumber: (letter: string, number: number) =>
    `Cell ${letter}, number ${number}`,
  cell: (letter: string) => `Cell ${letter}`,
  total: (sum: number, target: number) => `Total: ${sum} / ${target}`,
  totalHidden: "Total: —",
  path: (label: string) => `Path: ${label}`,
  checkPath: "Check path",
  undo: "Undo",
  clearPath: "Clear path",
  hideNumbers: "Hide numbers",
  showNumbers: "Reveal numbers",
  hint: "Only up, down, left, or right. Each cell can be used once. Both endpoints count toward the sum. Click your last cell to undo it.",
  startAt: (letter: string) => `Start at ${letter}.`,
  visitTwice: "A cell cannot be visited twice.",
  adjacentOnly: "Move only to an adjacent cell.",
  endMustBeLast:
    "The endpoint must be your final cell. Undo to change your route.",
  startAtMarked: "Start at the marked starting letter.",
  endAtMarked: "Your route must end at the marked finishing letter.",
  wrongRoute: "Not quite! Try adjusting your route.",
  solvedMessage: "Correct! You solved it. Press “New board” for another round.",
  numbersRevealed:
    "Numbers revealed. This round no longer counts toward your score.",
  numbersHidden: "Numbers hidden again.",
};

export type GameTranslation = typeof en;
