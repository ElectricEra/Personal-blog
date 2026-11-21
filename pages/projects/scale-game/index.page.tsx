import { useState } from "react";

import { ButtonRow } from "@/components/ButtonRow/ButtonRow";
import { FeedbackLine } from "@/components/FeedbackLine/FeedbackLine";
import { ConfirmPopover } from "@/components/GameControls/ConfirmPopover";
import { GameControls } from "@/components/GameControls/GameControls";
import { SettingsButton } from "@/components/GameControls/SettingsButton";
import { GameHeader } from "@/components/GameHeader/GameHeader";
import { GameRules } from "@/components/GameRules/GameRules";
import { Hint } from "@/components/Hint/Hint";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import { Select } from "@/components/Select/Select";
import {
  SettingsCheckbox,
  SettingsModal,
} from "@/components/SettingsModal/SettingsModal";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { ZoneHeading } from "@/components/ZoneHeading/ZoneHeading";
import { useTranslation } from "@/utils/i18n";
import { useScrollIntoView } from "@/utils/useScrollIntoView";

import { GuessDialog } from "./components/GuessDialog";
import { Inventory } from "./components/Inventory";
import { MoveHistory } from "./components/MoveHistory";
import { Notes } from "./components/Notes";
import { OrderBoard } from "./components/OrderBoard";
import { ScaleCard } from "./components/ScaleCard";
import { WeightReveal } from "./components/WeightReveal";
import styles from "./index.module.css";
import { canCommit, reportOutcome } from "./logic/board";
import { DIFFICULTY_IDS, isDifficulty, type ScaleId } from "./logic/config";
import { translations } from "./translations";
import { useOrderBoard } from "./useOrderBoard";
import { useScaleGame } from "./useScaleGame";

const SCALE_IDS: readonly ScaleId[] = ["main", "secondary"];

