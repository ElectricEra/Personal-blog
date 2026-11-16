import { useState } from "react";

import { BackButton } from "@/components/BackButton/BackButton";
import { Button } from "@/components/Button/Button";
import { Collapsible } from "@/components/Collapsible/Collapsible";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { Popover } from "@/components/Popover/Popover";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/utils/i18n";

import {
  addBoards,
  type Board,
  blockCount,
  boardFromPlacements,
  type Challenge,
  COLORS,
  type Color,
  canCommit,
  copiesLeft,
  countPlacements,
  createChallenge,
  DIFFICULTIES,
  DIFFICULTY_IDS,
  type Difficulty,
  emptyBoard,
  guessIsCorrect,
  type HistoryEntry,
  mainIsSolved,
  type Pan,
  type Placement,
  parseGuess,
  type ReportedOutcome,
  type RoundResult,
  reportOutcome,
  resultAfterGuess,
  resultIfStuck,
  type ScaleId,
  type ScaleState,
  type Side,
  samePattern,
  unusedBlocks,
  withoutLastPlacement,
} from "./game";
import styles from "./index.module.css";
import { type GameTranslation, translations } from "./translations";

type Phase = "idle" | RoundResult;

type Feedback = {
  text: string;
  good: boolean;
};

const emptyGuess = (): Record<Color, string> => ({
  red: "",
  yellow: "",
  green: "",
  blue: "",
  purple: "",
});

const guessFromChallenge = (challenge: Challenge): Record<Color, string> => {
  const next = emptyGuess();
  for (const color of challenge.revealed) {
    next[color] = String(challenge.weights[color]);
  }
  return next;
};

const isDifficulty = (value: string): value is Difficulty =>
  DIFFICULTY_IDS.some((difficulty) => difficulty === value);

const MIDDLE_SLOT = 2;
const SLOT_KEYS = ["heaviest", "heavy", "middle", "light", "lightest"] as const;

const emptyOrder = (): Array<Color | null> => [null, null, null, null, null];

const orderFromChallenge = (challenge: Challenge): Array<Color | null> => {
  const slots = emptyOrder();
  if (DIFFICULTIES[challenge.difficulty].medianReveal) {
    const middle = challenge.revealed[0];
    if (middle) {
      slots[MIDDLE_SLOT] = middle;
    }
  }
  return slots;
};

const slotIsFixed = (challenge: Challenge, index: number) =>
  DIFFICULTIES[challenge.difficulty].medianReveal && index === MIDDLE_SLOT;

const colorClassName = (color: Color) => {
  if (color === "red") {
    return styles.red;
  }
  if (color === "yellow") {
    return styles.yellow;
  }
  if (color === "green") {
    return styles.green;
  }
  if (color === "blue") {
    return styles.blue;
  }
  return styles.purple;
};

const tiltClassName = (outcome: ReportedOutcome) => {
  if (outcome === "left") {
    return styles.tiltLeft;
  }
  if (outcome === "right") {
    return styles.tiltRight;
  }
  return styles.tiltLevel;
};

const describeAdded = (
  placements: readonly Placement[],
  scale: ScaleId,
  copy: GameTranslation,
) => {
  const parts: string[] = [];
  for (const side of ["left", "right"] as const) {
    const sideName = side === "left" ? copy.leftPan : copy.rightPan;
    for (const color of COLORS) {
      let count = 0;
      for (const placement of placements) {
        if (
          placement.scale === scale &&
          placement.side === side &&
          placement.color === color
        ) {
          count += 1;
        }
      }
      if (count > 0) {
        parts.push(copy.piece(copy.colors[color], count, sideName));
      }
    }
  }
  return parts.length > 0 ? parts.join(", ") : copy.unchanged;
};

const tokensFor = (committed: Pan, pending: Pan) => {
  const tokens: Array<{ color: Color; pending: boolean; index: number }> = [];
  for (const color of COLORS) {
    for (let index = 0; index < committed[color]; index += 1) {
      tokens.push({ color, pending: false, index });
    }
    for (let index = 0; index < pending[color]; index += 1) {
      tokens.push({ color, pending: true, index });
    }
  }
  return tokens;
};

