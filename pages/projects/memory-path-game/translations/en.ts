export const en = {
  back: "Back",
  title: "Memory Path",
  intro:
    "Memorize sixteen numbers, then trace a path across the letter board that adds up to the target.",
  memorizeLabel: "Memorize for",
  memorizeOptions: {
    60: "60 seconds",
    30: "30 seconds",
    15: "15 seconds",
    0: "No timer",
  },
  newBoard: "New board",
  flipNow: "Flip now",
  rulesTitle: "Rules",
  startingTitle: "Starting information",
  settingsTitle: "Settings",
  close: "Close",
  rules: [
    "Sixteen cells show sixteen of the numbers from 1 to 20.",
    "Study the numbers. The board then flips to the letters A–P.",
    "Start on the green cell and finish on the gold cell. Both ends count toward the sum.",
    "Move only up, down, left, or right. Each cell can be used once.",
    "The path stays a draft until you check it. A dashed border means it is not checked yet.",
    "A correct path reveals the numbers and counts as solved.",
    "You can reveal the numbers early. A solve counts only while they stay hidden.",
  ],
  memorizePreview: {
    60: "You will see the numbers for 60 seconds. The board then flips to letters and shows the start, the end, and the target.",
    30: "You will see the numbers for 30 seconds. The board then flips to letters and shows the start, the end, and the target.",
    15: "You will see the numbers for 15 seconds. The board then flips to letters and shows the start, the end, and the target.",
    0: "The board starts on letters. There is no time to study the numbers. The start, the end, and the target appear immediately.",
  },
  secondsRemaining: (seconds: number) => `${seconds}s remaining`,
  boardTitle: "The board",
  routePlaceholder: "? → ? = ?",
  routePlaceholderLabel:
    "The start, the end, and the target appear here after the board flips.",
  routeStatus: (start: string, end: string, target: number) =>
    `${start} → ${end} = ${target}`,
  memorizeHelp:
    "Remember which number belongs in each cell. Flip the board when you are ready.",
  routeDetail: (start: string, end: string, target: number) =>
    `Start on ${start} (green border) and finish on ${end} (gold border). The numbers on your path must add up to ${target}.`,
  boardLabel: "4 by 4 game board",
  howToMove:
    "Choose a cell to extend the path. Choose the last cell, or Undo, to step back. Dashed cells are not checked yet.",
  moveHint: "How to move",
  cell: (letter: string) => `Cell ${letter}`,
  cellWithNumber: (letter: string, number: number) =>
    `Cell ${letter}, number ${number}`,
  cellStart: "start",
  cellEnd: "end",
  cellStep: (step: number) => `step ${step}`,
  cellNext: "next cell",
  total: (sum: number, target: number) => `Total: ${sum} / ${target}`,
  totalHidden: "The total appears when you check the path.",
  path: (label: string) => `Path: ${label}`,
  steps: (count: number) => `Steps: ${count}`,
  checkPath: "Check path",
  undo: "Undo",
  clearPath: "Clear",
  hideNumbers: "Hide numbers",
  showNumbers: "Reveal numbers",
  revealPrompt:
    "Reveal the numbers? A solve counts only while the numbers stay hidden.",
  revealYes: "Reveal numbers",
  revealNo: "Keep playing",
  notesLabel: "Notes",
  notesPlaceholder: "Letters, numbers, and sums you want to keep.",
  highlightMoves: "Highlight cells you can move to",
  startAt: (letter: string) => `Start at ${letter}.`,
  visitTwice: "A cell cannot be visited twice.",
  adjacentOnly: "Move only to an adjacent cell.",
  endMustBeLast:
    "The end cell has to be last. Undo if you want to change the route.",
  startAtMarked: "Start on the green cell.",
  endAtMarked: "The path has to finish on the gold cell.",
  wrongRoute: "That path does not add up to the target.",
  solvedMessage: "Correct. Press New board for another round.",
  numbersRevealed:
    "Numbers revealed. Hide them again if this round should still count.",
  numbersHidden: "Numbers hidden again.",
};

export type GameTranslation = typeof en;
