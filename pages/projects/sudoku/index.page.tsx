import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { SectionHeader } from "@/components/SectionHeader/SectionHeader";
import { Text } from "@/components/Text/Text";

import styles from "./index.module.css";
import { findNextHint } from "./solver";
import {
  type Board,
  cloneBoard,
  type Difficulty,
  generatePuzzle,
  getConflictKeys,
  isSolved,
} from "./sudoku";

const SIZE = 9;
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Легко",
  medium: "Середньо",
  hard: "Важко",
};

const techniquesGuide = [
  {
    name: "Last empty",
    principle:
      "У рядку, стовпці або квадраті лишилась одна порожня клітинка — туди йде єдина відсутня цифра. Шукаємо спочатку квадрат, потім рядок, потім стовпець.",
  },
  {
    name: "Naked single",
    principle:
      "У порожній клітинці з усіх 1–9 лишається лише один кандидат (інші вже є в її рядку, стовпці чи квадраті). Серед кількох таких беремо ту, де більше заповнених сусідів.",
  },
  {
    name: "Hidden single",
    principle:
      "У рядку, стовпці або квадраті якась цифра може стояти лише в одній порожній клітинці — навіть якщо в цій клітинці ще є інші кандидати.",
  },
] as const;

type CellPosition = {
  row: number;
  col: number;
};

type Status = "idle" | "ok" | "errors" | "won";

