import { useEffect, useRef, useState } from "react";

import {
  type BotResponse,
  BUDGET_MS,
  chooseDecision,
  type Decision,
  type Difficulty,
  legalDecision,
} from "./bot/chooseAction.ts";
import type { GameState, Side, Turn } from "./logic/board.ts";
import { mulberry32 } from "./logic/random.ts";

export type BotPreview =
  | { kind: "placement"; cell: number; side: Side }
  | { kind: "turn"; turn: Turn; side: Side; stage: "move" | "wall" };

type UseBotOptions = {
  state: GameState | null;
  difficulty: Difficulty;
  onPlacement: (cell: number) => void;
  onTurn: (turn: Turn) => void;
  onPass: () => void;
};

const pause = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420;

export const useBot = ({
  state,
  difficulty,
  onPlacement,
  onTurn,
  onPass,
}: UseBotOptions) => {
  const [thinking, setThinking] = useState(false);
  const [preview, setPreview] = useState<BotPreview | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef(0);
  const liveRef = useRef(0);
  const hardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPlacementRef = useRef(onPlacement);
  const onTurnRef = useRef(onTurn);
  const onPassRef = useRef(onPass);
  onPlacementRef.current = onPlacement;
  onTurnRef.current = onTurn;
  onPassRef.current = onPass;

  const stopWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
  };

  const cancel = () => {
    liveRef.current += 1;
    requestRef.current += 1;
    if (hardTimerRef.current !== null) {
      clearTimeout(hardTimerRef.current);
      hardTimerRef.current = null;
    }
    stopWorker();
    setThinking(false);
    setPreview(null);
  };

  useEffect(() => {
    if (!state) {
      return;
    }
    const requestId = ++requestRef.current;
    let cancelled = false;
    setThinking(true);
    const worker = new Worker(new URL("./bot/bot.worker.ts", import.meta.url));
    workerRef.current = worker;
    const deadline = Date.now() + BUDGET_MS[difficulty];

    const finish = (decision: Decision) => {
      if (cancelled || requestRef.current !== requestId) {
        return;
      }
      cancelled = true;
      if (hardTimerRef.current !== null) {
        clearTimeout(hardTimerRef.current);
        hardTimerRef.current = null;
      }
      setThinking(false);
      const legal = legalDecision(state, decision);
      if (legal.kind === "placement") {
        setPreview({
          kind: "placement",
          cell: legal.cell,
          side: state.toMove,
        });
        return;
      }
      if (legal.kind === "turn") {
        setPreview({
          kind: "turn",
          turn: legal.turn,
          side: state.toMove,
          stage: "move",
        });
        return;
      }
      onPassRef.current();
    };

    hardTimerRef.current = setTimeout(() => {
      if (requestRef.current !== requestId) {
        return;
      }
      worker.terminate();
      workerRef.current = null;
      finish(
        chooseDecision(
          state,
          difficulty,
          mulberry32(requestId),
          Date.now() - 1,
        ),
      );
    }, BUDGET_MS[difficulty] + 500);

    const onMessage = (event: MessageEvent<BotResponse>) => {
      if (event.data.requestId !== requestId) {
        return;
      }
      finish(event.data.decision);
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", () => {
      finish(
        chooseDecision(
          state,
          difficulty,
          mulberry32(requestId + 1),
          Date.now() - 1,
        ),
      );
    });
    worker.postMessage({
      requestId,
      state,
      difficulty,
      seed: Math.floor(Math.random() * 1_000_000_000),
      deadline,
    });

    return () => {
      cancelled = true;
      if (hardTimerRef.current !== null) {
        clearTimeout(hardTimerRef.current);
        hardTimerRef.current = null;
      }
      worker.removeEventListener("message", onMessage);
      worker.terminate();
      if (workerRef.current === worker) {
        workerRef.current = null;
      }
    };
  }, [state, difficulty]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    const stamp = liveRef.current;
    const timer = setTimeout(() => {
      if (liveRef.current !== stamp) {
        return;
      }
      if (preview.kind === "placement") {
        onPlacementRef.current(preview.cell);
        setPreview(null);
        return;
      }
      if (preview.stage === "move") {
        setPreview({ ...preview, stage: "wall" });
        return;
      }
      onTurnRef.current(preview.turn);
      setPreview(null);
    }, pause());
    return () => clearTimeout(timer);
  }, [preview]);

  return {
    thinking,
    preview,
    busy: thinking || preview !== null,
    cancel,
  };
};
