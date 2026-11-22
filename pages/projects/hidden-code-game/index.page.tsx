import { useState } from "react";

import { ButtonRow } from "@/components/ButtonRow/ButtonRow";
import { FeedbackLine } from "@/components/FeedbackLine/FeedbackLine";
import { ConfirmPopover } from "@/components/GameControls/ConfirmPopover";
import { GameControls } from "@/components/GameControls/GameControls";
import { GameHeader } from "@/components/GameHeader/GameHeader";
import { GameRules } from "@/components/GameRules/GameRules";
import { Hint } from "@/components/Hint/Hint";
import { HistoryList } from "@/components/HistoryList/HistoryList";
import PageWrapper from "@/components/PageWrapper/PageWrapper";
import { PhysicalButton } from "@/components/PhysicalButton/PhysicalButton";
import { Pill } from "@/components/Pill/Pill";
import { Select } from "@/components/Select/Select";
import { Stack } from "@/components/Stack/Stack";
import { Text } from "@/components/Text/Text";
import { ZoneHeading } from "@/components/ZoneHeading/ZoneHeading";
import { cx } from "@/utils/cx";
import { useTranslation } from "@/utils/i18n";
import { useScrollIntoView } from "@/utils/useScrollIntoView";

import { AnswerDialog } from "./components/AnswerDialog";
import { Counter } from "./components/Counter";
import { DigitTray } from "./components/DigitTray";
import { MiniStar } from "./components/MiniStar";
import { Notes } from "./components/Notes";
import { SessionSummary } from "./components/SessionSummary";
import { StarBoard } from "./components/StarBoard";
import styles from "./index.module.css";
import { isMode, MODES } from "./logic/session";
import { translations } from "./translations";
import { useHiddenCode } from "./useHiddenCode";
import { useTestStar } from "./useTestStar";

