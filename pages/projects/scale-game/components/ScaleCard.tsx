import { useState } from "react";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";

import { Hint } from "@/components/Hint/Hint";
import { Popover } from "@/components/Popover/Popover";
import { VisuallyHidden } from "@/components/VisuallyHidden/VisuallyHidden";
import { cx } from "@/utils/cx";

import {
  addPans,
  countPlacements,
  emptyPan,
  pairOverlap,
} from "../logic/board";
import {
  COLORS,
  type Color,
  type Pan,
  type Placement,
  type ReportedOutcome,
  type ScaleId,
  type ScaleState,
  type Side,
} from "../logic/config";
import type { GameTranslation } from "../translations";
import { colorClassNames } from "./colors";
import styles from "./ScaleCard.module.css";

const tiltClassNames: Record<ReportedOutcome, string> = {
  left: styles.tiltLeft,
  right: styles.tiltRight,
  balance: styles.tiltLevel,
  none: styles.tiltLevel,
};

const SIDES = ["left", "right"] as const;

type Token = { color: Color; pending: boolean; ghost: boolean; key: string };

/**
 * Committed blocks first, then pending ones, grouped by color. The first
 * `overlap[color]` blocks of each color are ghosted.
 */
const tokensFor = (committed: Pan, pending: Pan, overlap: Pan): Token[] =>
  COLORS.flatMap((color) => {
    const states = [
      ...Array<boolean>(committed[color]).fill(false),
      ...Array<boolean>(pending[color]).fill(true),
    ];
    return states.map((isPending, order) => ({
      color,
      pending: isPending,
      ghost: order < overlap[color],
      key: `${color}-${order}`,
    }));
  });

type ScaleCardProps = {
  title: string;
  scaleId: ScaleId;
  committed: ScaleState;
  pending: readonly Placement[];
  outcome: ReportedOutcome;
  selectedSide: Side | null;
  interactive: boolean;
  ghostPairs: boolean;
  copy: GameTranslation;
  onSelect: (side: Side) => void;
  onRemove: (side: Side, color: Color) => void;
};

export const ScaleCard = ({
  title,
  scaleId,
  committed,
  pending,
  outcome,
  selectedSide,
  interactive,
  ghostPairs,
  copy,
  onSelect,
  onRemove,
}: ScaleCardProps) => {
  const [hintOpen, setHintOpen] = useState(false);
  const pendingBySide = {
    left: countPlacements(pending, scaleId, "left"),
    right: countPlacements(pending, scaleId, "right"),
  };
  const overlap = ghostPairs
    ? pairOverlap(
        addPans(committed.left, pendingBySide.left),
        addPans(committed.right, pendingBySide.right),
      )
    : emptyPan();

  return (
    <section className={styles.card} aria-label={title}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{title}</h2>
        <Popover
          className={styles.hintAnchor}
          panelClassName={styles.hintBubble}
          open={hintOpen}
          onOpenChange={setHintOpen}
          label={copy.placeHint}
          trigger={
            <button
              type="button"
              className={styles.hintButton}
              aria-label={copy.placeHint}
            >
              <HiOutlineQuestionMarkCircle aria-hidden />
            </button>
          }
        >
          <Hint>{copy.howToPlace}</Hint>
        </Popover>
      </div>
      <p className={styles.outcome} aria-live="polite">
        {copy.outcomes[outcome]}
      </p>
      <div className={styles.stage}>
        <div className={cx(styles.beam, tiltClassNames[outcome])} />
        <div className={styles.base} />
      </div>
      <div className={styles.pans}>
        {SIDES.map((side) => {
          const selected = selectedSide === side;
          const tokens = tokensFor(
            committed[side],
            pendingBySide[side],
            overlap,
          );
          return (
            <div key={side} className={styles.panColumn}>
              <button
                type="button"
                className={cx(
                  styles.sideButton,
                  selected && styles.sideSelected,
                )}
                aria-pressed={selected}
                disabled={!interactive}
                onClick={() => onSelect(side)}
              >
                {side === "left" ? copy.leftPan : copy.rightPan}
              </button>
              <div className={cx(styles.pan, selected && styles.panSelected)}>
                {tokens.map((token) => {
                  const className = cx(
                    styles.token,
                    colorClassNames[token.color],
                    token.pending && styles.pendingToken,
                    token.ghost && styles.ghostToken,
                  );
                  const ghostLabel = token.ghost
                    ? `, ${copy.ghostedBlock}`
                    : "";
                  return token.pending ? (
                    <button
                      key={token.key}
                      type="button"
                      className={className}
                      aria-label={`${copy.removePending(copy.colors[token.color])}${ghostLabel}`}
                      disabled={!interactive}
                      onClick={() => onRemove(side, token.color)}
                    >
                      {copy.short[token.color]}
                    </button>
                  ) : (
                    <span key={token.key} className={className}>
                      <span aria-hidden="true">{copy.short[token.color]}</span>
                      <VisuallyHidden>
                        {copy.colors[token.color]}
                        {ghostLabel}
                      </VisuallyHidden>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
