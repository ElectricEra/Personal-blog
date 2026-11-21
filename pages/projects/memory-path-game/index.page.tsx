import { useEffect, useRef, useState } from "react";
import { FaGear } from "react-icons/fa6";

import { Collapsible } from "@/components/Collapsible/Collapsible";
import { Modal } from "@/components/Modal/Modal";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import { Popover } from "@/components/Popover/Popover";
import { RightBar } from "@/components/RightBar/RightBar";
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
type AttemptResult = "correct" | "wrong" | "start" | "end";

type Attempt = {
  id: number;
  label: string;
  sum: number;
  result: AttemptResult;
};

const MEMORIZE_VALUES: MemorizeSeconds[] = [60, 30, 15, 0];

const isMemorizeSeconds = (value: number): value is MemorizeSeconds =>
  MEMORIZE_VALUES.some((seconds) => seconds === value);

const letterAt = (index: number) => LETTERS[index] ?? "";

const FormulaMaze = () => {
  const copy = useTranslation(translations);
  const informationRef = useRef<HTMLHeadingElement>(null);
  const pendingScroll = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Round | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [seconds, setSeconds] = useState<MemorizeSeconds>(60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    good: boolean;
  } | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMoves, setShowMoves] = useState(false);

  const numbers = round?.numbers ?? [];
  const solution = round?.solution ?? [];
  const startIndex = solution[0];
  const endIndex = solution[solution.length - 1];
  const startLetter = startIndex === undefined ? "" : letterAt(startIndex);
  const endLetter = endIndex === undefined ? "" : letterAt(endIndex);
  const target = round ? sumPath(numbers, solution) : 0;
  const showNumbers = phase === "memorize" || revealed;
  const interactive = phase === "play" && !revealed;
  const lastIndex = path[path.length - 1];

  const legalIndexes = new Set<number>();
  if (showMoves && interactive && startIndex !== undefined) {
    if (path.length === 0) {
      legalIndexes.add(startIndex);
    } else if (lastIndex !== undefined && lastIndex !== endIndex) {
      for (const index of neighbors(lastIndex)) {
        if (!path.includes(index)) {
          legalIndexes.add(index);
        }
      }
    }
  }

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

  useEffect(() => {
    if (!round || !pendingScroll.current || !informationRef.current) {
      return;
    }
    pendingScroll.current = false;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    informationRef.current.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [round]);

  const startGame = () => {
    const nextRound = generateRound();
    setRound(nextRound);
    setPath([]);
    setRevealed(false);
    setChecked(false);
    setFeedback(null);
    setAttempts([]);
    setRevealing(false);
    pendingScroll.current = true;
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
    clearFeedback();
  };

  const checkPath = () => {
    if (!round || startIndex === undefined || endIndex === undefined) {
      return;
    }
    const label = path.length
      ? path.map((index) => letterAt(index)).join(" → ")
      : "—";
    const sum = sumPath(numbers, path);
    let result: AttemptResult;
    if (path.length === 0 || path[0] !== startIndex) {
      result = "start";
      setFeedback({ text: copy.startAtMarked, good: false });
    } else if (path[path.length - 1] !== endIndex) {
      result = "end";
      setFeedback({ text: copy.endAtMarked, good: false });
    } else if (sum !== target) {
      result = "wrong";
      setFeedback({ text: copy.wrongRoute, good: false });
    } else {
      result = "correct";
      setRevealed(true);
      setRevealing(false);
      setFeedback({ text: copy.solvedMessage, good: true });
    }
    setChecked(true);
    setAttempts((current) => [
      ...current,
      { id: current.length + 1, label, sum, result },
    ]);
  };

  const undo = () => {
    if (path.length === 0 || revealed) {
      return;
    }
    setPath((current) => current.slice(0, -1));
    setChecked(false);
    clearFeedback();
  };

  const clearPath = () => {
    if (revealed) {
      return;
    }
    setPath([]);
    setChecked(false);
    clearFeedback();
  };

  const toggleReveal = () => {
    const nextRevealed = !revealed;
    setRevealed(nextRevealed);
    setRevealing(false);
    setFeedback({
      text: nextRevealed ? copy.numbersRevealed : copy.numbersHidden,
      good: false,
    });
  };

  const statusText =
    phase === "memorize"
      ? copy.memorizeStatus
      : phase === "play" && round
        ? copy.routeStatus(startLetter, endLetter, target)
        : "";

  const detailText =
    phase === "memorize"
      ? copy.memorizeDetail
      : phase === "play" && round
        ? copy.routeDetail(startLetter, endLetter, target)
        : "";

  const pathSum = sumPath(numbers, path);

  return (
    <PageWrapper fullScreen>
      <SectionHeader>{copy.title}</SectionHeader>
      <Text className={styles.intro} align="center">
        {copy.intro}
      </Text>
      <Stack className={styles.game} gap={14}>
        <RightBar title={copy.controlsTitle}>
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
            <Popover
              className={styles.stretchAnchor}
              panelClassName={styles.revealPanel}
              open={interactive && revealing}
              onOpenChange={setRevealing}
              label={copy.revealPrompt}
              trigger={
                <PhysicalButton
                  variant="secondary"
                  disabled={phase !== "play"}
                  onClick={(event) => {
                    if (revealed) {
                      event.preventDefault();
                      toggleReveal();
                    }
                  }}
                >
                  {revealed ? copy.hide : copy.reveal}
                </PhysicalButton>
              }
            >
              <p className={styles.revealPrompt}>{copy.revealPrompt}</p>
              <PhysicalButton onClick={toggleReveal}>
                {copy.revealYes}
              </PhysicalButton>
              <PhysicalButton
                variant="secondary"
                onClick={() => setRevealing(false)}
              >
                {copy.revealNo}
              </PhysicalButton>
            </Popover>
            <PhysicalButton
              variant="secondary"
              className={styles.iconButton}
              aria-label={copy.settingsTitle}
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen(true)}
            >
              <FaGear aria-hidden="true" />
              <span className={styles.settingsText}>{copy.settingsTitle}</span>
            </PhysicalButton>
          </div>
        </RightBar>
        <Collapsible title={copy.rulesTitle} defaultOpen>
          <ul className={styles.rulesList}>
            {copy.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
          <div className={styles.starting}>
            <h3 className={styles.startingTitle}>{copy.startingTitle}</h3>
            <Text>{copy.startingInfo[seconds]}</Text>
          </div>
        </Collapsible>
        {round ? (
          <>
            <hr className={styles.separator} />
            <h2 ref={informationRef} className={styles.information}>
              {copy.informationTitle}
            </h2>
            <p className={styles.status}>{statusText}</p>
            <Text className={styles.detail}>{detailText}</Text>
            {phase === "memorize" && remaining !== null ? (
              <p className={styles.timer}>{copy.secondsRemaining(remaining)}</p>
            ) : null}
            {phase === "play" ? (
              <>
                <div className={styles.results}>
                  <span className={styles.total}>
                    {checked ? copy.total(pathSum, target) : copy.totalHidden}
                  </span>
                  <span className={styles.pill}>{copy.cells(path.length)}</span>
                </div>
                {checked ? null : (
                  <p className={styles.hint}>{copy.resultNote}</p>
                )}
                <div className={cx(styles.controls, styles.moveControls)}>
                  <PhysicalButton onClick={checkPath} disabled={revealed}>
                    {copy.checkPath}
                  </PhysicalButton>
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
                </div>
              </>
            ) : null}
            {phase === "memorize" ? (
              <div className={cx(styles.controls, styles.centeredControls)}>
                <PhysicalButton onClick={flipBoard}>
                  {copy.flipNow}
                </PhysicalButton>
              </div>
            ) : null}
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
            <hr className={styles.separator} />
            <h2 className={styles.information}>{copy.playZoneTitle}</h2>
            <section className={styles.board} aria-label={copy.boardLabel}>
              {Array.from({ length: BOARD_SIZE }, (_, index) => {
                const order = path.indexOf(index);
                const selected = phase === "play" && order >= 0;
                const letter = letterAt(index);
                const number = numbers[index];
                const canStep = legalIndexes.has(index);
                let label =
                  showNumbers && number !== undefined
                    ? copy.cellWithNumber(letter, number)
                    : copy.cell(letter);
                if (selected) {
                  label = copy.cellOnPath(label, order + 1);
                }
                if (canStep) {
                  label = copy.cellCanStep(label);
                }
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!interactive}
                    aria-label={label}
                    className={cx(
                      styles.cell,
                      interactive && styles.interactive,
                      phase === "play" && index === startIndex && styles.start,
                      phase === "play" && index === endIndex && styles.end,
                      selected && styles.selected,
                      canStep && styles.cellReady,
                    )}
                    onClick={() => chooseCell(index)}
                  >
                    {showNumbers && number !== undefined ? number : letter}
                    {selected ? (
                      <span className={styles.step}>{order + 1}</span>
                    ) : null}
                  </button>
                );
              })}
            </section>
            {phase === "play" ? (
              <>
                <hr className={styles.separator} />
                <section aria-label={copy.historyTitle}>
                  <h2 className={styles.heading}>{copy.historyTitle}</h2>
                  {attempts.length === 0 ? (
                    <Text>{copy.historyEmpty}</Text>
                  ) : (
                    <ol className={styles.history}>
                      {attempts.map((attempt) => (
                        <li key={attempt.id} className={styles.historyItem}>
                          <strong>{copy.attemptLabel(attempt.id)}</strong>
                          <span>
                            {copy.attemptSummary(
                              attempt.label,
                              attempt.sum,
                              target,
                            )}
                          </span>
                          <span
                            className={
                              attempt.result === "correct"
                                ? styles.good
                                : styles.bad
                            }
                          >
                            {copy.attemptResults[attempt.result]}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </>
            ) : null}
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
            checked={showMoves}
            onChange={(event) => setShowMoves(event.target.checked)}
          />
          {copy.showMoves}
        </label>
      </Modal>
    </PageWrapper>
  );
};

export default FormulaMaze;
