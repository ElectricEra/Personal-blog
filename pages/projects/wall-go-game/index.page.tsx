import { useRef } from "react";

import { FeedbackLine } from "@/components/FeedbackLine/FeedbackLine";
import { ConfirmPopover } from "@/components/GameControls/ConfirmPopover";
import { GameControls } from "@/components/GameControls/GameControls";
import { GameHeader } from "@/components/GameHeader/GameHeader";
import { GameRules } from "@/components/GameRules/GameRules";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import { Select } from "@/components/Select/Select";
import { Stack } from "@/components/Stack/Stack";
import { ZoneHeading } from "@/components/ZoneHeading/ZoneHeading";
import { useTranslation } from "@/utils/i18n";
import { useScrollIntoView } from "@/utils/useScrollIntoView";

import { isDifficulty } from "./bot/difficulty";
import { Board } from "./components/Board";
import { ResultPanel } from "./components/ResultPanel";
import { Scoreboard } from "./components/Scoreboard";
import { TurnStatus } from "./components/TurnStatus";
import styles from "./index.module.css";
import type { Side } from "./logic/board";
import { translations } from "./translations";
import { MODES, type Mode, useWallGo } from "./useWallGo";

const isMode = (value: string): value is Mode =>
  MODES.some((mode) => mode === value);

const isSide = (value: string): value is Side =>
  value === "red" || value === "blue";

const WallGo = () => {
  const copy = useTranslation(translations);
  const game = useWallGo(copy);
  const boardHeading = useScrollIntoView<HTMLHeadingElement>();
  const settingsRef = useRef<HTMLDivElement>(null);
  const { pending, state, outcome } = game;
  const versusBot = pending.mode === "bot";

  const focusSettings = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    settingsRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
    const select = settingsRef.current?.querySelector("select");
    if (select instanceof HTMLSelectElement) {
      select.focus();
    }
  };

  return (
    <PageWrapper fullScreen>
      <GameHeader title={copy.title} intro={copy.intro} />
      <Stack className={styles.game} gap={14}>
        <GameControls title={copy.controlsTitle}>
          <div className={styles.setup} ref={settingsRef}>
            <Select
              id="wall-go-mode"
              aria-label={copy.modeLabel}
              value={pending.mode}
              onChange={(event) => {
                if (isMode(event.target.value)) {
                  game.setPending({ ...pending, mode: event.target.value });
                }
              }}
            >
              {MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {copy.modes[mode]}
                </option>
              ))}
            </Select>
            <Select
              id="wall-go-side"
              aria-label={copy.sideLabel}
              value={pending.humanSide}
              disabled={!versusBot}
              onChange={(event) => {
                if (isSide(event.target.value)) {
                  game.setPending({
                    ...pending,
                    humanSide: event.target.value,
                  });
                }
              }}
            >
              <option value="red">{copy.sides.red}</option>
              <option value="blue">{copy.sides.blue}</option>
            </Select>
            <Select
              id="wall-go-difficulty"
              aria-label={copy.difficultyLabel}
              value={pending.difficulty}
              disabled={!versusBot}
              onChange={(event) => {
                if (isDifficulty(event.target.value)) {
                  game.setPending({
                    ...pending,
                    difficulty: event.target.value,
                  });
                }
              }}
            >
              <option value="easy">{copy.difficulties.easy}</option>
              <option value="medium">{copy.difficulties.medium}</option>
              <option value="hard">{copy.difficulties.hard}</option>
              <option value="expert">{copy.difficulties.expert}</option>
            </Select>
          </div>
          <PhysicalButton
            onClick={() => {
              game.start();
              boardHeading.scrollIntoView();
            }}
          >
            {copy.newGame}
          </PhysicalButton>
          <ConfirmPopover
            open={game.restarting && state !== null}
            onOpenChange={game.setRestarting}
            prompt={copy.restartPrompt}
            confirmLabel={copy.restartYes}
            cancelLabel={copy.restartNo}
            onConfirm={game.restart}
            trigger={
              <PhysicalButton variant="secondary" disabled={state === null}>
                {copy.restart}
              </PhysicalButton>
            }
          />
        </GameControls>
        <GameRules
          title={copy.rulesTitle}
          rules={copy.rules}
          startingTitle={copy.startingTitle}
          startingText={
            versusBot
              ? copy.startingBot(
                  copy.sides[pending.humanSide],
                  copy.difficulties[pending.difficulty],
                )
              : copy.startingPass
          }
        />
        {state ? (
          <>
            <ZoneHeading ref={boardHeading.ref}>{copy.boardTitle}</ZoneHeading>
            <Scoreboard
              note={outcome ? copy.finalNote : copy.securedNote}
              largest={
                outcome
                  ? copy.largestLine(
                      copy.cells(outcome.score.largest.red),
                      copy.cells(outcome.score.largest.blue),
                    )
                  : null
              }
            />
            <FeedbackLine feedback={game.feedback} />
            <TurnStatus
              text={game.status}
              side={state.phase === "over" ? null : state.toMove}
              redLabel={copy.sides.red}
              blueLabel={copy.sides.blue}
              redScore={outcome ? outcome.score.red : game.running.red}
              blueScore={outcome ? outcome.score.blue : game.running.blue}
              actionLabel={game.handoff ? copy.startTurn : undefined}
              onAction={game.handoff ? () => game.setHandoff(false) : undefined}
            />
            <div className={styles.stage}>
              <Board
                state={state}
                interactive={game.interactive}
                selectedPiece={game.piece}
                selectedDest={game.dest}
                destinations={game.destinations}
                wallEdges={game.wallEdges}
                owners={game.owners}
                preview={game.preview}
                copy={copy}
                onCell={game.onCell}
                onWall={game.onWall}
              />
            </div>
            {outcome ? (
              <ResultPanel
                title={
                  outcome.winner === "draw"
                    ? copy.draw
                    : copy.winner(copy.sides[outcome.winner])
                }
                detail={
                  state.endReason
                    ? copy.endings[state.endReason]
                    : copy.gameOver
                }
                scores={`${copy.score(copy.sides.red, outcome.score.red)} · ${copy.score(copy.sides.blue, outcome.score.blue)}`}
                largest={copy.largestLine(
                  copy.cells(outcome.score.largest.red),
                  copy.cells(outcome.score.largest.blue),
                )}
                playAgain={copy.playAgain}
                changeSettings={copy.changeSettings}
                onPlayAgain={game.restart}
                onChangeSettings={focusSettings}
              />
            ) : null}
          </>
        ) : null}
      </Stack>
    </PageWrapper>
  );
};

export default WallGo;
