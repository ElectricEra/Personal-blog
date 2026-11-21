import { useEffect, useState } from "react";

import type { Feedback } from "@/components/FeedbackLine/FeedbackLine";

import {
  generateRound,
  letterAt,
  neighbors,
  type Round,
  sumPath,
} from "./game";
import type { GameTranslation } from "./translations";

type Phase = "idle" | "memorize" | "play";

export type MemorizeSeconds = 0 | 15 | 30 | 60;

type AttemptResult = "correct" | "wrong" | "start" | "end";

export type Attempt = {
  id: number;
  label: string;
  sum: number;
  result: AttemptResult;
};

export const useMemoryPath = (copy: GameTranslation) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Round | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [seconds, setSeconds] = useState<MemorizeSeconds>(60);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [revealing, setRevealing] = useState(false);

  const numbers = round?.numbers ?? [];
  const solution = round?.solution ?? [];
  const startIndex = solution[0];
  const endIndex = solution[solution.length - 1];
  const startLetter = startIndex === undefined ? "" : letterAt(startIndex);
  const endLetter = endIndex === undefined ? "" : letterAt(endIndex);
  const target = sumPath(numbers, solution);
  const pathSum = sumPath(numbers, path);
  const interactive = phase === "play" && !revealed;

  useEffect(() => {
    if (phase !== "memorize" || deadline === null) {
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setPhase("play");
        setDeadline(null);
      }
    };
    tick();
    const timerId = setInterval(tick, 150);
    return () => clearInterval(timerId);
  }, [phase, deadline]);

  const changePath = (next: (current: number[]) => number[]) => {
    setPath(next);
    setChecked(false);
    setFeedback(null);
  };

  const warn = (text: string) => setFeedback({ text, good: false });

  const startGame = () => {
    setRound(generateRound());
    setPath([]);
    setRevealed(false);
    setChecked(false);
    setFeedback(null);
    setAttempts([]);
    setRevealing(false);
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
    if (phase === "memorize") {
      setPhase("play");
      setDeadline(null);
    }
  };

  const chooseCell = (index: number) => {
    if (!interactive || startIndex === undefined) {
      return;
    }
    const last = path[path.length - 1];
    if (last === undefined) {
      if (index === startIndex) {
        changePath(() => [index]);
      } else {
        warn(copy.startAt(startLetter));
      }
      return;
    }
    if (index === last) {
      changePath((current) => current.slice(0, -1));
    } else if (path.includes(index)) {
      warn(copy.visitTwice);
    } else if (!neighbors(last).includes(index)) {
      warn(copy.adjacentOnly);
    } else if (last === endIndex) {
      warn(copy.endMustBeLast);
    } else {
      changePath((current) => [...current, index]);
    }
  };

  const checkPath = () => {
    if (!round) {
      return;
    }
    let result: AttemptResult;
    if (path[0] !== startIndex) {
      result = "start";
      warn(copy.startAtMarked);
    } else if (path[path.length - 1] !== endIndex) {
      result = "end";
      warn(copy.endAtMarked);
    } else if (pathSum !== target) {
      result = "wrong";
      warn(copy.wrongRoute);
    } else {
      result = "correct";
      setRevealed(true);
      setRevealing(false);
      setFeedback({ text: copy.solvedMessage, good: true });
    }
    setChecked(true);
    setAttempts((current) => [
      ...current,
      {
        id: current.length + 1,
        label: path.length ? path.map(letterAt).join(" → ") : "—",
        sum: pathSum,
        result,
      },
    ]);
  };

  const undo = () => {
    if (!revealed && path.length > 0) {
      changePath((current) => current.slice(0, -1));
    }
  };

  const clearPath = () => {
    if (!revealed) {
      changePath(() => []);
    }
  };

  const toggleReveal = () => {
    const nextRevealed = !revealed;
    setRevealed(nextRevealed);
    setRevealing(false);
    warn(nextRevealed ? copy.numbersRevealed : copy.numbersHidden);
  };

  return {
    phase,
    round,
    numbers,
    path,
    revealed,
    checked,
    seconds,
    setSeconds,
    remaining,
    feedback,
    attempts,
    revealing,
    setRevealing,
    startIndex,
    endIndex,
    startLetter,
    endLetter,
    target,
    pathSum,
    interactive,
    startGame,
    flipBoard,
    chooseCell,
    checkPath,
    undo,
    clearPath,
    toggleReveal,
  };
};
