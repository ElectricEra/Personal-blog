import { useState } from "react";

import type { Challenge, Color } from "./logic/config";
import {
  fixedColorOf,
  moveInOrder,
  type Order,
  orderFromChallenge,
  SLOT_KEYS,
} from "./logic/order";

/**
 * The assumed-order scratch board: tap a color to pick it, then tap a slot
 * or another placed color to put it there.
 */
export const useOrderBoard = (
  challenge: Challenge | null,
  interactive: boolean,
) => {
  const [order, setOrder] = useState<Order>(() => SLOT_KEYS.map(() => null));
  const [picked, setPicked] = useState<Color | null>(null);

  const reset = (next: Challenge) => {
    setOrder(orderFromChallenge(next));
    setPicked(null);
  };

  const move = (color: Color, toIndex: number | null) => {
    if (!challenge) {
      return;
    }
    setOrder((current) => moveInOrder(current, challenge, color, toIndex));
    setPicked(null);
  };

  const pickColor = (color: Color) => {
    if (!interactive || !challenge || color === fixedColorOf(challenge)) {
      return;
    }
    if (picked === color) {
      if (order.includes(color)) {
        move(color, null);
      } else {
        setPicked(null);
      }
      return;
    }
    const destination = order.indexOf(color);
    if (picked && destination >= 0) {
      move(picked, destination);
      return;
    }
    setPicked(color);
  };

  const placePicked = (index: number) => {
    if (interactive && picked) {
      move(picked, index);
    }
  };

  return { order, picked, reset, pickColor, placePicked };
};
