import { useState } from "react";

import type { Feedback } from "@/components/FeedbackLine/FeedbackLine";

import {
  addBoards,
  boardFromPlacements,
  canCommit,
  copiesLeft,
  emptyBoard,
  mainIsSolved,
  pansMatch,
  reportOutcome,
  unusedBlocks,
  withoutLastPlacement,
} from "./logic/board";
import { createChallenge } from "./logic/challenge";
import {
  type Board,
  type Challenge,
  type Color,
  DIFFICULTIES,
  type Difficulty,
  type HistoryEntry,
  type Placement,
  type RoundResult,
  type ScaleId,
  type Side,
} from "./logic/config";
import {
  emptyGuess,
  type Guess,
  guessIsCorrect,
  parseGuess,
  resultAfterGuess,
  resultIfStuck,
  withRevealedWeights,
} from "./logic/guess";
import type { GameTranslation } from "./translations";

type Phase = "idle" | RoundResult;

type Selection = { scale: ScaleId; side: Side };

const DEFAULT_SELECTION: Selection = { scale: "main", side: "left" };

/** The round itself: blocks on the scales, guesses, and the round result. */
export const useScaleGame = (copy: GameTranslation) => {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [pending, setPending] = useState<Placement[]>([]);
  const [selected, setSelected] = useState<Selection>(DEFAULT_SELECTION);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [guess, setGuess] = useState<Guess>(emptyGuess);
  const [dialogGuess, setDialogGuess] = useState<Guess | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resigning, setResigning] = useState(false);

  const config = DIFFICULTIES[challenge?.difficulty ?? difficulty];
  const solved = challenge
    ? mainIsSolved(board.main, challenge.weights)
    : false;
  const interactive = phase === "playing";
  const remaining = copiesLeft(config.copies, board, pending);

  const endRound = (result: RoundResult) => {
    setPending([]);
    setPhase(result);
    setFeedback(null);
  };

  const startGame = (): Challenge => {
    const next = createChallenge(difficulty);
    setChallenge(next);
    setBoard(emptyBoard());
    setPending([]);
    setSelected(DEFAULT_SELECTION);
    setHistory([]);
    setGuessesLeft(DIFFICULTIES[difficulty].guesses);
    setGuess(withRevealedWeights(emptyGuess(), next));
    setDialogGuess(null);
    setDialogError(null);
    setResigning(false);
    setPhase("playing");
    setFeedback(null);
    return next;
  };

  const place = (color: Color) => {
    if (!interactive) {
      return;
    }
    if (remaining[color] <= 0) {
      setFeedback({ text: copy.noBlocks, good: false });
      return;
    }
    setPending((current) => [...current, { ...selected, color }]);
    setFeedback(null);
  };

  const undo = () => {
    if (!interactive) {
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
    const result = resultIfStuck(
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
    if (result !== "playing") {
      endRound(result);
      return;
    }
    setPending([]);
    if (solvedNext) {
      setFeedback({
        text: config.partialCounts
          ? copy.statusSolvedPartial
          : copy.statusSolved,
        good: true,
      });
    } else if (pansMatch(nextBoard.main)) {
      setFeedback({ text: copy.samePattern, good: false });
    } else {
      setFeedback(null);
    }
  };

  const setGuessValue = (color: Color, value: string) =>
    setGuess((current) => ({ ...current, [color]: value }));

  const openGuessDialog = () => {
    if (!challenge || !interactive || !solved) {
      return;
    }
    setDialogGuess(withRevealedWeights(guess, challenge));
    setDialogError(null);
  };

  const setDialogValue = (color: Color, value: string) => {
    setDialogGuess((current) => current && { ...current, [color]: value });
    setDialogError(null);
  };

  const closeGuessDialog = () => setDialogGuess(null);

  const confirmGuess = () => {
    if (!challenge || !dialogGuess || !interactive || !solved) {
      return;
    }
    const submitted = withRevealedWeights(dialogGuess, challenge);
    const parsed = parseGuess(submitted, config.minWeight, config.maxWeight);
    if (!parsed) {
      setDialogError(copy.invalidGuess(config.minWeight, config.maxWeight));
      return;
    }
    setGuess(submitted);
    setDialogGuess(null);
    const left = guessesLeft - 1;
    const result = resultAfterGuess(
      guessIsCorrect(challenge.weights, parsed),
      left,
      config.partialCounts,
    );
    setGuessesLeft(left);
    if (result === "playing") {
      setFeedback({ text: copy.wrongGuess, good: false });
      return;
    }
    endRound(result);
  };

  const finishPartial = () => {
    if (interactive && solved && config.partialCounts) {
      endRound("partial");
    }
  };

  const resign = () => {
    if (interactive) {
      setResigning(false);
      endRound("failure");
    }
  };

  return {
    difficulty,
    setDifficulty,
    challenge,
    board,
    pending,
    selected,
    setSelected,
    history,
    guess,
    setGuessValue,
    dialogGuess,
    dialogError,
    setDialogValue,
    closeGuessDialog,
    phase,
    feedback,
    resigning,
    setResigning,
    config,
    solved,
    interactive,
    remaining,
    startGame,
    place,
    undo,
    clearPending,
    removePending,
    commitMove,
    openGuessDialog,
    confirmGuess,
    finishPartial,
    resign,
  };
};