const combinedPan = (committed: Pan, pending: Pan): Pan => {
  const totals: Pan = {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0,
  };
  for (const color of COLORS) {
    totals[color] = committed[color] + pending[color];
  }
  return totals;
};

const pairOverlap = (left: Pan, right: Pan): Pan => {
  const overlap: Pan = {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0,
  };
  for (const color of COLORS) {
    overlap[color] = Math.min(left[color], right[color]);
  }
  return overlap;
};

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

const ScaleCard = ({
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
  const pans: Array<{ side: Side; label: string }> = [
    { side: "left", label: copy.leftPan },
    { side: "right", label: copy.rightPan },
  ];
  const leftPending = countPlacements(pending, scaleId, "left");
  const rightPending = countPlacements(pending, scaleId, "right");
  const overlap = pairOverlap(
    combinedPan(committed.left, leftPending),
    combinedPan(committed.right, rightPending),
  );

  return (
    <section className={styles.scaleCard} aria-label={title}>
      <h2 className={styles.heading}>{title}</h2>
      <p className={styles.outcome} aria-live="polite">
        {copy.outcomes[outcome]}
      </p>
      <div className={styles.stage}>
        <div className={`${styles.beam} ${tiltClassName(outcome)}`} />
        <div className={styles.base} />
      </div>
      <div className={styles.pans}>
        {pans.map(({ side, label }) => {
          const selected = selectedSide === side;
          const tokens = tokensFor(
            committed[side],
            countPlacements(pending, scaleId, side),
          );
          const seen: Pan = {
            red: 0,
            yellow: 0,
            green: 0,
            blue: 0,
            purple: 0,
          };
          return (
            <div key={side} className={styles.panColumn}>
              <button
                type="button"
                className={`${styles.sideButton} ${selected ? styles.sideSelected : ""}`}
                aria-pressed={selected}
                disabled={!interactive}
                onClick={() => onSelect(side)}
              >
                {label}
              </button>
              <div
                className={`${styles.pan} ${selected ? styles.panSelected : ""}`}
              >
                {tokens.map((token) => {
                  const order = seen[token.color];
                  seen[token.color] += 1;
                  const ghost = ghostPairs && order < overlap[token.color];
                  const ghostLabel = ghost ? `, ${copy.ghostedBlock}` : "";
                  return token.pending ? (
                    <button
                      key={`${token.color}-pending-${token.index}`}
                      type="button"
                      className={`${styles.token} ${colorClassName(token.color)} ${styles.pendingToken} ${ghost ? styles.ghostToken : ""}`}
                      aria-label={`${copy.removePending(copy.colors[token.color])}${ghostLabel}`}
                      disabled={!interactive}
                      onClick={() => onRemove(side, token.color)}
                    >
                      {copy.short[token.color]}
                    </button>
                  ) : (
                    <span
                      key={`${token.color}-set-${token.index}`}
                      className={`${styles.token} ${colorClassName(token.color)} ${ghost ? styles.ghostToken : ""}`}
                    >
                      <span aria-hidden="true">{copy.short[token.color]}</span>
                      <span className={styles.srOnly}>
                        {copy.colors[token.color]}
                        {ghostLabel}
                      </span>
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

type OrderBoardProps = {
  challenge: Challenge;
  order: Array<Color | null>;
  picked: Color | null;
  guess: Record<Color, string>;
  interactive: boolean;
  copy: GameTranslation;
  onPick: (color: Color) => void;
  onPlace: (index: number) => void;
  onWeight: (color: Color, value: string) => void;
};

const OrderBoard = ({
  challenge,
  order,
  picked,
  guess,
  interactive,
  copy,
  onPick,
  onPlace,
  onWeight,
}: OrderBoardProps) => {
  const unplaced = COLORS.filter((color) => !order.includes(color));

  const weightControl = (color: Color) => {
    if (challenge.revealed.includes(color)) {
      return (
        <span className={styles.knownGrams}>
          {copy.knownWeight(challenge.weights[color])}
        </span>
      );
    }
    return (
      <input
        className={styles.draft}
        inputMode="numeric"
        autoComplete="off"
        aria-label={copy.draftWeight(copy.colors[color])}
        value={guess[color]}
        disabled={!interactive}
        onChange={(event) =>
          onWeight(color, event.target.value.replace(/\D/g, ""))
        }
      />
    );
  };

  const chip = (color: Color) => (
    <button
      type="button"
      className={`${styles.orderChip} ${colorClassName(color)} ${picked === color ? styles.orderChipSelected : ""}`}
      aria-pressed={picked === color}
      aria-label={copy.orderPick(copy.colors[color])}
      disabled={!interactive}
      onClick={() => onPick(color)}
    >
      {copy.short[color]} {copy.colors[color]}
    </button>
  );

  return (
    <section className={styles.order} aria-label={copy.orderTitle}>
      <h2 className={styles.heading}>{copy.orderTitle}</h2>
      <Text>{copy.orderHint}</Text>
      <div className={styles.chain}>
        {SLOT_KEYS.map((slotKey) => {
          const index = SLOT_KEYS.indexOf(slotKey);
          const color = order[index];
          const fixed = slotIsFixed(challenge, index);
          return (
            <div key={slotKey} className={styles.chainItem}>
              <div
                className={`${styles.slot} ${color ? styles.slotFilled : ""} ${fixed ? styles.slotFixed : ""} ${picked && !fixed ? styles.slotReady : ""}`}
              >
                {color ? (
                  <>
                    {fixed ? (
                      <span
                        className={`${styles.orderChip} ${colorClassName(color)}`}
                      >
                        {copy.short[color]} {copy.colors[color]}
                      </span>
                    ) : (
                      chip(color)
                    )}
                    {weightControl(color)}
                    {fixed ? (
                      <span className={styles.srOnly}>{copy.orderMiddle}</span>
                    ) : null}
                  </>
                ) : (
                  <button
                    type="button"
                    className={styles.emptySlot}
                    disabled={!interactive}
                    aria-label={copy.orderEmpty(index + 1)}
                    onClick={() => onPlace(index)}
                  >
                    _
                  </button>
                )}
              </div>
              {index < SLOT_KEYS.length - 1 ? (
                <span className={styles.relation} aria-hidden="true">
                  &gt;
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {unplaced.length > 0 ? (
        <div className={styles.tray}>
          <span className={styles.trayLabel}>{copy.orderTray}</span>
          {unplaced.map((color) => (
            <div key={color} className={styles.trayChip}>
              {chip(color)}
              {weightControl(color)}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

const ScaleGame = () => {
  const copy = useTranslation(translations);
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [pending, setPending] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<{ scale: ScaleId; side: Side }>({
    scale: "main",
    side: "left",
  });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [notes, setNotes] = useState("");
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [guess, setGuess] = useState(emptyGuess());
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [ghostPairs, setGhostPairs] = useState(false);
  const [order, setOrder] = useState<Array<Color | null>>(emptyOrder);
  const [picked, setPicked] = useState<Color | null>(null);
  const [resigning, setResigning] = useState(false);

  const config =
    DIFFICULTIES[challenge?.difficulty ?? (difficulty || "normal")];
  const solved = challenge
    ? mainIsSolved(board.main, challenge.weights)
    : false;
  const interactive = phase === "playing";
  const remaining = copiesLeft(config.copies, board, pending);

  const startGame = () => {
    if (!difficulty) {
      return;
    }
    const next = createChallenge(difficulty);
    const nextConfig = DIFFICULTIES[difficulty];
    setChallenge(next);
    setBoard(emptyBoard());
    setPending([]);
    setSelected({ scale: "main", side: "left" });
    setHistory([]);
    setNotes("");
    setGuessesLeft(nextConfig.guesses);
    setGuess(guessFromChallenge(next));
    setOrder(orderFromChallenge(next));
    setPicked(null);
    setResigning(false);
    setPhase("playing");
    setFeedback(null);
  };

  const fixedColor =
    challenge && config.medianReveal ? (challenge.revealed[0] ?? null) : null;

  const moveColor = (color: Color, toIndex: number | null) => {
    if (!interactive || !challenge || color === fixedColor) {
      return;
    }
    if (toIndex !== null && slotIsFixed(challenge, toIndex)) {
      return;
    }
    setOrder((current) => {
      const next = [...current];
      const fromIndex = next.indexOf(color);
      if (toIndex === null) {
        if (fromIndex >= 0) {
          next[fromIndex] = null;
        }
        return next;
      }
      if (fromIndex === toIndex) {
        return current;
      }
      const occupant = next[toIndex];
      if (occupant && occupant === fixedColor) {
        return current;
      }
      next[toIndex] = color;
      if (fromIndex >= 0) {
        next[fromIndex] = occupant ?? null;
      }
      return next;
    });
    setPicked(null);
  };

  const pickColor = (color: Color) => {
    if (!interactive || !challenge || color === fixedColor) {
      return;
    }
    if (picked === color) {
      if (order.includes(color)) {
        moveColor(color, null);
        return;
      }
      setPicked(null);
      return;
    }
    if (picked) {
      const destination = order.indexOf(color);
      if (destination >= 0) {
        moveColor(picked, destination);
        return;
      }
    }
    setPicked((current) => (current === color ? null : color));
  };

  const placePicked = (index: number) => {
    if (!interactive || !challenge) {
      return;
    }
    if (picked) {
      moveColor(picked, index);
      return;
    }
    const occupant = order[index];
    if (occupant && occupant !== fixedColor) {
      setPicked(occupant);
    }
  };

  const place = (color: Color) => {
    if (!interactive) {
      return;
    }
    if (remaining[color] <= 0) {
      setFeedback({ text: copy.noBlocks, good: false });
      return;
    }
    setPending((current) => [
      ...current,
      { scale: selected.scale, side: selected.side, color },
    ]);
    setFeedback(null);
  };

  const undo = () => {
    if (!interactive || pending.length === 0) {
      return;
    }
    setPending((current) => withoutLastPlacement(current));
    setFeedback(null);
  };

  const clearPending = () => {
    setPending([]);
    setFeedback(null);
  };

  const removePending = (scale: ScaleId, side: Side, color: Color) => {
    if (!interactive) {
      return;
    }
    setPending((current) =>
      withoutLastPlacement(current, { scale, side, color }),
    );
  };

  const commitMove = () => {
    if (!challenge || !interactive) {
      return;
    }
    if (!canCommit(pending.length, config.minPlace)) {
      setFeedback({ text: copy.needMore(config.minPlace), good: false });
      return;
    }
    const nextBoard = addBoards(board, boardFromPlacements(pending));
    const solvedNext = mainIsSolved(nextBoard.main, challenge.weights);
    const canMove = unusedBlocks(config.copies, nextBoard) >= config.minPlace;
    const nextPhase = resultIfStuck(
      solvedNext,
      canMove,
      guessesLeft,
      config.partialCounts,
    );
    setBoard(nextBoard);
    setHistory((current) => [
      ...current,
      {
        id: current.length + 1,
        added: [...pending],
        main: reportOutcome(nextBoard.main, challenge.weights),
        secondary: reportOutcome(nextBoard.secondary, challenge.weights),
      },
    ]);
    setPending([]);
    if (nextPhase !== "playing") {
      setPhase(nextPhase);
      setFeedback(null);
      return;
    }
    if (solvedNext) {
      setFeedback({
        text: config.partialCounts
          ? copy.statusSolvedPartial
          : copy.statusSolved,
        good: true,
      });
      return;
    }
    if (
      blockCount(nextBoard.main.left) > 0 &&
      blockCount(nextBoard.main.right) > 0 &&
      samePattern(nextBoard.main.left, nextBoard.main.right)
    ) {
      setFeedback({ text: copy.samePattern, good: false });
      return;
    }
    setFeedback(null);
  };

  const submitGuess = () => {
    if (!challenge || !interactive || !solved) {
      return;
    }
    const parsed = parseGuess(guess, config.minWeight, config.maxWeight);
    if (!parsed) {
      setFeedback({
        text: copy.invalidGuess(config.minWeight, config.maxWeight),
        good: false,
      });
      return;
    }
    const correct = guessIsCorrect(challenge.weights, parsed);
    const left = guessesLeft - 1;
    const nextPhase = resultAfterGuess(correct, left, config.partialCounts);
    setGuessesLeft(left);
    if (nextPhase === "playing") {
      setFeedback({ text: copy.wrongGuess, good: false });
      return;
    }
    setPending([]);
    setPhase(nextPhase);
    setFeedback(null);
  };

  const finishPartial = () => {
    if (!challenge || !interactive || !solved || !config.partialCounts) {
      return;
    }
    setPending([]);
    setPhase("partial");
    setFeedback(null);
  };

  const resign = () => {
    if (!challenge || !interactive) {
      return;
    }
    setPending([]);
    setResigning(false);
    setPhase("failure");
    setFeedback(null);
  };

  return (
    <PageWrapper fullScreen>
      <div className={styles.topBar}>
        <BackButton href="/projects" text={copy.back} />
        <LanguageSwitcher />
      </div>
      <SectionHeader>{copy.title}</SectionHeader>
      <Text className={styles.intro} align="center">
        {copy.intro}
      </Text>
      <Stack className={styles.game} gap={14}>
        <Collapsible title={copy.controlsTitle} defaultOpen>
          <div className={styles.controlStack}>
            <select
              id="scale-difficulty"
              className={`${styles.select} ${difficulty ? "" : styles.selectPending}`}
              aria-label={copy.difficultyLabel}
              value={difficulty}
              onChange={(event) => {
                const value = event.target.value;
                if (isDifficulty(value)) {
                  setDifficulty(value);
                }
              }}
            >
              <option value="" disabled>
                {copy.difficultyPlaceholder}
              </option>
              {DIFFICULTY_IDS.map((id) => (
                <option key={id} value={id}>
                  {copy.difficulties[id]}
                </option>
              ))}
            </select>
            <Button onClick={startGame} disabled={!difficulty}>
              {copy.newGame}
            </Button>
            {interactive ? (
              <Popover
                className={styles.popoverAnchor}
                open={resigning}
                onOpenChange={setResigning}
                label={copy.resignPrompt}
                trigger={<Button variant="secondary">{copy.resign}</Button>}
              >
                <p className={styles.resignPrompt}>{copy.resignPrompt}</p>
                <Button onClick={resign}>{copy.resignYes}</Button>
                <Button variant="secondary" onClick={() => setResigning(false)}>
                  {copy.resignNo}
                </Button>
              </Popover>
            ) : null}
            {challenge ? (
              <span
                className={`${styles.puzzleBadge} ${styles[challenge.difficulty]}`}
              >
                {copy.thisPuzzle(copy.difficulties[challenge.difficulty])}
              </span>
            ) : null}
          </div>
        </Collapsible>
        <Collapsible title={copy.rulesTitle} defaultOpen>
          <ul className={styles.rulesList}>
            {copy.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          {difficulty ? <Text>{copy.difficultyDetail[difficulty]}</Text> : null}
        </Collapsible>
        <Collapsible title={copy.settingsTitle}>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={ghostPairs}
              onChange={(event) => setGhostPairs(event.target.checked)}
            />
            {copy.ghostPairs}
          </label>
        </Collapsible>
        {challenge ? (
          <>
            {config.medianReveal
              ? challenge.revealed.map((color) => (
                  <Text key={color}>{copy.medianClue(copy.colors[color])}</Text>
                ))
              : null}
            <p className={styles.hint}>{copy.howToPlace}</p>
            <Text>
              {copy.placingOn(
                selected.scale === "main" ? copy.mainScale : copy.secondScale,
                selected.side === "left" ? copy.leftPan : copy.rightPan,
              )}
            </Text>
            <div className={styles.controls}>
              <Button
                onClick={commitMove}
                disabled={
                  !interactive || !canCommit(pending.length, config.minPlace)
                }
              >
                {copy.commit}
              </Button>
              <Button
                variant="secondary"
                onClick={undo}
                disabled={!interactive || pending.length === 0}
              >
                {copy.undo}
              </Button>
              <Button
                variant="secondary"
                onClick={clearPending}
                disabled={!interactive || pending.length === 0}
              >
                {copy.clearPending}
              </Button>
            </div>
            <div className={styles.inventoryRow}>
              <section aria-label={copy.inventoryLabel}>
                <div className={styles.inventory}>
                  {COLORS.map((color) => {
                    const weightLabel = challenge.revealed.includes(color)
                      ? copy.knownWeight(challenge.weights[color])
                      : copy.unknownWeight;
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.block} ${colorClassName(color)}`}
                        disabled={!interactive || remaining[color] <= 0}
                        aria-label={copy.placeBlock(
                          copy.colors[color],
                          weightLabel,
                          remaining[color],
                        )}
                        onClick={() => place(color)}
                      >
                        {remaining[color]}
                      </button>
                    );
                  })}
                </div>
              </section>
              <span className={styles.pill}>
                {copy.staged(pending.length, config.minPlace)}
              </span>
            </div>
            <p
              className={`${styles.feedback} ${feedback?.good ? styles.good : ""} ${feedback && !feedback.good ? styles.bad : ""}`}
              aria-live="polite"
              hidden={!feedback}
            >
              {feedback?.text ?? ""}
            </p>
            {!interactive && phase !== "idle" ? (
              <section
                className={styles.answerBlock}
                aria-label={copy.revealTitle}
              >
                <h2 className={styles.heading}>{copy.revealTitle}</h2>
                <div className={styles.answers}>
                  {[...COLORS]
                    .sort(
                      (left, right) =>
                        challenge.weights[right] - challenge.weights[left],
                    )
                    .map((color) => (
                      <div
                        key={color}
                        className={`${styles.answerBox} ${colorClassName(color)}`}
                      >
                        <span className={styles.answerWeight}>
                          {copy.knownWeight(challenge.weights[color])}
                        </span>
                        <span className={styles.answerName}>
                          {copy.colors[color]}
                        </span>
                      </div>
                    ))}
                </div>
              </section>
            ) : null}
            <div className={styles.scales}>
              <ScaleCard
                title={copy.mainScale}
                scaleId="main"
                committed={board.main}
                pending={pending}
                outcome={reportOutcome(board.main, challenge.weights)}
                selectedSide={selected.scale === "main" ? selected.side : null}
                interactive={interactive}
                ghostPairs={ghostPairs}
                copy={copy}
                onSelect={(side) => setSelected({ scale: "main", side })}
                onRemove={(side, color) => removePending("main", side, color)}
              />
              <ScaleCard
                title={copy.secondScale}
                scaleId="secondary"
                committed={board.secondary}
                pending={pending}
                outcome={reportOutcome(board.secondary, challenge.weights)}
                selectedSide={
                  selected.scale === "secondary" ? selected.side : null
                }
                interactive={interactive}
                ghostPairs={ghostPairs}
                copy={copy}
                onSelect={(side) => setSelected({ scale: "secondary", side })}
                onRemove={(side, color) =>
                  removePending("secondary", side, color)
                }
              />
            </div>
            <p className={styles.hint}>{copy.resultNote}</p>
            <OrderBoard
              challenge={challenge}
              order={order}
              picked={picked}
              guess={guess}
              interactive={interactive}
              copy={copy}
              onPick={pickColor}
              onPlace={placePicked}
              onWeight={(color, value) => {
                setGuess((current) => ({ ...current, [color]: value }));
              }}
            />
            {interactive && solved ? (
              <div className={styles.controls}>
                <Button onClick={submitGuess}>{copy.submitGuess}</Button>
                {config.partialCounts ? (
                  <Button variant="secondary" onClick={finishPartial}>
                    {copy.takePartial}
                  </Button>
                ) : null}
              </div>
            ) : null}
            <div>
              <label className={styles.label} htmlFor="scale-notes">
                {copy.notesLabel}
              </label>
              <textarea
                id="scale-notes"
                className={styles.notes}
                value={notes}
                placeholder={copy.notesPlaceholder}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <section aria-label={copy.historyTitle}>
              <h2 className={styles.heading}>{copy.historyTitle}</h2>
              {history.length === 0 ? (
                <Text>{copy.historyEmpty}</Text>
              ) : (
                <ol className={styles.history}>
                  {history.map((entry) => (
                    <li key={entry.id} className={styles.historyItem}>
                      <strong>{copy.moveLabel(entry.id)}</strong>
                      <span>
                        {copy.mainScale}:{" "}
                        {describeAdded(entry.added, "main", copy)} —{" "}
                        {copy.outcomes[entry.main]}
                      </span>
                      <span>
                        {copy.secondScale}:{" "}
                        {describeAdded(entry.added, "secondary", copy)} —{" "}
                        {copy.outcomes[entry.secondary]}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        ) : null}
      </Stack>
    </PageWrapper>
  );
};

export default ScaleGame;
