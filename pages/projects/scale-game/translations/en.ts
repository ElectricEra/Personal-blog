export const en = {
  back: "Back",
  title: "Scale Game",
  intro:
    "Five colors hide their weights. Spend a limited set of blocks on two scales, then deduce every number.",
  difficultyLabel: "Difficulty",
  difficulties: {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
  },
  difficultyDetail: {
    easy: "Weights from 1 to 10, all different. Two colors revealed. Eight copies of each color. Place at least 2 blocks per move. Two guesses. A balanced main scale counts as a partial success.",
    normal:
      "Weights from 1 to 20, all different. The middle color is revealed: two colors are lighter and two are heavier. Eight copies of each color. Place at least 2 blocks per move. Two guesses. A balanced main scale counts as a partial success.",
    hard: "Weights from 1 to 20, all different. One color revealed. Six copies of each color. Place at least 3 blocks per move. One guess. Only a correct guess wins.",
  },
  newGame: "New puzzle",
  thisPuzzle: (name: string) => `This puzzle: ${name}`,
  rulesTitle: "Rules",
  rules: [
    "Each color has one hidden whole-number weight. Every copy of that color weighs the same.",
    "A scale only shows which side is heavier, or that the pans balance. It never shows grams.",
    "Committed blocks stay on the scales. Blocks you have not committed stay in your inventory.",
    "One move may use both scales and any pan. It must place at least the minimum for the difficulty.",
    "The second scale is only for comparisons.",
    "The main scale is solved when it balances and the pans hold different combinations. Matching pans, including two empty pans, do not count.",
    "A solved main scale lets you guess all five weights. A wrong guess only says the set is wrong.",
    "On Easy and Normal, a valid balance is a partial success even if the guess fails or you skip it.",
    "On Hard, the round is a success only when every weight is correct.",
  ],
  inventoryLabel: "Blocks",
  remaining: (count: number) => `${count} left`,
  knownWeight: (weight: number) => `${weight} g`,
  medianClue: (color: string) =>
    `${color} is third by weight. Two colors are lighter and two are heavier.`,
  unknownWeight: "?",
  placeBlock: (color: string, weight: string, count: number) =>
    `Place ${color}, ${weight}, ${count} left`,
  removePending: (color: string) => `Remove ${color} from this move`,
  mainScale: "Main scale",
  secondScale: "Second scale",
  leftPan: "Left",
  rightPan: "Right",
  outcomes: {
    left: "Left heavier",
    right: "Right heavier",
    balance: "Balanced",
    none: "No result yet",
  },
  historyTitle: "Experiments",
  historyEmpty:
    "Committed moves will appear here. The scales never show a number.",
  moveLabel: (move: number) => `Move ${move}`,
  piece: (color: string, count: number, side: string) =>
    `${color} ×${count} → ${side}`,
  unchanged: "Nothing added",
  commit: "Commit move",
  undo: "Undo",
  clearPending: "Clear",
  resign: "Resign",
  resignPrompt: "Resign and reveal the weights? This ends the puzzle.",
  resignYes: "Reveal weights",
  resignNo: "Keep playing",
  needMore: (count: number) =>
    `Place at least ${count} blocks before committing.`,
  howToPlace:
    "Choose a pan, then a color. Dashed blocks are not weighed until you commit. Undo removes the last one.",
  ghostPairs: "Ghost blocks that have a match on the other pan",
  ghostedBlock: "cancels",
  orderTitle: "Assumed order",
  orderHint:
    "Heavier on the left. Select a color, then a position. Select a placed color again to take it out. Write any weight you have worked out.",
  orderMiddle: "Known middle weight",
  orderEmpty: (place: number) =>
    `Empty position ${place}. Heavier colors stand further left.`,
  orderTray: "Not placed yet",
  orderPick: (color: string) => `Select ${color}`,
  draftWeight: (color: string) => `Preliminary weight for ${color}`,
  resultNote: "The beam shows only the blocks you have already committed.",
  notesLabel: "Notes",
  notesPlaceholder: "Write inequalities, equations, and ideas here.",
  guessTitle: "Guess the weights",
  guessHint:
    "Submit sends the preliminary weights already written on the colors. A wrong guess does not reveal which value missed.",
  guessLocked:
    "Balance the main scale with two different combinations to unlock a guess.",
  submitGuess: "Submit guess",
  guessesLeft: (count: number) => `Guesses left: ${count}`,
  blocksLeft: (count: number) => `Blocks left: ${count}`,
  staged: (count: number, min: number) => `Staged: ${count} / ${min}`,
  invalidGuess: (min: number, max: number) =>
    `Enter a whole number from ${min} to ${max} for every color.`,
  wrongGuess: "That set is wrong.",
  takePartial: "Finish with a balance",
  noBlocks: "No copies of that color are left.",
  samePattern:
    "Those pans hold the same combination, so the balance does not count.",
  placingOn: (scale: string, side: string) =>
    `Placing on ${scale}, ${side} pan.`,
  statusIdle:
    "Choose a difficulty and start a puzzle. One or two weights are shown. The rest stay hidden.",
  statusPlaying:
    "Spend blocks, read which side is heavier, and balance the main scale.",
  statusSolved:
    "The main scale is balanced with two different combinations. Guess the five weights.",
  statusSolvedPartial:
    "The main scale is balanced. Guess the weights, or finish with a partial success.",
  statusFull: "Full success. Every weight is correct.",
  statusPartial:
    "Partial success. The main scale is balanced, but the weights are not all identified.",
  statusFailure: "Failure. This round did not meet its winning condition.",
  revealTitle: "The weights",
  weightLine: (color: string, weight: number) => `${color} = ${weight}`,
  colors: {
    red: "Red",
    yellow: "Yellow",
    green: "Green",
    blue: "Blue",
    purple: "Purple",
  },
  short: {
    red: "R",
    yellow: "Y",
    green: "G",
    blue: "B",
    purple: "P",
  },
};

export type GameTranslation = typeof en;
