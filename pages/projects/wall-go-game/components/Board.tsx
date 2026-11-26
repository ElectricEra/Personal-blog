import { VisuallyHidden } from "@/components/VisuallyHidden/VisuallyHidden";
import { cx } from "@/utils/cx";
import {
  CELLS,
  cellLabel,
  EDGES,
  type GameState,
  SIDES,
  SIZE,
  type Side,
} from "../logic/board.ts";
import type { RegionKind } from "../logic/regions.ts";
import type { GameTranslation } from "../translations";
import type { BotPreview } from "../useBot";

import styles from "./Board.module.css";
import { wallSlot } from "./wallSlot";

const CELL_IDS = Array.from({ length: CELLS }, (_, cell) => cell);
const EDGE_IDS = Array.from({ length: EDGES }, (_, edge) => edge);

const ownerClass: Record<RegionKind, string> = {
  red: styles.ownerRed,
  blue: styles.ownerBlue,
  neutral: styles.ownerNeutral,
  contested: styles.ownerContested,
  trapped: styles.ownerTrapped,
};

type BoardProps = {
  state: GameState;
  interactive: boolean;
  selectedPiece: number | null;
  selectedDest: number | null;
  destinations: readonly number[];
  wallEdges: readonly number[];
  owners: readonly (RegionKind | null)[] | null;
  preview: BotPreview | null;
  copy: GameTranslation;
  onCell: (cell: number) => void;
  onWall: (edge: number) => void;
};

type Marker = { side: Side; mark: "solid" | "ghost" | "pending" };

const pieceMap = (
  state: GameState,
  preview: BotPreview | null,
  selectedPiece: number | null,
  selectedDest: number | null,
) => {
  const placed = new Map<number, Marker>();
  for (const side of SIDES) {
    for (const cell of state.pieces[side]) {
      placed.set(cell, { side, mark: "solid" });
    }
  }
  const showMove = (from: number, to: number, side: Side) => {
    if (from === to) {
      return;
    }
    placed.set(from, { side, mark: "ghost" });
    placed.set(to, { side, mark: "solid" });
  };
  if (preview?.kind === "turn") {
    showMove(preview.turn.from, preview.turn.to, preview.side);
  } else if (preview?.kind === "placement") {
    placed.set(preview.cell, { side: preview.side, mark: "pending" });
  } else if (
    selectedPiece !== null &&
    selectedDest !== null &&
    selectedDest !== selectedPiece
  ) {
    const moving = placed.get(selectedPiece);
    if (moving) {
      showMove(selectedPiece, selectedDest, moving.side);
    }
  }
  return placed;
};

const shownWalls = (state: GameState, preview: BotPreview | null) => {
  const walls = new Uint8Array(state.walls);
  if (preview?.kind === "turn" && preview.stage === "wall") {
    walls[preview.turn.edge] = 1;
  }
  return walls;
};

export const Board = ({
  state,
  interactive,
  selectedPiece,
  selectedDest,
  destinations,
  wallEdges,
  owners,
  preview,
  copy,
  onCell,
  onWall,
}: BoardProps) => {
  const pieces = pieceMap(state, preview, selectedPiece, selectedDest);
  const walls = shownWalls(state, preview);
  const last = state.lastAction;

  return (
    <section className={styles.board} aria-label={copy.boardLabel}>
      {CELL_IDS.map((cell) => {
        const piece = pieces.get(cell);
        const row = Math.floor(cell / SIZE);
        const column = cell % SIZE;
        const label = cellLabel(cell);
        const owner = owners?.[cell];
        const settled =
          state.phase === "play" && (owner === "red" || owner === "blue");
        const ownsPiece = state.pieces[state.toMove].includes(cell);
        const canMove =
          interactive && state.phase === "play" && ownsPiece && !settled;
        const canPlace = interactive && state.phase === "deploy" && !piece;
        const canGo =
          interactive && state.phase === "play" && destinations.includes(cell);
        const clickable = canMove || canPlace || canGo;
        const arriving = cell === selectedDest && cell !== selectedPiece;
        const name = arriving
          ? copy.destinationLabel(label)
          : settled && piece
            ? copy.closedPiece(copy.sides[piece.side], label)
            : piece
              ? copy.pieceLabel(copy.sides[piece.side], label)
              : canPlace
                ? copy.placeLabel(label)
                : canGo
                  ? copy.destinationLabel(label)
                  : copy.emptyLabel(label);
        const className = cx(
          styles.cell,
          clickable && styles.cellButton,
          owner && ownerClass[owner],
          destinations.includes(cell) && styles.destination,
          cell === selectedPiece && styles.selected,
          cell === selectedDest && styles.chosen,
          last?.to === cell && styles.last,
        );
        const style = { gridRow: row * 2 + 1, gridColumn: column * 2 + 1 };
        const body = piece ? (
          <span
            className={cx(
              styles.piece,
              piece.side === "red" ? styles.red : styles.blue,
              piece.mark === "ghost" && styles.ghost,
              piece.mark === "pending" && styles.pending,
            )}
          >
            {copy.letters[piece.side]}
          </span>
        ) : null;
        if (!clickable) {
          return (
            <div key={cell} className={className} style={style}>
              {body}
              <VisuallyHidden>{name}</VisuallyHidden>
            </div>
          );
        }
        return (
          <button
            key={cell}
            type="button"
            className={className}
            style={style}
            aria-label={name}
            aria-pressed={
              canMove || canGo
                ? cell === selectedPiece || cell === selectedDest
                : undefined
            }
            onClick={() => onCell(cell)}
          >
            {body}
          </button>
        );
      })}
      {EDGE_IDS.map((edge) => {
        const slot = wallSlot(edge);
        const built = walls[edge] === 1;
        const offered =
          !built &&
          interactive &&
          selectedDest !== null &&
          wallEdges.includes(edge);
        if (!built && !offered) {
          return null;
        }
        const style = { gridRow: slot.gridRow, gridColumn: slot.gridColumn };
        if (!offered) {
          return (
            <div
              key={`wall-${edge}`}
              className={cx(styles.wall, last?.edge === edge && styles.wallNew)}
              style={style}
            />
          );
        }
        return (
          <button
            key={`wall-${edge}`}
            type="button"
            className={cx(styles.wall, styles.wallButton)}
            style={style}
            aria-label={copy.wallLabel(
              copy.directions[slot.direction],
              cellLabel(slot.cell),
            )}
            onClick={() => onWall(edge)}
          />
        );
      })}
    </section>
  );
};
