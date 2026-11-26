export const en = {
  title: "Wall Go",
  intro:
    "Two sides share a 7×7 board. Move a piece, then close the board with a wall. Own more cells than your opponent.",
  controlsTitle: "Game",
  rulesTitle: "How to play",
  startingTitle: "This game",
  modeLabel: "Opponent",
  sideLabel: "Your side",
  difficultyLabel: "Difficulty",
  modes: {
    pass: "Pass and play",
    bot: "Play versus bot",
  },
  sides: {
    red: "Red",
    blue: "Blue",
  },
  letters: {
    red: "R",
    blue: "B",
  },
  difficulties: {
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    expert: "Expert",
  },
  startingPass:
    "Two people, one screen. Red places first and moves first. Turns are not timed. Settings apply when you start a new game.",
  startingBot: (side: string, difficulty: string) =>
    `You play ${side} against the bot on ${difficulty}. ${side === "Red" ? "You move" : "The bot moves"} first. Turns are not timed. Settings apply when you start a new game.`,
  newGame: "New game",
  restart: "Restart",
  restartPrompt: "Restart this match from the opening?",
  restartYes: "Restart match",
  restartNo: "Keep playing",
  rules: [
    "Each side has four pieces. Two start on the board, and each side places two more: Red, Blue, Blue, Red. A piece goes on any empty cell.",
    "A turn is a move, then a wall. Move one of your pieces zero, one, or two steps up, down, left, or right. You may turn once. You cannot cross a wall, land on a piece, or move inside a territory that already belongs to one side.",
    "You may stay put only when that piece has an empty neighbor it could step onto.",
    "Place one wall on an open inner edge of the cell you moved to. Walls never move, and they block both sides.",
    "A region scores for the side whose pieces are inside it, one point per cell. Empty regions score nothing. A region with both colors scores nothing, unless nobody there can move: then each side scores one point per piece.",
    "The match ends when no region contains both colors, or when neither side can move. A side with no legal move skips its turn. The higher score wins. If the scores match, the larger single region wins. If those match too, it is a draw.",
    "Pass and play: after your wall, hand over the device and press Pass turn. Against the bot, play continues without a handoff.",
  ],
  boardTitle: "Board",
  boardLabel: "Wall Go board",
  deployStatus: (side: string) => `${side} places a piece.`,
  choosePiece: (side: string) => `${side}: choose a piece.`,
  chooseDestination: (side: string) => `${side}: choose a destination.`,
  chooseWall: (side: string) => `${side}: choose a wall.`,
  botThinking: (side: string) => `${side} is thinking…`,
  botMoving: (side: string) => `${side} is moving.`,
  gameOver: "The match is over.",
  passTo: (side: string) => `Pass to ${side}`,
  startTurn: "Pass turn",
  score: (side: string, count: number) => `${side}: ${count}`,
  securedNote: "Secured territory only. Contested regions are not counted yet.",
  finalNote: "Final score, including trapped pieces.",
  cells: (count: number) => (count === 1 ? "1 cell" : `${count} cells`),
  largestLine: (red: string, blue: string) =>
    `Largest region: Red ${red}, Blue ${blue}.`,
  winner: (side: string) => `${side} wins`,
  draw: "Draw",
  endings: {
    separation: "Every piece sits in its own territory.",
    stalemate: "Neither side has a legal move.",
    safety: "No open edges remain.",
  },
  playAgain: "Play again",
  changeSettings: "Change settings",
  occupied: "That cell is taken.",
  pieceStuck: "That piece has no legal move.",
  notLegal: "Choose a highlighted cell or wall.",
  forcedPass: (skipped: string, next: string) =>
    `${skipped} has no legal move, so the turn passes to ${next}.`,
  placeLabel: (cell: string) => `Place a piece on ${cell}`,
  pieceLabel: (side: string, cell: string) => `${side} piece on ${cell}`,
  closedPiece: (side: string, cell: string) =>
    `${side} piece on ${cell}, in a closed territory`,
  emptyLabel: (cell: string) => `${cell}, empty`,
  destinationLabel: (cell: string) => `Move to ${cell}`,
  wallLabel: (direction: string, cell: string) =>
    `Wall on the ${direction} of ${cell}`,
  directions: {
    up: "top",
    right: "right",
    down: "bottom",
    left: "left",
  },
};

export type GameTranslation = typeof en;