const Sudoku = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle, setPuzzle] = useState<Board | null>(null);
  const [grid, setGrid] = useState<Board | null>(null);
  const [selected, setSelected] = useState<CellPosition | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [hintText, setHintText] = useState("");
  const [hintCell, setHintCell] = useState<CellPosition | null>(null);
  const [hintValue, setHintValue] = useState<number | null>(null);
  const [hintCauseKeys, setHintCauseKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const generationId = useRef(0);

  const clearHint = useCallback(() => {
    setHintText("");
    setHintCell(null);
    setHintValue(null);
    setHintCauseKeys(new Set());
  }, []);

  const startGame = useCallback(
    (level: Difficulty) => {
      const nextGeneration = generationId.current + 1;
      generationId.current = nextGeneration;
      setDifficulty(level);
      setPuzzle(null);
      setGrid(null);
      setSelected(null);
      setStatus("idle");
      clearHint();

      window.setTimeout(() => {
        const nextPuzzle = generatePuzzle(level);
        if (generationId.current !== nextGeneration) {
          return;
        }
        setPuzzle(nextPuzzle);
        setGrid(cloneBoard(nextPuzzle));
      }, 0);
    },
    [clearHint],
  );

  useEffect(() => {
    startGame("easy");
  }, [startGame]);

  const conflicts = useMemo(
    () => (grid ? getConflictKeys(grid) : new Set<string>()),
    [grid],
  );

  const isGiven = (row: number, col: number) => (puzzle?.[row]?.[col] ?? 0) > 0;

  const placeNumber = useCallback(
    (value: number) => {
      if (!grid || !selected) {
        return;
      }
      if ((puzzle?.[selected.row]?.[selected.col] ?? 0) > 0) {
        return;
      }

      const next = cloneBoard(grid);
      const current = next[selected.row]?.[selected.col] ?? 0;
      const row = next[selected.row];
      if (!row) {
        return;
      }
      row[selected.col] = current === value ? 0 : value;
      setGrid(next);
      clearHint();
      setStatus(isSolved(next) ? "won" : "idle");
    },
    [clearHint, grid, puzzle, selected],
  );

  const clearCell = useCallback(() => {
    placeNumber(0);
  }, [placeNumber]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selected) {
        return;
      }

      if (event.key >= "1" && event.key <= "9") {
        event.preventDefault();
        placeNumber(Number(event.key));
        return;
      }

      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "0"
      ) {
        event.preventDefault();
        clearCell();
        return;
      }

      const move: Record<string, CellPosition> = {
        ArrowUp: { row: Math.max(0, selected.row - 1), col: selected.col },
        ArrowDown: {
          row: Math.min(SIZE - 1, selected.row + 1),
          col: selected.col,
        },
        ArrowLeft: { row: selected.row, col: Math.max(0, selected.col - 1) },
        ArrowRight: {
          row: selected.row,
          col: Math.min(SIZE - 1, selected.col + 1),
        },
      };

      const next = move[event.key];
      if (next) {
        event.preventDefault();
        setSelected(next);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clearCell, placeNumber, selected]);

  const checkBoard = () => {
    if (!grid) {
      return;
    }
    clearHint();
    if (isSolved(grid)) {
      setStatus("won");
      return;
    }
    setStatus(conflicts.size > 0 ? "errors" : "ok");
  };

  const showHint = () => {
    if (!grid) {
      return;
    }
    if (isSolved(grid)) {
      setHintText("Судоку вже розв’язано — підказка не потрібна.");
      setHintCell(null);
      setHintValue(null);
      setHintCauseKeys(new Set());
      setStatus("idle");
      return;
    }
    const hint = findNextHint(grid);
    setStatus("idle");
    if (hint) {
      setHintText(hint.explanation);
      setHintCell({ row: hint.row, col: hint.col });
      setHintValue(hint.value);
      setHintCauseKeys(
        new Set(hint.causes.map((cell) => `${cell.row}-${cell.col}`)),
      );
      setSelected({ row: hint.row, col: hint.col });
    } else {
      setHintText(
        "Простими техніками (last empty / naked / hidden single) наступного ходу не видно.",
      );
      setHintCell(null);
      setHintValue(null);
      setHintCauseKeys(new Set());
    }
  };

  const selectedValue = selected
    ? (grid?.[selected.row]?.[selected.col] ?? 0)
    : 0;

  const statusText = {
    idle: "",
    ok: "Помилок немає. Далі!",
    errors: "Є помилки. Перевір рядки, стовпці та квадрати.",
    won: "Гарна робота — судоку розв’язано!",
  }[status];

  return (
    <PageWrapper fullScreen>
      <SectionHeader>Судоку</SectionHeader>
      <Text className={styles.intro} align="center">
        Заповни сітку так, щоб кожна цифра від 1 до 9 зустрічалась лише раз у
        рядку, стовпці та квадраті 3×3.
      </Text>
      <div className={styles.game}>
        <div className={styles.row}>
          {(Object.keys(difficultyLabels) as Difficulty[]).map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? "primary" : "secondary"}
              onClick={() => startGame(level)}
            >
              {difficultyLabels[level]}
            </Button>
          ))}
        </div>
        {grid ? (
          <div className={styles.board}>
            {grid.flatMap((rowValues, row) =>
              rowValues.map((value, col) => {
                const key = `${row}-${col}`;
                const given = isGiven(row, col);
                const related =
                  !hintCell &&
                  selected &&
                  (selected.row === row ||
                    selected.col === col ||
                    (Math.floor(selected.row / 3) === Math.floor(row / 3) &&
                      Math.floor(selected.col / 3) === Math.floor(col / 3)));
                const same =
                  !hintCell &&
                  Boolean(selectedValue) &&
                  value === selectedValue;
                const selectedCell =
                  !hintCell && selected?.row === row && selected?.col === col;
                const hinted = hintCell?.row === row && hintCell?.col === col;
                const hintCause = hintCauseKeys.has(key);

                return (
                  <button
                    key={key}
                    type="button"
                    aria-label={`Рядок ${row + 1}, стовпець ${col + 1}${value ? `, ${value}` : ", порожньо"}`}
                    aria-pressed={selectedCell}
                    className={[
                      styles.cell,
                      col % 3 === 2 ? styles["box-right"] : "",
                      row % 3 === 2 ? styles["box-bottom"] : "",
                      given ? styles.given : "",
                      related ? styles.related : "",
                      same ? styles.same : "",
                      selectedCell ? styles.selected : "",
                      hintCause ? styles["hint-cause"] : "",
                      hinted ? styles.hint : "",
                      conflicts.has(key) ? styles.conflict : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setSelected({ row, col })}
                  >
                    {value ? (
                      value
                    ) : hinted && hintValue ? (
                      <span className={styles["hint-digit"]}>{hintValue}</span>
                    ) : (
                      ""
                    )}
                  </button>
                );
              }),
            )}
          </div>
        ) : (
          <Text align="center">Генерую головоломку...</Text>
        )}
        <div className={styles.pad}>
          {NUMBERS.map((value) => (
            <Button
              key={value}
              variant={hintValue === value ? "primary" : "secondary"}
              className={`${styles["pad-button"]} ${hintValue === value ? styles["pad-hint"] : ""}`}
              onClick={() => placeNumber(value)}
            >
              {value}
            </Button>
          ))}
        </div>
        <div className={styles.row}>
          <Button variant="secondary" onClick={clearCell}>
            Очистити
          </Button>
          <Button variant="secondary" onClick={checkBoard}>
            Перевірити
          </Button>
          <Button variant="secondary" onClick={showHint}>
            Підказка
          </Button>
          <Button onClick={() => startGame(difficulty)}>Нова гра</Button>
        </div>
        <Text
          align="center"
          className={`${styles.status} ${status === "won" ? styles.won : ""}`}
        >
          {hintText || statusText}
        </Text>
        <section
          className={styles.techniques}
          aria-labelledby="techniques-title"
        >
          <h2 id="techniques-title" className={styles["techniques-title"]}>
            Підказки (від простого до складнішого)
          </h2>
          <Text className={styles["techniques-intro"]}>
            Кнопка «Підказка» шукає хід саме в цьому порядку й повертає перший
            знайдений.
          </Text>
          <ol className={styles["techniques-list"]}>
            {techniquesGuide.map((technique, index) => (
              <li key={technique.name} className={styles["techniques-item"]}>
                <p className={styles["techniques-name"]}>
                  {index + 1}. {technique.name}
                </p>
                <p className={styles["techniques-principle"]}>
                  {technique.principle}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </PageWrapper>
  );
};

export default Sudoku;
