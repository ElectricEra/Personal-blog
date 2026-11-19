import { useEffect, useRef, useState } from "react";
import { FaGear } from "react-icons/fa6";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";

import { BackButton } from "@/components/BackButton/BackButton";
import { Collapsible } from "@/components/Collapsible/Collapsible";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { Modal } from "@/components/Modal/Modal";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import { Popover } from "@/components/Popover/Popover";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Select } from "@/components/Select/Select";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { cx } from "@/utils/cx";
import { useTranslation } from "@/utils/i18n";

import {
  BOARD_SIZE,
  generateRound,
  LETTERS,
  neighbors,
  type Round,
  sumPath,
} from "./game";
import styles from "./index.module.css";
import { translations } from "./translations";

type Phase = "idle" | "memorize" | "play";
type MemorizeSeconds = 0 | 15 | 30 | 60;

type Feedback = {
  text: string;
  good: boolean;
};

const MEMORIZE_VALUES: MemorizeSeconds[] = [60, 30, 15, 0];

const letterAt = (index: number) => LETTERS[index] ?? "";

const isMemorizeSeconds = (value: number): value is MemorizeSeconds =>
  value === 0 || value === 15 || value === 30 || value === 60;

const MemoryPath = () => {
  const copy = useTranslation(translations);
  const boardRef = useRef<HTMLHeadingElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Round | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [solvedRound, setSolvedRound] = useState(false);
  const [checked, setChecked] = useState(false);
  const [seconds, setSeconds] = useState<MemorizeSeconds>(60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [notes, setNotes] = useState("");
  const [highlightMoves, setHighlightMoves] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);

  const numbers = round?.numbers ?? [];
  const solution = round?.solution ?? [];
  const startIndex = solution[0];
  const endIndex = solution[solution.length - 1];
  const startLetter = startIndex === undefined ? "" : letterAt(startIndex);
  const endLetter = endIndex === undefined ? "" : letterAt(endIndex);
  const target = round ? sumPath(numbers, solution) : 0;
  const showNumbers = phase === "memorize" || revealed;
  const interactive = phase === "play" && !revealed;
  const pathReady =
    path.length > 1 &&
    path[0] === startIndex &&
    path[path.length - 1] === endIndex;

  const legalCells = (() => {
    if (!highlightMoves || !interactive || startIndex === undefined) {
      return new Set<number>();
    }
    if (path.length === 0) {
      return new Set([startIndex]);
    }
    const last = path[path.length - 1];
    if (last === undefined || last === endIndex) {
      return new Set<number>();
    }
    return new Set(neighbors(last).filter((cell) => !path.includes(cell)));
  })();

  useEffect(() => {
    if (!round) {
      return;
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    boardRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [round]);

  useEffect(() => {
    if (phase !== "memorize" || deadline === null) {
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining((current) => (current === left ? current : left));
      if (left === 0) {
        setPhase("play");
        setDeadline(null);
      }
    };
    tick();
    const timerId = setInterval(tick, 150);
    return () => clearInterval(timerId);
  }, [phase, deadline]);

  const startGame = () => {
    const nextRound = generateRound();
    setRound(nextRound);
    setPath([]);
    setRevealed(false);
    setSolvedRound(false);
    setChecked(false);
    setFeedback(null);
    setNotes("");
    setRevealOpen(false);
    setHintOpen(false);
    if (seconds === 0) {
      setPhase("play");
      setDeadline(null);
      setRemaining(null);
      return;
    }
    setPhase("memorize");
    setRemaining(seconds);
    setDeadline(Date.now() + seconds * 1000);
  };

  const flipBoard = () => {
    if (phase !== "memorize") {
      return;
    }
    setPhase("play");
    setDeadline(null);
  };

  const clearFeedback = () => setFeedback(null);

  const chooseCell = (index: number) => {
    if (phase !== "play" || revealed || startIndex === undefined) {
      return;
    }
    const last = path[path.length - 1];
    if (path.length > 0 && index === last) {
      setPath((current) => current.slice(0, -1));
      setChecked(false);
      setSolvedRound(false);
      clearFeedback();
      return;
    }
    if (path.length === 0) {
      if (index !== startIndex) {
        setFeedback({ text: copy.startAt(startLetter), good: false });
        return;
      }
      setPath([index]);
    } else if (path.includes(index)) {
      setFeedback({
        text: copy.visitTwice,
        good: false,
      });
      return;
    } else if (last === undefined || !neighbors(last).includes(index)) {
      setFeedback({
        text: copy.adjacentOnly,
        good: false,
      });
      return;
    } else if (last === endIndex) {
      setFeedback({
        text: copy.endMustBeLast,
        good: false,
      });
      return;
    } else {
      setPath((current) => [...current, index]);
    }
    setChecked(false);
    setSolvedRound(false);
    clearFeedback();
  };

  const checkPath = () => {
    if (!round || startIndex === undefined || endIndex === undefined) {
      return;
    }
    setChecked(true);
    if (path.length === 0 || path[0] !== startIndex) {
      setFeedback({
        text: copy.startAtMarked,
        good: false,
      });
      return;
    }
    if (path[path.length - 1] !== endIndex) {
      setFeedback({
        text: copy.endAtMarked,
        good: false,
      });
      return;
    }
    if (sumPath(numbers, path) !== target) {
      setSolvedRound(false);
      setFeedback({
        text: copy.wrongRoute,
        good: false,
      });
      return;
    }
    setSolvedRound(true);
    setRevealed(true);
    setFeedback({
      text: copy.solvedMessage,
      good: true,
    });
  };

  const undo = () => {
    if (path.length === 0 || revealed) {
      return;
    }
    setPath((current) => current.slice(0, -1));
    setChecked(false);
    setSolvedRound(false);
    clearFeedback();
  };

  const clearPath = () => {
    if (revealed) {
      return;
    }
    setPath([]);
    setChecked(false);
    setSolvedRound(false);
    clearFeedback();
  };

  const confirmReveal = () => {
    setRevealed(true);
    setRevealOpen(false);
    setFeedback({
      text: copy.numbersRevealed,
      good: false,
    });
  };

  const hideNumbers = () => {
    setRevealed(false);
    setFeedback({
      text: copy.numbersHidden,
      good: false,
    });
  };

  const showingRoute = phase === "play" && round !== null;
  const statusText = showingRoute
    ? copy.routeStatus(startLetter, endLetter, target)
    : copy.routePlaceholder;

  const detailText =
    phase === "memorize"
      ? copy.memorizeHelp
      : phase === "play" && round
        ? copy.routeDetail(startLetter, endLetter, target)
        : "";

  const pathSum = sumPath(numbers, path);
  const pathLabel = path.length
    ? path.map((index) => letterAt(index)).join(" → ")
    : "—";

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
        <div className={styles.controlRow}>
          <Select
            id="memorize-seconds"
            aria-label={copy.memorizeLabel}
            value={seconds}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (isMemorizeSeconds(value)) {
                setSeconds(value);
              }
            }}
          >
            {MEMORIZE_VALUES.map((value) => (
              <option key={value} value={value}>
                {copy.memorizeOptions[value]}
              </option>
            ))}
          </Select>
          <PhysicalButton onClick={startGame}>{copy.newBoard}</PhysicalButton>
          {phase === "memorize" ? (
            <PhysicalButton
              variant="secondary"
              className={styles.extraAction}
              onClick={flipBoard}
            >
              {copy.flipNow}
            </PhysicalButton>
          ) : null}
          <PhysicalButton
            variant="secondary"
            className={styles.iconButton}
            aria-label={copy.settingsTitle}
            aria-haspopup="dialog"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen(true)}
          >
            <FaGear aria-hidden="true" />
          </PhysicalButton>
        </div>
        <Collapsible title={copy.rulesTitle} defaultOpen>
          <ul className={styles.rulesList}>
            {copy.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className={styles.starting}>
            <h3 className={styles.startingTitle}>{copy.startingTitle}</h3>
            <Text>{copy.memorizePreview[seconds]}</Text>
          </div>
        </Collapsible>
        {round ? (
          <>
            <div className={styles.boardTitle}>
              <h2 ref={boardRef} className={styles.information}>
                {copy.boardTitle}
              </h2>
              <Popover
                className={styles.hintTip}
                panelClassName={styles.hintBubble}
                open={hintOpen}
                onOpenChange={setHintOpen}
                label={copy.moveHint}
                trigger={
                  <button
                    type="button"
                    className={styles.hintButton}
                    aria-label={copy.moveHint}
                  >
                    <HiOutlineQuestionMarkCircle aria-hidden />
                  </button>
                }
              >
                <p className={styles.hint}>{copy.howToMove}</p>
              </Popover>
            </div>
            <p
              className={cx(
                styles.status,
                !showingRoute && styles.statusPlaceholder,
              )}
              aria-label={showingRoute ? undefined : copy.routePlaceholderLabel}
            >
              {statusText}
            </p>
            <p className={styles.detail}>{detailText}</p>
            {phase === "memorize" && remaining !== null ? (
              <div className={styles.metaRow}>
                <span className={styles.pill} aria-live="polite">
                  {copy.secondsRemaining(remaining)}
                </span>
              </div>
            ) : null}
            <section className={styles.board} aria-label={copy.boardLabel}>
              {Array.from({ length: BOARD_SIZE }, (_, index) => {
                const order = path.indexOf(index);
                const onPath = phase === "play" && order >= 0;
                const isStart = phase === "play" && index === startIndex;
                const isEnd = phase === "play" && index === endIndex;
                const isNext = legalCells.has(index);
                const letter = letterAt(index);
                const number = numbers[index];
                const labelParts = [
                  showNumbers && number !== undefined
                    ? copy.cellWithNumber(letter, number)
                    : copy.cell(letter),
                ];
                if (isStart) {
                  labelParts.push(copy.cellStart);
                }
                if (isEnd) {
                  labelParts.push(copy.cellEnd);
                }
                if (onPath) {
                  labelParts.push(copy.cellStep(order + 1));
                }
                if (isNext) {
                  labelParts.push(copy.cellNext);
                }
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!interactive}
                    aria-label={labelParts.join(", ")}
                    className={cx(
                      styles.cell,
                      interactive && styles.interactive,
                      isStart && styles.start,
                      isEnd && styles.end,
                      onPath && styles.selected,
                      onPath && !solvedRound && styles.draft,
                      isNext && styles.cellReady,
                    )}
                    onClick={() => chooseCell(index)}
                  >
                    {showNumbers && number !== undefined ? number : letter}
                    {onPath ? (
                      <span className={styles.step} aria-hidden="true">
                        {order + 1}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </section>
            {phase === "play" ? (
              <>
                <hr className={styles.separator} />
                <div className={styles.results}>
                  <span className={styles.path}>{copy.path(pathLabel)}</span>
                  <span className={styles.pill}>{copy.steps(path.length)}</span>
                </div>
                <p className={styles.total}>
                  {checked ? copy.total(pathSum, target) : copy.totalHidden}
                </p>
                <div className={cx(styles.controls, styles.moveControls)}>
                  <PhysicalButton
                    variant="secondary"
                    onClick={undo}
                    disabled={path.length === 0 || revealed}
                  >
                    {copy.undo}
                  </PhysicalButton>
                  <PhysicalButton
                    variant="secondary"
                    onClick={clearPath}
                    disabled={path.length === 0 || revealed}
                  >
                    {copy.clearPath}
                  </PhysicalButton>
                  {revealed ? (
                    <PhysicalButton variant="secondary" onClick={hideNumbers}>
                      {copy.hideNumbers}
                    </PhysicalButton>
                  ) : (
                    <Popover
                      className={styles.stretchAnchor}
                      open={revealOpen}
                      onOpenChange={setRevealOpen}
                      label={copy.revealPrompt}
                      trigger={
                        <PhysicalButton variant="secondary">
                          {copy.showNumbers}
                        </PhysicalButton>
                      }
                    >
                      <p className={styles.revealPrompt}>{copy.revealPrompt}</p>
                      <PhysicalButton onClick={confirmReveal}>
                        {copy.revealYes}
                      </PhysicalButton>
                      <PhysicalButton
                        variant="secondary"
                        onClick={() => setRevealOpen(false)}
                      >
                        {copy.revealNo}
                      </PhysicalButton>
                    </Popover>
                  )}
                </div>
                <p
                  className={cx(
                    styles.feedback,
                    feedback?.good && styles.good,
                    feedback && !feedback.good && styles.bad,
                  )}
                  aria-live="polite"
                  hidden={!feedback}
                >
                  {feedback?.text ?? ""}
                </p>
                {interactive && pathReady ? (
                  <div className={cx(styles.controls, styles.centeredControls)}>
                    <PhysicalButton onClick={checkPath}>
                      {copy.checkPath}
                    </PhysicalButton>
                  </div>
                ) : null}
              </>
            ) : null}
            <hr className={styles.separator} />
            <div>
              <label className={styles.label} htmlFor="memory-path-notes">
                {copy.notesLabel}
              </label>
              <textarea
                id="memory-path-notes"
                className={styles.notes}
                value={notes}
                placeholder={copy.notesPlaceholder}
                autoComplete="off"
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
          </>
        ) : null}
      </Stack>
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={copy.settingsTitle}
        closeLabel={copy.close}
      >
        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            checked={highlightMoves}
            onChange={(event) => setHighlightMoves(event.target.checked)}
          />
          {copy.highlightMoves}
        </label>
      </Modal>
    </PageWrapper>
  );
};

export default MemoryPath;
