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
    hard: "Weights from 1 to 20, all different. One color revealed. Eight copies of each color. Place at least 3 blocks per move. One guess. Only a correct guess wins.",
  },
  controlsTitle: "Game Controls",
  newGame: "New puzzle",
  thisPuzzle: (name: string) => `This puzzle: ${name}`,
  rulesTitle: "Rules",
  startingTitle: "Starting information",
  settingsTitle: "Settings",
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
  medianClue: (color: string, weight: number) =>
    `${color} weighs ${weight} g and is third by weight. Two colors are lighter and two are heavier.`,
  revealedWeight: (color: string, weight: number) =>
    `${color} weighs ${weight} g.`,
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
  placeHint: "How to place blocks",
  ghostPairs: "Ghost blocks that have a match on the other pan",
  ghostedBlock: "cancels",
  orderTitle: "Assumed order",
  yourInformation: "Your information",
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
  submitGuess: "Submit guess",
  guessDialogTitle: "Check the weights",
  confirmGuess: "Check weights",
  cancelGuess: "Cancel",
  staged: (count: number, min: number) => `Staged: ${count} / ${min}`,
  invalidGuess: (min: number, max: number) =>
    `Enter a whole number from ${min} to ${max} for every color.`,
  wrongGuess: "That set is wrong.",
  correctGuess: "Every weight is correct. Congratulations.",
  takePartial: "Finish with a balance",
  noBlocks: "No copies of that color are left.",
  samePattern:
    "Those pans hold the same combination, so the balance does not count.",
  placingOn: (scale: string, side: string) =>
    `Placing on ${scale}, ${side} pan.`,
  statusSolved:
    "The main scale is balanced with two different combinations. Guess the five weights.",
  statusSolvedPartial:
    "The main scale is balanced. Guess the weights, or finish with a partial success.",
  revealTitle: "The weights",
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
