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
import { Pill } from "@/components/Pill/Pill";
import { Select } from "@/components/Select/Select";
import {
  SettingsCheckbox,
  SettingsModal,
} from "@/components/SettingsModal/SettingsModal";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { Separator, ZoneHeading } from "@/components/ZoneHeading/ZoneHeading";
import { useTranslation } from "@/utils/i18n";
import { useScrollIntoView } from "@/utils/useScrollIntoView";

import { AttemptHistory } from "./components/AttemptHistory";
import { Board } from "./components/Board";
import { legalSteps } from "./game";
import styles from "./index.module.css";
import { translations } from "./translations";
import { type MemorizeSeconds, useMemoryPath } from "./useMemoryPath";

const MEMORIZE_VALUES: MemorizeSeconds[] = [60, 30, 15, 0];

const isMemorizeSeconds = (value: number): value is MemorizeSeconds =>
  MEMORIZE_VALUES.some((seconds) => seconds === value);

const MemoryPath = () => {
  const copy = useTranslation(translations);
  const game = useMemoryPath(copy);
  const information = useScrollIntoView<HTMLHeadingElement>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const { phase, path, revealed, interactive, startLetter, endLetter, target } =
    game;
  const playing = phase === "play";
  const highlighted =
    showMoves &&
    interactive &&
    game.startIndex !== undefined &&
    game.endIndex !== undefined
      ? legalSteps(path, game.startIndex, game.endIndex)
      : new Set<number>();

  const startGame = () => {
    game.startGame();
    information.scrollIntoView();
  };

  return (
    <PageWrapper fullScreen>
      <GameHeader title={copy.title} intro={copy.intro} />
      <Stack className={styles.game} gap={14}>
        <GameControls title={copy.controlsTitle}>
          <Select
            id="memorize-seconds"
            aria-label={copy.memorizeLabel}
            value={game.seconds}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (isMemorizeSeconds(value)) {
                game.setSeconds(value);
              }
            }}
          >
            {MEMORIZE_VALUES.map((value) => (
              <option key={value} value={value}>
                {copy.memorizeOptions[value]}
              </option>
            ))}
          </Select>
          <PhysicalButton onClick={startGame}>{copy.newBoard}</PhysicalButton>
          <ConfirmPopover
            open={interactive && game.revealing}
            onOpenChange={game.setRevealing}
            prompt={copy.revealPrompt}
            confirmLabel={copy.revealYes}
            cancelLabel={copy.revealNo}
            onConfirm={game.toggleReveal}
            trigger={
              <PhysicalButton
                variant="secondary"
                disabled={!playing}
                onClick={(event) => {
                  if (revealed) {
                    event.preventDefault();
                    game.toggleReveal();
                  }
                }}
              >
                {revealed ? copy.hide : copy.reveal}
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
          startingText={copy.startingInfo[game.seconds]}
        />
        {game.round ? (
          <>
            <ZoneHeading ref={information.ref}>
              {copy.informationTitle}
            </ZoneHeading>
            <p className={styles.status}>
              {playing
                ? copy.routeStatus(startLetter, endLetter, target)
                : copy.memorizeStatus}
            </p>
            <Text>
              {playing
                ? copy.routeDetail(startLetter, endLetter, target)
                : copy.memorizeDetail}
            </Text>
            {phase === "memorize" && game.remaining !== null ? (
              <p className={styles.timer}>
                {copy.secondsRemaining(game.remaining)}
              </p>
            ) : null}
            {playing ? (
              <>
                <div className={styles.results}>
                  <span className={styles.total}>
                    {game.checked
                      ? copy.total(game.pathSum, target)
                      : copy.totalHidden}
                  </span>
                  <Pill>{copy.cells(path.length)}</Pill>
                </div>
                {game.checked ? null : <Hint>{copy.resultNote}</Hint>}
                <ButtonRow layout="stretch">
                  <PhysicalButton onClick={game.checkPath} disabled={revealed}>
                    {copy.checkPath}
                  </PhysicalButton>
                  <PhysicalButton
                    variant="secondary"
                    onClick={game.undo}
                    disabled={path.length === 0 || revealed}
                  >
                    {copy.undo}
                  </PhysicalButton>
                  <PhysicalButton
                    variant="secondary"
                    onClick={game.clearPath}
                    disabled={path.length === 0 || revealed}
                  >
                    {copy.clearPath}
                  </PhysicalButton>
                </ButtonRow>
              </>
            ) : (
              <ButtonRow layout="center">
                <PhysicalButton onClick={game.flipBoard}>
                  {copy.flipNow}
                </PhysicalButton>
              </ButtonRow>
            )}
            <FeedbackLine feedback={game.feedback} />
            <ZoneHeading>{copy.playZoneTitle}</ZoneHeading>
            <Board
              numbers={game.numbers}
              path={path}
              showNumbers={phase === "memorize" || revealed}
              showRoute={playing}
              interactive={interactive}
              startIndex={game.startIndex}
              endIndex={game.endIndex}
              highlighted={highlighted}
              copy={copy}
              onChoose={game.chooseCell}
            />
            {playing ? (
              <>
                <Separator />
                <AttemptHistory
                  attempts={game.attempts}
                  target={target}
                  copy={copy}
                />
              </>
            ) : null}
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
          label={copy.showMoves}
          checked={showMoves}
          onChange={setShowMoves}
        />
      </SettingsModal>
    </PageWrapper>
  );
};

export default MemoryPath;
