export const SUITS = ["spades", "hearts", "diamonds", "clubs"] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
] as const;
export type Rank = (typeof RANKS)[number];

export type Card = {
  suit: Suit;
  rank: Rank;
};

// U+FE0E forces text presentation so hearts and diamonds never render as emoji.
export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: "\u2660\uFE0E",
  hearts: "\u2665\uFE0E",
  diamonds: "\u2666\uFE0E",
  clubs: "\u2663\uFE0E",
};

export const isRed = (suit: Suit) => suit === "hearts" || suit === "diamonds";

export const cardId = ({ suit, rank }: Card) => `${rank}-${suit}`;

export const createDeck = (): Card[] =>
  SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));

export const shuffle = <T>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

const RANK_NAMES: Record<Rank, string> = {
  A: "Ace",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
  "10": "Ten",
  J: "Jack",
  Q: "Queen",
  K: "King",
};

export const cardName = ({ suit, rank }: Card) =>
  `${RANK_NAMES[rank]} of ${suit}`;
