import { useEffect, useRef, useState } from "react";

import type { Feedback } from "@/components/FeedbackLine/FeedbackLine";

import type { OpeningFaces } from "./logic/placement";
import type { Star } from "./logic/positions";
import { PUZZLES, type Puzzle } from "./logic/puzzles";
import { evaluate, type RuleId } from "./logic/rules";
import {
  drawSession,
  formatElapsed,
  MODE_CONFIG,
  type Mode,
} from "./logic/session";
import type { GameTranslation } from "./translations";

type Phase = "idle" | "playing" | "revealed" | "summary";

type ZonedFeedback = Feedback & { zone: "test" | "answer" };

export type TestRecord = {
  id: number;
  star: Star;
  result: number;
};

export type WorkedExample = {
  star: Star;
  result: number;
};

export type Reveal = {
  ruleId: RuleId;
  result: number;
  example: Star;
  exampleResult: number;
};

const exampleOf = (ruleId: RuleId, star: Star): WorkedExample => ({
  star,
  result: evaluate(ruleId, star),
});

export const useHiddenCode = (copy: GameTranslation) => {
  const [mode, setMode] = useState<Mode>("guided");
  const [activeMode, setActiveMode] = useState<Mode>("guided");
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionPuzzles, setSessionPuzzles] = useState<readonly Puzzle[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [sessionTests, setSessionTests] = useState(0);
  const [sessionMisses, setSessionMisses] = useState(0);
  const [puzzleTests, setPuzzleTests] = useState(0);
  const [puzzleMisses, setPuzzleMisses] = useState(0);
  const [history, setHistory] = useState<TestRecord[]>([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [feedback, setFeedback] = useState<ZonedFeedback | null>(null);
  const [resigning, setResigning] = useState(false);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [answerDraft, setAnswerDraftState] = useState("");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [frozenMs, setFrozenMs] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const testId = useRef(0);

  const config = MODE_CONFIG[activeMode];
  const puzzle =
    phase === "playing" || phase === "revealed"
      ? (sessionPuzzles[index] ?? null)
      : null;
  const ticking =
    config.timed &&
    startedAt !== null &&
    frozenMs === null &&
    (phase === "playing" || phase === "revealed");

  useEffect(() => {
    if (!ticking) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  const clearPuzzle = () => {
    setPuzzleTests(0);
    setPuzzleMisses(0);
    setHistory([]);
    setHintVisible(false);
    setFeedback(null);
    setResigning(false);
    setAnswerOpen(false);
    setAnswerDraftState("");
    setAnswerError(null);
  };

  const endPuzzle = (solved: boolean, nextFeedback: Feedback | null) => {
    if (phase !== "playing") {
      return;
    }
    if (solved && activeMode !== "guided") {
      setScore((current) => current + 1);
    }
    setPhase("revealed");
    setResigning(false);
    setAnswerOpen(false);
    setFeedback(nextFeedback && { ...nextFeedback, zone: "answer" });
  };

  const start = (): OpeningFaces | null => {
    const drawn = drawSession(mode, PUZZLES);
    const first = drawn[0];
    if (!first) {
      return null;
    }
    setActiveMode(mode);
    setSessionPuzzles(drawn);
    setIndex(0);
    setScore(0);
    setSessionTests(0);
    setSessionMisses(0);
    clearPuzzle();
    const stamp = Date.now();
    setStartedAt(stamp);
    setFrozenMs(null);
    setNow(stamp);
    setPhase("playing");
    return first.opening;
  };

  const continueSession = (): OpeningFaces | null => {
    if (phase !== "revealed") {
      return null;
    }
    const next = sessionPuzzles[index + 1];
    if (!next) {
      setPhase("summary");
      setFrozenMs(Date.now() - (startedAt ?? Date.now()));
      setFeedback(null);
      setResigning(false);
      setAnswerOpen(false);
      return null;
    }
    setIndex(index + 1);
    clearPuzzle();
    setPhase("playing");
    return next.opening;
  };

  const runTest = (star: Star, complete: boolean) => {
    if (phase !== "playing" || !puzzle || !complete) {
      return;
    }
    if (config.maxTests !== null && puzzleTests >= config.maxTests) {
      setFeedback({ text: copy.noTestsLeft, good: false, zone: "test" });
      return;
    }
    const result = evaluate(puzzle.ruleId, star);
    testId.current += 1;
    const id = testId.current;
    setHistory((items) => [...items, { id, star, result }]);
    setPuzzleTests((count) => count + 1);
    setSessionTests((count) => count + 1);
    setFeedback({ text: copy.testResult(result), good: true, zone: "test" });
  };

  const openAnswer = () => {
    if (phase !== "playing") {
      return;
    }
    setResigning(false);
    setAnswerDraftState("");
    setAnswerError(null);
    setAnswerOpen(true);
  };

  const closeAnswer = () => {
    setAnswerOpen(false);
    setAnswerError(null);
  };

  const setAnswerDraft = (value: string) => {
    setAnswerDraftState(value);
    setAnswerError(null);
  };

  const confirmAnswer = () => {
    if (phase !== "playing" || !puzzle) {
      return;
    }
    if (answerDraft === "") {
      setAnswerError(copy.answerRequired);
      return;
    }
    const expected = evaluate(puzzle.ruleId, puzzle.challenge);
    setAnswerOpen(false);
    if (Number(answerDraft) === expected) {
      endPuzzle(true, { text: copy.correct, good: true });
      return;
    }
    const misses = puzzleMisses + 1;
    setPuzzleMisses(misses);
    setSessionMisses((count) => count + 1);
    const limit = config.maxAnswers;
    if (limit !== null && misses >= limit) {
      endPuzzle(false, { text: copy.missed, good: false });
      return;
    }
    const left = limit === null ? null : limit - misses;
    setFeedback({
      text: left === null ? copy.missed : copy.wrong(left),
      good: false,
      zone: "answer",
    });
    if (config.hintAfterMisses !== null && misses >= config.hintAfterMisses) {
      setHintVisible(true);
    }
  };

  const resign = () => {
    endPuzzle(false, null);
  };

  const elapsedMs =
    frozenMs ?? (startedAt === null ? 0 : Math.max(0, now - startedAt));
  const answersLeft =
    config.maxAnswers === null
      ? null
      : Math.max(0, config.maxAnswers - puzzleMisses);

  return {
    mode,
    setMode,
    phase,
    interactive: phase === "playing",
    showTimer: config.timed && phase !== "idle",
    showSession: activeMode !== "guided" && phase !== "idle",
    puzzleNumber: index + 1,
    puzzleTotal: sessionPuzzles.length,
    isLast: index + 1 >= sessionPuzzles.length,
    score,
    sessionTests,
    sessionMisses,
    puzzleTests,
    maxTests: config.maxTests,
    testsExhausted: config.maxTests !== null && puzzleTests >= config.maxTests,
    answersLeft,
    timeText: formatElapsed(elapsedMs),
    challenge: puzzle?.challenge ?? null,
    history,
    testFeedback: feedback?.zone === "test" ? feedback : null,
    answerFeedback: feedback?.zone === "answer" ? feedback : null,
    hint:
      hintVisible && puzzle
        ? exampleOf(puzzle.ruleId, puzzle.hintExample)
        : null,
    reveal:
      phase === "revealed" && puzzle
        ? {
            ruleId: puzzle.ruleId,
            result: evaluate(puzzle.ruleId, puzzle.challenge),
            example: puzzle.revealExample,
            exampleResult: evaluate(puzzle.ruleId, puzzle.revealExample),
          }
        : null,
    resigning,
    setResigning,
    answerOpen,
    answerDraft,
    answerError,
    dismissTestFeedback: () =>
      setFeedback((current) => (current?.zone === "test" ? null : current)),
    start,
    continueSession,
    runTest,
    openAnswer,
    closeAnswer,
    setAnswerDraft,
    confirmAnswer,
    resign,
  };
};
