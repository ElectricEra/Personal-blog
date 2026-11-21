import type { Card, Rank, Suit } from "@/components/PlayingCard/cards";

const rankNames: Record<Rank, string> = {
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

const suitNames: Record<Suit, string> = {
  spades: "spades",
  hearts: "hearts",
  diamonds: "diamonds",
  clubs: "clubs",
};

export const en = {
  title: "Playing Cards",
  intro:
    "A full 52-card deck drawn with pure CSS. Click the deck to reveal the next card.",
  deckTitle: "Deck",
  drawCard: (left: number) => `Draw a card, ${left} left in the deck`,
  cardsLeft: (left: number) =>
    left === 1 ? "1 card left" : `${left} cards left`,
  deckEmpty: "The deck is empty.",
  clickDeck: "Click the deck to reveal a card.",
  shuffle: "Shuffle a new deck",
  drawnTitle: "Drawn cards",
  allCardsTitle: "All 52 cards",
  suits: {
    spades: "Spades",
    hearts: "Hearts",
    diamonds: "Diamonds",
    clubs: "Clubs",
  } satisfies Record<Suit, string>,
  cardName: ({ rank, suit }: Card) =>
    `${rankNames[rank]} of ${suitNames[suit]}`,
};

export type CardsTranslation = typeof en;
