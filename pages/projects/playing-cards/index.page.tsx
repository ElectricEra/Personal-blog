import { useEffect, useState } from "react";

import { CardDeck } from "@/components/CardDeck/CardDeck";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import {
  type Card,
  cardId,
  createDeck,
  RANKS,
  SUITS,
  shuffle,
} from "@/components/PlayingCard/cards";
import { PlayingCard } from "@/components/PlayingCard/PlayingCard";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/utils/i18n";

import styles from "./index.module.css";
import { translations } from "./translations";

const PlayingCards = () => {
  const copy = useTranslation(translations);
  const [deck, setDeck] = useState<Card[]>(createDeck);
  const [drawn, setDrawn] = useState<Card[]>([]);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  useEffect(() => {
    setDeck(shuffle(createDeck()));
  }, []);

  const current = drawn.at(-1);
  const currentId = current ? cardId(current) : null;

  // The card mounts face down, then flips on the next frame.
  useEffect(() => {
    if (!currentId) {
      return;
    }
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setRevealedId(currentId));
    });
    return () => cancelAnimationFrame(frame);
  }, [currentId]);

  const draw = () => {
    const [next, ...rest] = deck;
    if (!next) {
      return;
    }
    setDeck(rest);
    setDrawn((cards) => [...cards, next]);
  };

  const reset = () => {
    setDeck(shuffle(createDeck()));
    setDrawn([]);
    setRevealedId(null);
  };

  return (
    <PageWrapper fullScreen>
      <SectionHeader>{copy.title}</SectionHeader>
      <Text className={styles.intro} align="center">
        {copy.intro}
      </Text>

      <section className={styles.section} aria-label={copy.deckTitle}>
        <h2 className={styles.heading}>{copy.deckTitle}</h2>
        <div className={styles.table}>
          <CardDeck
            count={deck.length}
            onDraw={draw}
            label={copy.drawCard(deck.length)}
          />
          <div className={styles.slot} aria-live="polite">
            {current && currentId ? (
              <div key={currentId} className={styles.dealt}>
                <PlayingCard
                  {...current}
                  faceDown={revealedId !== currentId}
                  label={copy.cardName(current)}
                />
              </div>
            ) : null}
          </div>
        </div>
        <Text align="center">
          {deck.length === 0
            ? copy.deckEmpty
            : drawn.length === 0
              ? copy.clickDeck
              : copy.cardsLeft(deck.length)}
        </Text>
        <div className={styles.controls}>
          <PhysicalButton
            variant="secondary"
            onClick={reset}
            disabled={drawn.length === 0}
          >
            {copy.shuffle}
          </PhysicalButton>
        </div>
        {drawn.length > 1 ? (
          <>
            <h3 className={styles.subheading}>{copy.drawnTitle}</h3>
            <ol className={styles.drawn}>
              {drawn.slice(0, -1).map((card) => (
                <li key={cardId(card)}>
                  <PlayingCard {...card} label={copy.cardName(card)} />
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </section>

      <section className={styles.section} aria-label={copy.allCardsTitle}>
        <h2 className={styles.heading}>{copy.allCardsTitle}</h2>
        {SUITS.map((suit) => (
          <div key={suit} className={styles.suitGroup}>
            <h3 className={styles.subheading}>{copy.suits[suit]}</h3>
            <ul className={styles.grid}>
              {RANKS.map((rank) => (
                <li key={rank}>
                  <PlayingCard
                    suit={suit}
                    rank={rank}
                    label={copy.cardName({ suit, rank })}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </PageWrapper>
  );
};

export default PlayingCards;
