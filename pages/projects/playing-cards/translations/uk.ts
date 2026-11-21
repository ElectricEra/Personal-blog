import type { Rank, Suit } from "@/components/PlayingCard/cards";

import type { CardsTranslation } from "./en";

const rankNames: Record<Rank, string> = {
  A: "Туз",
  "2": "Двійка",
  "3": "Трійка",
  "4": "Четвірка",
  "5": "П’ятірка",
  "6": "Шістка",
  "7": "Сімка",
  "8": "Вісімка",
  "9": "Дев’ятка",
  "10": "Десятка",
  J: "Валет",
  Q: "Дама",
  K: "Король",
};

const suitNames: Record<Suit, string> = {
  spades: "пік",
  hearts: "червів",
  diamonds: "бубон",
  clubs: "треф",
};

const cardWord = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return "карта";
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "карти";
  }
  return "карт";
};

export const uk: CardsTranslation = {
  title: "Гральні карти",
  intro:
    "Повна колода з 52 карт, намальована лише на CSS. Натисніть на колоду, щоб відкрити наступну карту.",
  deckTitle: "Колода",
  drawCard: (left) => `Витягнути карту, у колоді ${left} ${cardWord(left)}`,
  cardsLeft: (left) => `Залишилось ${left} ${cardWord(left)}`,
  deckEmpty: "Колода порожня.",
  clickDeck: "Натисніть на колоду, щоб відкрити карту.",
  shuffle: "Перетасувати нову колоду",
  drawnTitle: "Витягнуті карти",
  allCardsTitle: "Усі 52 карти",
  suits: {
    spades: "Піки",
    hearts: "Черви",
    diamonds: "Бубни",
    clubs: "Трефи",
  },
  cardName: ({ rank, suit }) => `${rankNames[rank]} ${suitNames[suit]}`,
};