const ScaleGame = () => {
  const copy = useTranslation(translations);
  const game = useScaleGame(copy);
  const orderBoard = useOrderBoard(game.challenge, game.interactive);
  const information = useScrollIntoView<HTMLHeadingElement>();
  const [notes, setNotes] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ghostPairs, setGhostPairs] = useState(false);
  const { challenge, config, interactive, pending, phase, selected } = game;
  const scaleName = (scale: ScaleId) =>
    scale === "main" ? copy.mainScale : copy.secondScale;

  const startGame = () => {
    orderBoard.reset(game.startGame());
    setNotes("");
    information.scrollIntoView();
  };

  return (
    <PageWrapper fullScreen>
      <GameHeader title={copy.title} intro={copy.intro} />
      <Stack className={styles.game} gap={14}>
        <GameControls title={copy.controlsTitle}>
          <Select
            id="scale-difficulty"
            aria-label={copy.difficultyLabel}
            value={game.difficulty}
            onChange={(event) => {
              if (isDifficulty(event.target.value)) {
                game.setDifficulty(event.target.value);
              }
            }}
          >
            {DIFFICULTY_IDS.map((id) => (
              <option key={id} value={id}>
                {copy.difficulties[id]}
              </option>
            ))}
          </Select>
          <PhysicalButton onClick={startGame}>{copy.newGame}</PhysicalButton>
          <ConfirmPopover
            open={interactive && game.resigning}
            onOpenChange={game.setResigning}
            prompt={copy.resignPrompt}
            confirmLabel={copy.resignYes}
            cancelLabel={copy.resignNo}
            onConfirm={game.resign}
            trigger={
              <PhysicalButton variant="secondary" disabled={!interactive}>
                {copy.resign}
              </PhysicalButton>
            }
          />
          <SettingsButton
            label={copy.settingsTitle}
            expanded={settingsOpen}
            onClick={() => setSettingsOpen(true)}
          />
        </GameControls>
        <GameRules
          title={copy.rulesTitle}
          rules={copy.rules}
          startingTitle={copy.startingTitle}
          startingText={copy.difficultyDetail[game.difficulty]}
        />
        {challenge ? (
          <>
            <ZoneHeading ref={information.ref}>
              {copy.informationTitle}
            </ZoneHeading>
            {challenge.revealed.map((color) => (
              <Text key={color}>
                {config.medianReveal
                  ? copy.medianClue(
                      copy.colors[color],
                      challenge.weights[color],
                    )
                  : copy.revealedWeight(
                      copy.colors[color],
                      challenge.weights[color],
                    )}
              </Text>
            ))}
            <ZoneHeading>{copy.playZoneTitle}</ZoneHeading>
            <ButtonRow layout="stretch">
              <PhysicalButton
                onClick={game.commitMove}
                disabled={
                  !interactive || !canCommit(pending.length, config.minPlace)
                }
              >
                {copy.commit}
              </PhysicalButton>
              <PhysicalButton
                variant="secondary"
                onClick={game.undo}
                disabled={!interactive || pending.length === 0}
              >
                {copy.undo}
              </PhysicalButton>
              <PhysicalButton
                variant="secondary"
                onClick={game.clearPending}
                disabled={!interactive || pending.length === 0}
              >
                {copy.clearPending}
              </PhysicalButton>
            </ButtonRow>
            <Inventory
              challenge={challenge}
              remaining={game.remaining}
              pendingCount={pending.length}
              minPlace={config.minPlace}
              interactive={interactive}
              copy={copy}
              onPlace={game.place}
            />
            {interactive ? (
              <Hint align="center">
                {copy.placingOn(
                  scaleName(selected.scale),
                  selected.side === "left" ? copy.leftPan : copy.rightPan,
                )}
              </Hint>
            ) : null}
            <FeedbackLine feedback={game.feedback} />
            {interactive && game.solved ? (
              <ButtonRow layout="center">
                <PhysicalButton onClick={game.openGuessDialog}>
                  {copy.submitGuess}
                </PhysicalButton>
                {config.partialCounts ? (
                  <PhysicalButton
                    variant="secondary"
                    onClick={game.finishPartial}
                  >
                    {copy.takePartial}
                  </PhysicalButton>
                ) : null}
              </ButtonRow>
            ) : null}
            {phase !== "idle" && phase !== "playing" ? (
              <WeightReveal
                challenge={challenge}
                won={phase === "full"}
                copy={copy}
              />
            ) : null}
            <div className={styles.scales}>
              {SCALE_IDS.map((scale) => (
                <ScaleCard
                  key={scale}
                  title={scaleName(scale)}
                  scaleId={scale}
                  committed={game.board[scale]}
                  pending={pending}
                  outcome={reportOutcome(game.board[scale], challenge.weights)}
                  selectedSide={selected.scale === scale ? selected.side : null}
                  interactive={interactive}
                  ghostPairs={ghostPairs}
                  copy={copy}
                  onSelect={(side) => game.setSelected({ scale, side })}
                  onRemove={(side, color) =>
                    game.removePending(scale, side, color)
                  }
                />
              ))}
            </div>
            <Hint>{copy.resultNote}</Hint>
            <ZoneHeading>{copy.notesZoneTitle}</ZoneHeading>
            <OrderBoard
              challenge={challenge}
              order={orderBoard.order}
              picked={orderBoard.picked}
              guess={game.guess}
              interactive={interactive}
              copy={copy}
              onPick={orderBoard.pickColor}
              onPlace={orderBoard.placePicked}
              onWeight={game.setGuessValue}
            />
            <Notes value={notes} copy={copy} onChange={setNotes} />
            <MoveHistory history={game.history} copy={copy} />
          </>
        ) : null}
      </Stack>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={copy.settingsTitle}
        closeLabel={copy.close}
      >
        <SettingsCheckbox
          label={copy.ghostPairs}
          checked={ghostPairs}
          onChange={setGhostPairs}
        />
      </SettingsModal>
      {challenge && game.dialogGuess ? (
        <GuessDialog
          challenge={challenge}
          order={orderBoard.order}
          values={game.dialogGuess}
          error={game.dialogError}
          copy={copy}
          onChange={game.setDialogValue}
          onConfirm={game.confirmGuess}
          onClose={game.closeGuessDialog}
        />
      ) : null}
    </PageWrapper>
  );
};

export default ScaleGame;
