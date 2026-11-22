import { useRef, useState } from "react";

import {
  appendDie,
  type Die,
  diceFromFaces,
  emptyPlacement,
  isComplete,
  type OpeningFaces,
  type Placement,
  placedCount,
  placementToStar,
  removeDie,
  rollFaces,
} from "./logic/placement";
import { emptyStar, POSITIONS, type Position } from "./logic/positions";

const emptyOrder = (): string[] => [];

export const useTestStar = (enabled: boolean, onDraftChange: () => void) => {
  const [dice, setDice] = useState<Die[]>([]);
  const [placement, setPlacement] = useState<Placement>(emptyPlacement);
  const [selected, setSelected] = useState<Position>("A");
  const [order, setOrder] = useState<string[]>(emptyOrder);
  const setId = useRef(0);

  const reset = (faces: readonly OpeningFaces[number][]) => {
    setId.current += 1;
    setDice(diceFromFaces(faces, setId.current));
    setPlacement(emptyPlacement());
    setSelected("A");
    setOrder(emptyOrder());
  };

  const place = (dieId: string) => {
    if (!enabled) {
      return;
    }
    setPlacement((current) =>
      appendDie(removeDie(current, dieId), selected, dieId),
    );
    setOrder((current) => [...current.filter((id) => id !== dieId), dieId]);
    onDraftChange();
  };

  const takeBack = (dieId: string) => {
    if (!enabled) {
      return;
    }
    setPlacement((current) => removeDie(current, dieId));
    setOrder((current) => current.filter((id) => id !== dieId));
    onDraftChange();
  };

  const undo = () => {
    if (!enabled) {
      return;
    }
    const last = order[order.length - 1];
    if (!last) {
      return;
    }
    setPlacement((current) => removeDie(current, last));
    setOrder((current) => current.slice(0, -1));
    onDraftChange();
  };

  const clear = () => {
    if (!enabled || placedCount(placement) === 0) {
      return;
    }
    setPlacement(emptyPlacement());
    setOrder(emptyOrder());
    onDraftChange();
  };

  const rollNew = () => {
    if (!enabled) {
      return;
    }
    reset(rollFaces());
    onDraftChange();
  };

  const used = new Set(POSITIONS.flatMap((position) => placement[position]));
  const count = placedCount(placement);

  return {
    dice,
    placement,
    selected,
    setSelected: (position: Position) => {
      if (enabled) {
        setSelected(position);
      }
    },
    unplaced: dice.filter((die) => !used.has(die.id)),
    draft: count > 0,
    complete: isComplete(placement, dice),
    star: dice.length === 0 ? emptyStar() : placementToStar(placement, dice),
    canUndo: order.length > 0,
    reset,
    place,
    takeBack,
    undo,
    clear,
    rollNew,
  };
};