const HiddenCode = () => {
  const copy = useTranslation(translations);
  const game = useHiddenCode(copy);
  const star = useTestStar(game.interactive, game.dismissTestFeedback);
  const challengeHeading = useScrollIntoView<HTMLHeadingElement>();
  const [notes, setNotes] = useState("");
  const [confirmingRoll, setConfirmingRoll] = useState(false);
  const summary = useScrollIntoView<HTMLDivElement>();

  const begin = (faces: ReturnType<typeof game.start>) => {
    if (!faces) {
      return;
    }
    star.reset(faces);
    setNotes("");
    setConfirmingRoll(false);
    challengeHeading.scrollIntoView();
  };

  const point = copy.positions[star.selected];

  return (
    <PageWrapper fullScreen>
      <GameHeader title={copy.title} intro={copy.intro} />
      <Stack className={styles.game} gap={14}>
        <GameControls title={copy.controlsTitle}>
          <Select
            id="hidden-code-mode"
            aria-label={copy.modeLabel}
            value={game.mode}
            onChange={(event) => {
              if (isMode(event.target.value)) {
                game.setMode(event.target.value);
              }
            }}
          >
            {MODES.map((mode) => (
              <option key={mode} value={mode}>
                {copy.modes[mode]}
              </option>
            ))}
          </Select>
          <PhysicalButton onClick={() => begin(game.start())}>
            {copy.newGame}
          </PhysicalButton>
          <ConfirmPopover
            open={game.interactive && game.resigning}
            onOpenChange={game.setResigning}
            prompt={copy.resignPrompt}
            confirmLabel={copy.resignYes}
            cancelLabel={copy.resignNo}
            onConfirm={game.resign}
            trigger={
              <PhysicalButton variant="secondary" disabled={!game.interactive}>
                {copy.resign}
              </PhysicalButton>
            }
          />
        </GameControls>
        <GameRules
          title={copy.rulesTitle}
          rules={copy.rules}
          startingTitle={copy.startingTitle}
          startingText={copy.modeDetail[game.mode]}
        />
        {game.phase === "summary" ? (
          <div ref={summary.ref} className={styles.summary}>
            <SessionSummary
              score={game.score}
              total={game.puzzleTotal}
              tests={game.sessionTests}
              misses={game.sessionMisses}
              time={game.timeText}
              copy={copy}
            />
          </div>
        ) : null}
        {game.challenge ? (
          <>
            <ZoneHeading ref={challengeHeading.ref}>
              {copy.challengeTitle}
            </ZoneHeading>
            {game.showSession || game.showTimer ? (
              <div className={styles.status}>
                {game.showSession ? (
                  <Pill>
                    {copy.puzzleProgress(game.puzzleNumber, game.puzzleTotal)}
                  </Pill>
                ) : null}
                {game.showTimer ? (
                  <Pill>{copy.scoreLabel(game.score)}</Pill>
                ) : null}
                {game.showTimer ? (
                  <Pill>{copy.timeLabel(game.timeText)}</Pill>
                ) : null}
              </div>
            ) : null}
            <StarBoard
              title={copy.challengeStarLabel}
              star={game.challenge}
              result={game.reveal ? String(game.reveal.result) : "?"}
              resultLabel={
                game.reveal
                  ? copy.resultLabel(String(game.reveal.result))
                  : copy.resultUnknown
              }
              interactive={false}
              selected={null}
              placement={null}
              dice={[]}
              copy={copy}
            />
            {game.interactive ? (
              <div className={cx(styles.panel, styles.counterBar)}>
                {game.answersLeft !== null ? (
                  <Counter
                    label={copy.answersCounter}
                    value={game.answersLeft}
                    spent={game.answersLeft === 0}
                    description={copy.answersLeft(game.answersLeft)}
                  />
                ) : null}
                <PhysicalButton
                  className={styles.barButton}
                  onClick={game.openAnswer}
                >
                  {copy.submitAnswer}
                </PhysicalButton>
              </div>
            ) : null}
            <FeedbackLine feedback={game.answerFeedback} />
            {game.hint ? (
              <>
                <h2 className={styles.subheading}>{copy.hintTitle}</h2>
                <Text>{copy.hintText(game.hint.result)}</Text>
                <StarBoard
                  title={copy.exampleStarLabel}
                  star={game.hint.star}
                  result={String(game.hint.result)}
                  resultLabel={copy.resultLabel(String(game.hint.result))}
                  interactive={false}
                  selected={null}
                  placement={null}
                  dice={[]}
                  copy={copy}
                />
              </>
            ) : null}
            {game.reveal ? (
              <section className={styles.reveal} aria-label={copy.revealTitle}>
                <h2 className={styles.subheading}>{copy.revealTitle}</h2>
                <Text>{copy.explanations[game.reveal.ruleId]}</Text>
                <Text>{copy.challengeResult(game.reveal.result)}</Text>
                <StarBoard
                  title={copy.exampleStarLabel}
                  star={game.reveal.example}
                  result={String(game.reveal.exampleResult)}
                  resultLabel={copy.resultLabel(
                    String(game.reveal.exampleResult),
                  )}
                  interactive={false}
                  selected={null}
                  placement={null}
                  dice={[]}
                  copy={copy}
                />
                <Text>{copy.exampleGives(game.reveal.exampleResult)}</Text>
              </section>
            ) : null}
            {game.phase === "revealed" && game.showSession ? (
              <ButtonRow layout="center">
                <PhysicalButton
                  onClick={() => {
                    const faces = game.continueSession();
                    if (!faces) {
                      summary.scrollIntoView();
                      return;
                    }
                    begin(faces);
                  }}
                >
                  {game.isLast ? copy.seeResults : copy.nextPuzzle}
                </PhysicalButton>
              </ButtonRow>
            ) : null}
            <ZoneHeading>{copy.experimentTitle}</ZoneHeading>
            <StarBoard
              title={copy.testStarLabel}
              star={star.star}
              result={copy.emptyMark}
              resultLabel={copy.resultDraft}
              interactive={game.interactive}
              selected={game.interactive ? star.selected : null}
              placement={star.placement}
              dice={star.dice}
              copy={copy}
              onSelect={star.setSelected}
              onRemove={star.takeBack}
            />
            <div className={styles.panel}>
              <DigitTray
                dice={star.unplaced}
                point={point}
                interactive={game.interactive}
                copy={copy}
                onPlace={star.place}
              />
              {game.interactive ? (
                <Hint align="center">{copy.addingTo(point)}</Hint>
              ) : null}
              <div className={styles.counterBar}>
                <Counter
                  label={copy.testsCounter}
                  value={game.puzzleTests}
                  max={game.maxTests}
                  spent={game.testsExhausted}
                  description={copy.testsLabel(game.puzzleTests, game.maxTests)}
                />
                <PhysicalButton
                  className={styles.barButton}
                  onClick={() => game.runTest(star.star, star.complete)}
                  disabled={
                    !game.interactive || !star.complete || game.testsExhausted
                  }
                >
                  {copy.runTest}
                </PhysicalButton>
              </div>
              <div className={styles.editRow}>
                <PhysicalButton
                  variant="secondary"
                  className={styles.editButton}
                  onClick={star.undo}
                  disabled={!game.interactive || !star.canUndo}
                >
                  {copy.undo}
                </PhysicalButton>
                <PhysicalButton
                  variant="secondary"
                  className={styles.editButton}
                  onClick={star.clear}
                  disabled={!game.interactive || !star.draft}
                >
                  {copy.clear}
                </PhysicalButton>
                <ConfirmPopover
                  open={game.interactive && confirmingRoll}
                  onOpenChange={setConfirmingRoll}
                  prompt={copy.newDigitsPrompt}
                  confirmLabel={copy.newDigitsYes}
                  cancelLabel={copy.newDigitsNo}
                  onConfirm={() => {
                    star.rollNew();
                    setConfirmingRoll(false);
                  }}
                  trigger={
                    <PhysicalButton
                      variant="secondary"
                      className={styles.editButton}
                      disabled={!game.interactive}
                      onClick={(event) => {
                        if (!star.draft) {
                          event.preventDefault();
                          star.rollNew();
                        }
                      }}
                    >
                      {copy.newDigits}
                    </PhysicalButton>
                  }
                />
              </div>
              {game.interactive && game.testsExhausted ? (
                <Hint align="center">{copy.noTestsLeft}</Hint>
              ) : null}
              {game.interactive && !game.testsExhausted && !star.complete ? (
                <Hint align="center">{copy.placeAll}</Hint>
              ) : null}
            </div>
            <FeedbackLine feedback={game.testFeedback} />
            <ZoneHeading>{copy.notesZoneTitle}</ZoneHeading>
            <Notes value={notes} copy={copy} onChange={setNotes} />
            <HistoryList
              title={copy.historyTitle}
              emptyText={copy.historyEmpty}
              items={game.history}
              layout="grid"
              renderItem={(item) => (
                <MiniStar star={item.star} result={item.result} copy={copy} />
              )}
            />
          </>
        ) : null}
      </Stack>
      {game.answerOpen ? (
        <AnswerDialog
          value={game.answerDraft}
          error={game.answerError}
          copy={copy}
          onChange={game.setAnswerDraft}
          onConfirm={game.confirmAnswer}
          onClose={game.closeAnswer}
        />
      ) : null}
    </PageWrapper>
  );
};

export default HiddenCode;
