import { useRef, useState } from "react";

import type { Feedback } from "@/components/FeedbackLine/FeedbackLine";

import type { Difficulty } from "./bot/difficulty.ts";
import type { GameState, Side, Turn } from "./logic/board.ts";
import {
  freeEdges,
  isLegalTurn,
  legalPlacements,
  playableDestinations,
} from "./logic/moves.ts";
import { outcomeOf } from "./logic/outcome.ts";
import {
  classifyRegions,
  ownerByCell,
  securedOwners,
  securedScore,
} from "./logic/regions.ts";
import {
  applyPlacement,
  applyTurn,
  initialState,
  resolve,
} from "./logic/state.ts";
import type { GameTranslation } from "./translations";
import { useBot } from "./useBot.ts";

export const MODES = ["pass", "bot"] as const;
export type Mode = (typeof MODES)[number];

export type Settings = {
  mode: Mode;
  humanSide: Side;
  difficulty: Difficulty;
};

const isHumanTurn = (state: GameState, settings: Settings) =>
  settings.mode === "pass" || state.toMove === settings.humanSide;

export const useWallGo = (copy: GameTranslation) => {
  const [pending, setPending] = useState<Settings>({
    mode: "pass",
    humanSide: "red",
    difficulty: "medium",
  });
  const [active, setActive] = useState<Settings | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [piece, setPiece] = useState<number | null>(null);
  const [dest, setDest] = useState<number | null>(null);
  const [handoff, setHandoff] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [restarting, setRestarting] = useState(false);
  const activeRef = useRef(active);
  const stateRef = useRef(state);
  activeRef.current = active;
  stateRef.current = state;

  const commit = (next: GameState, previous: GameState) => {
    const settings = activeRef.current;
    setState(next);
    setPiece(null);
    setDest(null);
    if (next.lastPass) {
      setFeedback({
        text: copy.forcedPass(
          copy.sides[next.lastPass],
          copy.sides[next.toMove],
        ),
        good: false,
      });
    } else {
      setFeedback(null);
    }
    setHandoff(
      settings?.mode === "pass" &&
        next.phase !== "over" &&
        next.toMove !== previous.toMove,
    );
  };

  const botState =
    state &&
    active?.mode === "bot" &&
    state.phase !== "over" &&
    state.toMove !== active.humanSide &&
    !handoff
      ? state
      : null;

  const bot = useBot({
    state: botState,
    difficulty: active?.difficulty ?? "medium",
    onPlacement: (cell) => {
      const current = stateRef.current;
      if (!current || !legalPlacements(current).includes(cell)) {
        return;
      }
      commit(applyPlacement(current, cell), current);
    },
    onTurn: (turn: Turn) => {
      const current = stateRef.current;
      if (!current || !isLegalTurn(current, current.toMove, turn)) {
        return;
      }
      commit(applyTurn(current, turn), current);
    },
    onPass: () => {
      const current = stateRef.current;
      if (!current) {
        return;
      }
      const next = resolve(current);
      if (next !== current) {
        commit(next, current);
      }
    },
  });

  const openMatch = (settings: Settings) => {
    bot.cancel();
    setActive(settings);
    activeRef.current = settings;
    setState(initialState());
    setPiece(null);
    setDest(null);
    setHandoff(false);
    setFeedback(null);
    setRestarting(false);
  };

  const start = () => openMatch(pending);

  const restart = () => {
    if (active) {
      openMatch(active);
    }
  };

  const interactive = Boolean(
    state &&
      active &&
      state.phase !== "over" &&
      !handoff &&
      !bot.busy &&
      isHumanTurn(state, active),
  );

  const reachable =
    state && piece !== null && state.phase === "play"
      ? playableDestinations(state, piece)
      : [];
  const shownDestinations = interactive ? reachable : [];
  const wallEdges =
    interactive && dest !== null && state ? freeEdges(state.walls, dest) : [];

  const onCell = (cell: number) => {
    if (!state || !interactive) {
      return;
    }
    if (state.phase === "deploy") {
      if (!legalPlacements(state).includes(cell)) {
        setFeedback({ text: copy.occupied, good: false });
        return;
      }
      commit(applyPlacement(state, cell), state);
      return;
    }
    if (state.pieces[state.toMove].includes(cell)) {
      if (piece === cell && reachable.includes(cell)) {
        setDest(dest === cell ? null : cell);
        setFeedback(null);
        return;
      }
      const options = playableDestinations(state, cell);
      if (options.length === 0) {
        setFeedback({ text: copy.pieceStuck, good: false });
        setPiece(null);
        setDest(null);
        return;
      }
      setPiece(cell);
      setDest(null);
      setFeedback(null);
      return;
    }
    if (piece !== null && reachable.includes(cell)) {
      setDest(cell);
      setFeedback(null);
      return;
    }
    setFeedback({ text: copy.notLegal, good: false });
  };

  const onWall = (edge: number) => {
    if (!state || !interactive || piece === null || dest === null) {
      return;
    }
    const turn = { from: piece, to: dest, edge };
    if (!isLegalTurn(state, state.toMove, turn)) {
      setFeedback({ text: copy.notLegal, good: false });
      return;
    }
    commit(applyTurn(state, turn), state);
  };

  const regions = state ? classifyRegions(state) : [];
  const running = securedScore(regions);
  const outcome = state ? outcomeOf(state) : null;
  const sideName = state ? copy.sides[state.toMove] : "";
  let status = "";
  if (state && bot.thinking) {
    status = copy.botThinking(sideName);
  } else if (state && bot.preview) {
    status = copy.botMoving(copy.sides[bot.preview.side]);
  } else if (state?.phase === "over") {
    status = copy.gameOver;
  } else if (state && handoff) {
    status = copy.passTo(sideName);
  } else if (state?.phase === "deploy") {
    status = copy.deployStatus(sideName);
  } else if (state && dest !== null) {
    status = copy.chooseWall(sideName);
  } else if (state && piece !== null) {
    status = copy.chooseDestination(sideName);
  } else if (state) {
    status = copy.choosePiece(sideName);
  }

  return {
    pending,
    setPending,
    active,
    state,
    piece,
    dest,
    handoff,
    setHandoff,
    feedback,
    restarting,
    setRestarting,
    interactive,
    destinations: shownDestinations,
    wallEdges,
    running,
    outcome,
    owners: state
      ? state.phase === "over"
        ? ownerByCell(regions)
        : securedOwners(regions)
      : null,
    preview: bot.preview,
    status,
    start,
    restart,
    onCell,
    onWall,
  };
};
