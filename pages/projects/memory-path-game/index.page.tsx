import { useEffect, useState } from "react";

import { BackButton } from "@/components/BackButton/BackButton";
import { Button } from "@/components/Button/Button";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Text } from "@/components/Text/Text";
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

const MEMORIZE_VALUES: MemorizeSeconds[] = [60, 30, 15, 0];

const letterAt = (index: number) => LETTERS[index] ?? "";

const FormulaMaze = () => {
  const copy = useTranslation(translations);
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Round | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [solved, setSolved] = useState(0);
  const [seconds, setSeconds] = useState<MemorizeSeconds>(60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    good: boolean;
  } | null>(null);

  const numbers = round?.numbers ?? [];
  const solution = round?.solution ?? [];
  const startIndex = solution[0];
  const endIndex = solution[solution.length - 1];
  const startLetter = startIndex === undefined ? "" : letterAt(startIndex);
  const endLetter = endIndex === undefined ? "" : letterAt(endIndex);
  const target = round ? sumPath(numbers, solution) : 0;
  const showNumbers = phase === "memorize" || revealed;
  const interactive = phase === "play" && !revealed;

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
    setChecked(false);
    setFeedback(null);
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
      setFeedback({
        text: copy.wrongRoute,
        good: false,
      });
      return;
    }
    if (!revealed) {
      setSolved((count) => count + 1);
    }
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
    setFeedback({
      text: nextRevealed ? copy.numbersRevealed : copy.numbersHidden,
      good: false,
    });
  };

  const timerText =
    phase === "memorize" && remaining !== null
      ? copy.secondsRemaining(remaining)
      : phase === "play"
        ? copy.boardHidden
        : copy.ready;

  const statusText =
    phase === "memorize"
      ? copy.memorizeStatus
      : phase === "play" && round
        ? copy.routeStatus(startLetter, endLetter, target)
        : copy.idleStatus;

  const detailText =
    phase === "memorize"
      ? copy.memorizeDetail
      : phase === "play" && round
        ? copy.routeDetail(startLetter, endLetter, target)
        : copy.idleDetail;

  const pathSum = sumPath(numbers, path);
  const pathLabel = path.length
    ? path.map((index) => letterAt(index)).join(" → ")
    : "—";

  return (
    <PageWrapper fullScreen>
      <BackButton href="/projects" text={copy.back} />
      <SectionHeader>{copy.title}</SectionHeader>
      <Text className={styles.intro} align="center">
        {copy.intro}
      </Text>
      <div className={styles.game}>
        <div className={styles.controls}>
          <label className={styles.label} htmlFor="memorize-seconds">
            {copy.memorizeLabel}
          </label>
          <select
            id="memorize-seconds"
            className={styles.select}
            value={seconds}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value === 0 || value === 15 || value === 30 || value === 60) {
                setSeconds(value);
              }
            }}
          >
            {MEMORIZE_VALUES.map((value) => (
              <option key={value} value={value}>
                {copy.memorizeOptions[value]}
              </option>
            ))}
          </select>
          <Button onClick={startGame}>{copy.newBoard}</Button>
          <Button
            variant="secondary"
            onClick={flipBoard}
            disabled={phase !== "memorize"}
          >
            {copy.flipNow}
          </Button>
          <span className={styles.pill} aria-live="polite">
            {timerText}
          </span>
          <span className={styles.pill}>{copy.solved(solved)}</span>
        </div>
        <div className={styles.status}>{statusText}</div>
        <p className={styles.detail}>{detailText}</p>
        <section className={styles.board} aria-label={copy.boardLabel}>
          {Array.from({ length: BOARD_SIZE }, (_, index) => {
            const order = path.indexOf(index);
            const selected = phase === "play" && order >= 0;
            const letter = letterAt(index);
            const number = numbers[index];
            return (
              <button
                key={letter}
                type="button"
                disabled={!interactive}
                aria-label={
                  showNumbers && number !== undefined
                    ? copy.cellWithNumber(letter, number)
                    : copy.cell(letter)
                }
                className={[
                  styles.cell,
                  interactive ? styles.interactive : "",
                  phase === "play" && index === startIndex ? styles.start : "",
                  phase === "play" && index === endIndex ? styles.end : "",
                  selected ? styles.selected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
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
          <div>
            <div className={styles.results}>
              <span className={styles.total}>
                {checked ? copy.total(pathSum, target) : copy.totalHidden}
              </span>
              <span className={styles.path}>{copy.path(pathLabel)}</span>
            </div>
            <div className={styles.controls}>
              <Button onClick={checkPath} disabled={revealed}>
                {copy.checkPath}
              </Button>
              <Button
                variant="secondary"
                onClick={undo}
                disabled={path.length === 0 || revealed}
              >
                {copy.undo}
              </Button>
              <Button
                variant="secondary"
                onClick={clearPath}
                disabled={path.length === 0 || revealed}
              >
                {copy.clearPath}
              </Button>
              <Button variant="secondary" onClick={toggleReveal}>
                {revealed ? copy.hideNumbers : copy.showNumbers}
              </Button>
            </div>
            <p
              className={[
                styles.feedback,
                feedback?.good ? styles.good : "",
                feedback && !feedback.good ? styles.bad : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-live="polite"
            >
              {feedback?.text ?? ""}
            </p>
          </div>
        ) : null}
        <p className={styles.hint}>{copy.hint}</p>
      </div>
    </PageWrapper>
  );
};

export default FormulaMaze;
