# Wall Go — Pass-and-Play + Optional Solo Bot Game Specification

**Version:** 2.0  
**Format:** Local two-player pass-and-play, plus optional one-human-versus-computer mode  
**Inspiration:** Wall Go, the Prison Match from *The Devil's Plan: Death Room* (Season 2)  
**Purpose:** Gameplay and player-experience specification for a coding agent; no prescribed technology or architecture.

## 1. Core vision

Create a competitive, deterministic abstract strategy game with a default mode in which two people share one device and alternate turns. Also offer an optional solo mode in which one human competes against a computer-controlled opponent. Each controls four colored pieces on a 7 × 7 grid. Players move pieces and erect permanent walls to divide the board into territories. The goal is to finish with control of more squares than the other player.

The experience must emphasize spatial planning, the tension of gradually closing off regions, and the irreversibility of walls. There is no hidden information or online multiplayer requirement. The rules and scoring are identical in both modes; the solo bot selects its actions from the same legal options as a human. The bot may use randomness only when choosing among comparably ranked actions or on Easy difficulty.

## 2. Game parameters

- **Players:** Exactly two sides, identified as Red and Blue. Either two humans (pass-and-play) or one human against a bot (solo mode).
- **Board:** 7 columns × 7 rows = 49 square cells.
- **Pieces:** Four pieces per player, eight total.
- **Walls:** Short barriers placed along the interior edge shared by two orthogonally adjacent cells. The outer border of the board always acts as a barrier.
- **Turns:** Red and Blue alternate; Red starts the deployment phase and first normal turn.
- **Visibility:** All pieces, walls, legal moves, and current turn are public information.
- **No wall-breaking ability:** The special wall-breaking action used in the show's three-player match is **not available** in this two-player version.

## 3. Initial setup and deployment

1. Display an empty 7 × 7 board with the eight piece positions to be established.
2. Each player has **two predetermined starting pieces** and places **two additional pieces** during a short deployment phase. The precise televised starting coordinates are not reliably documented across public rule descriptions. For a repeatable, balanced default layout, use these **adapted** coordinates (rows and columns numbered 1–7):
   - Red starting pieces: (row 2, column 2), (row 6, column 6).
   - Blue starting pieces: (row 2, column 6), (row 6, column 2).
3. The four extra pieces are deployed in this order: **Red → Blue → Blue → Red**.
4. A player may place their next piece on any unoccupied cell. They cannot overlap an existing piece.
5. No walls are placed in the deployment phase.
6. After all eight pieces are on the board, Red takes the first normal turn.

**Optional variant for later:** Allow players to select from multiple predefined symmetrical opening layouts. Do not make this part of the initial release.

## 4. Normal turn: two mandatory actions

A normal turn consists of **(A) choosing and moving one of your pieces**, followed by **(B) placing exactly one new wall adjacent to that piece's destination cell**. Both actions form one turn. The wall may not be placed until a legal move is chosen.

### A. Choose a piece and move

1. Select one of your four pieces that has a legal turn available.
2. Move the piece by **zero, one, or two orthogonal steps** (up, down, left, or right).
3. A two-step move may continue straight or turn 90 degrees after the first step (an L-shaped move). No diagonal step is permitted.
4. Every traversed edge must be free of a wall. The piece may not leave the board.
5. A piece may not pass through or land on a cell occupied by any piece, whether friendly or opposing.
6. **Zero-step move:** A player may keep a piece on its cell only if that piece could legally step to an unoccupied adjacent cell and immediately return; a completely immobilized piece cannot use a zero-step move to continue building walls.
7. If two legal two-step routes reach the same destination, the destination is legal if at least one route is unobstructed.

### B. Place a wall

1. After choosing the destination (including legal zero-step moves), select one of the **four edges of the destination cell**.
2. That edge must separate the destination cell from another cell on the board, and must not already contain a wall.
3. Place exactly one wall on that edge. It remains in place for the rest of the game.
4. The wall blocks movement across that edge for **both** players, regardless of who built it.
5. It is legal to close a region completely, including a region containing an opponent's piece.
6. The move-and-wall combination is illegal if there is no free interior edge adjacent to the destination cell. Show only destinations that permit an accompanying wall.
7. The turn is complete only after the wall has been placed; then control passes to the other player.

**Turn interaction expectation:** Selecting a piece highlights permitted destinations. Selecting a destination previews valid adjacent wall positions; choosing an edge confirms the whole turn. Before confirming the wall, a player may change their destination or chosen piece. After confirmation, the move cannot be changed through normal play.

## 5. Territories and scoring

Walls partition the 49 cells into **regions**. A region is a set of cells connected by orthogonal moves across edges that have no wall. The board boundary closes its outside edges automatically.

Each completed region is scored by its occupants:

- **Only Red pieces present:** Red receives **1 point per cell** in that region.
- **Only Blue pieces present:** Blue receives **1 point per cell** in that region.
- **No pieces present:** Neutral; neither player receives points.
- **Pieces of both colors present:** Contested; normally neither player receives points for the region.
- **Special trapped-piece exception:** If a contested region has become impossible for every piece in it to move even one step, each player scores **1 point per cell occupied by their own piece** in that region. Other cells in that contested region earn no points. This covers the trapped mixed-piece exception reported for the television game.

A player can inadvertently create an opponent-controlled region by closing walls around only the opponent's pieces. Ownership depends on which pieces are **inside**, not who placed the final wall.

A region is counted **once** even if it contains several pieces of the same color. A piece's occupied cell is included in its region's total area.

### Score display

Keep the board and current turn prominent. Display Red's and Blue's **currently secured territory** (regions already separated from all enemy pieces) as an optional running score. Do not treat an unfinished, still-contested region as secured. When the game ends, prominently display the full final scores and highlight the scored regions by owner.

## 6. Game end

For a clear two-player digital version, use these deterministic end conditions:

1. **Normal ending:** The game ends as soon as **no connected region contains pieces of both colors**. At that point, every piece occupies an exclusively owned region and further partitioning cannot change who owns any of its cells. Empty regions remain neutral.
2. **Stalemate ending:** If the normal ending has not occurred but **neither player** has any legal move-and-wall turn, the game ends and currently defined territory scores are used, including the trapped-piece exception.
3. **Safety ending:** If the board has no available interior edges left, end and score the resulting board. This is a safeguard rather than an expected ending.
4. **Passing:** If one player has no legal move-and-wall turn, automatically skip their turn and give the other player a chance to play. The game does **not** end merely because one player is stuck while the other has available turns.

**Note on faithfulness:** Public rule summaries describe ending once the pieces' territories have been determined or all pieces are enclosed, without a fully consistent machine-checkable formulation. The conditions above explicitly operationalize that intention for a playable digital version. Do not silently replace them with a fixed number of rounds.

## 7. Determining the winner

1. Compare the total number of scored cells for Red and Blue.
2. The player with the **higher total** wins.
3. If total points are tied, compare each player's **largest single owned region** (number of cells). The player with the larger single region wins.
4. If both comparisons are tied, declare a **draw** and offer a rematch.

Do not apply artificial bonuses, player handicaps, or random tie-breakers in the default mode.

## 8. Pass-and-play experience

The game must feel natural for two people taking turns on the **same screen**.

- Clearly indicate whose turn it is (Red or Blue), including during deployment and the two action stages of a normal turn.
- Display both sides' pieces, existing walls, and board position continuously. There is no reason to conceal the previous player's moves: this is a perfect-information strategy game.
- After a player confirms a wall, show a simple **“Pass to Blue” / “Pass to Red”** handoff screen or overlay. The next player taps **“Start turn”** to resume. This is a courtesy handoff, not an attempt to hide information.
- Do not automatically rotate the board; both players should share a consistent orientation.
- The player who is acting should always see only their own selectable pieces as actionable, while the opponent's pieces remain visible.
- Highlight legal cells and available wall edges, with immediate, understandable feedback if a proposed action is invalid.
- Confirm the move only after the wall placement; a player can reconsider before that moment.
- At the end of the match, show the winner (or draw), both scores, each player's largest region, final territory colors, and a **Play again** action.
- Include a concise in-game **How to play** explanation covering movement, walls, territory ownership, the pass-and-play handoff, and scoring.

## 9. Timers and optional settings

The **default mode is untimed** so two people can learn and discuss strategy. For greater television-show pressure, offer an optional per-turn timer later. Timer expiration should not silently generate a random move; decide on a clearly communicated timer-loss or forced-pass policy before introducing timed play.

Recommended first-release settings: pass-and-play as the default; solo versus bot as an optional selection; standard board, default symmetric opening, no wall breaking, untimed human turns, and standard territory scoring. Avoid advanced rule variants until the primary game works reliably.

## 10. Examples of expected rules behavior

1. **L move:** A piece may move one cell up and then one cell right if both crossed edges are open and both traversed cells are free.
2. **No jump:** A piece may not cross a cell occupied by another piece to reach an open cell beyond it, even if the final cell is within two steps.
3. **Zero-step restriction:** A piece blocked on all four sides by walls, pieces, or the board border cannot choose to stand still and erect another wall.
4. **Wall next to moved piece:** A player moving to (row 4, column 3) cannot place a wall elsewhere on the board; it must touch that piece's destination cell.
5. **Ownership:** If a 6-cell sealed region contains two Red pieces and no Blue pieces, Red receives 6 points, not 12.
6. **Neutral region:** If a 4-cell sealed region contains no pieces, nobody scores it.
7. **Opponent benefits:** A Red wall that closes a 5-cell region containing only Blue pieces awards those 5 cells to Blue.
8. **Two-step blocked route:** If a direct route is blocked but an alternative valid L route reaches the same cell, that destination remains legal.
9. **Pass:** If Red has no legal movement-and-wall option, Blue continues without Red making an illegal turn.
10. **Tie:** If both players control 20 cells, compare the size of their respective largest single controlled region before declaring a draw.

## 11. Acceptance criteria

The game is complete when:

- Two humans can set up, deploy pieces, and finish a match using one screen and alternating handoffs, or one human can complete a match against a bot.
- Every piece move respects the 0–2-step rule, obstacles, and occupied cells.
- Every completed turn adds precisely one legal adjacent permanent wall.
- No wall-breaking action exists in the two-player mode.
- Invalid actions cannot change the established game state.
- Regions, neutral cells, contested regions, and ownership scores are consistent with the rules above.
- Turns skip properly when necessary, and the match reaches a defined ending without soft-locks.
- The displayed outcome follows the total-score, largest-region, then draw tie rules.
- A fresh rematch restores the initial board and deployment flow.

## 12. Relationship to the show and scope boundaries

This specification aims to retain the recognizable Season 2 Wall Go rules: 7 × 7 board, two-player four-piece setup, 0–2 orthogonal movements, compulsory adjacent permanent walls, territory ownership, and exclusion of the three-player wall break. **The chosen symmetric opening coordinates, explicit normal/stalemate end detection, and pass-and-play interaction are product decisions for this version**, not claims of exact televised implementation.

The **single-player computer opponent is now in scope**, alongside local pass-and-play. Online networking, accounts, spectator mode, and match history remain out of scope. The deliverable is a clear, reliable local strategy game with a choice of human or computer opponent.

### Rules reference reading

- Wall Go rules (fan implementation): https://quoridorgame.com/en/wall-go/rules/
- Independent breakdown of the Season 2 Prison Match: https://note.com/yoshiki_o/n/n0fca7e5eaf24?hl=en
- Another playable rules interpretation: https://www.playwallgo.com/rules

---

## 13. Solo mode: human versus bot

**Status:** New in version 2.0. This section specifies player-facing behavior and strategic requirements for an optional computer opponent. Sections 2–7 remain authoritative for board rules, turn legality, scoring, and endings. The bot never receives a special move, hidden information, an extra turn, or an altered scoring system.

### 13.1 Game selection and flow

1. At game start, choose **Pass-and-play** (two humans, default) or **Play versus bot** (one human, one computer opponent).
2. In solo mode, allow the human to play Red or Blue and choose **Easy**, **Medium**, **Hard**, or **Expert** difficulty. Default to Medium. Color choice determines which side moves first according to the normal rules; there is no compensating advantage.
3. Deployment occurs in the same Red → Blue → Blue → Red order for the additional pieces. When a placement slot belongs to the bot, it selects one legal empty cell. When a turn belongs to the bot, it chooses one legal complete action (piece movement plus wall, or any other explicitly legal action under section 4).
4. All bot moves and wall placements are visible when completed. Briefly show the chosen piece, destination, and wall so the player can follow the bot's decision. Do **not** require a pass-the-device handoff overlay during bot turns.
5. At every moment, only the active side can act. Human controls are disabled while the bot is deciding or animating its move. The human can still inspect the board and the public rules.
6. Provide **Restart** and **New game** options. A new game uses the chosen mode, side, and difficulty unless the human changes them.
7. No online service, account, AI training, or language model is necessary. The bot should function locally and deterministically when randomness is turned off.

### 13.2 Bot turn requirements

- The bot must choose **only actions that are legal under the same rules as a human**, including the mandatory adjacent-wall requirement, zero-step restriction, and passes when no action exists.
- Treat a movement and its required wall as **one inseparable candidate action** when evaluating outcomes. Do not evaluate a destination separately and then append an arbitrary wall.
- A bot may pass **only** when no legal complete action exists. It cannot voluntarily pass to avoid a difficult position.
- Before committing its selected action, recheck legality against the current board. A stale or invalid recommendation must be replaced with another currently legal action. Never freeze or modify the board illegally.
- If the match has ended, immediately apply the normal scoring and outcome rules; do not search or take further turns.

## 14. Bot strategy — recommended behavior

Use the open-source **schaoss/wall-go** project as a reference for the general approach, **not as a drop-in implementation**. Its bot combines legal-action generation, Minimax game-tree search, alpha-beta pruning, move ordering, and distance/territory scoring. The adaptation below adds stronger tactical evaluation and reliability safeguards. There is no requirement to copy the reference implementation or adopt its technology stack.

### 14.1 Opening-piece placement

At each bot deployment placement, evaluate every legal empty cell using a modest positional heuristic:

- **Future mobility:** Prefer cells with several unobstructed possible routes, rather than corners that will immediately trap the piece.
- **Spread and coverage:** Prefer placements that give the bot influence over multiple areas without clustering all its pieces together.
- **Coordination:** Give a moderate benefit to placements that can support enclosure plans with other friendly pieces.
- **Interference:** Consider whether a placement competes for strategically valuable territory or blocks an opponent's easy enclosure.
- **Safety:** Avoid giving the opponent an immediate, large, uncontested region unless the trade-off is favorable.

The repository's opening heuristic emphasizes center, friendly alignment, enemy alignment, corner pressure, and edge penalties. Treat these as **starting ideas**, not unchangeable weights. Pick a best-scoring legal placement; on Easy, or when several placements are approximately equal, variety is acceptable. The bot must respect the shared deployment order and all occupied cells.

### 14.2 Midgame search

For Medium and above, the bot should consider its own actions **and plausible responses from the human**, not merely the immediate result of its move. A reasonable baseline is **Minimax with alpha-beta pruning**, with deeper searching and better action ordering at higher difficulties.

- **Search branching:** Generate all legal complete move-plus-wall choices. Never prune the last legal action; tactical actions that seal a region, prevent an enclosure, or dramatically reduce the opponent's mobility must remain eligible.
- **Ordering:** Consider immediate territory claims, defensive wall placements, imminent enclosure threats, and mobility-restricting actions early. This improves the usefulness of limited search time.
- **Opponent modeling:** Assume the opponent will choose a strong response. Do not base Medium+ decisions on the opponent intentionally making bad moves.
- **Terminal states:** If a search line reaches a finished match, evaluate the actual winner using section 7. A proven win dominates any merely favorable nonterminal position, and a proven loss is worse than a viable continuation. Respect the largest-region tiebreaker and final draw outcome.
- **Search budget:** Use a configurable response-time budget appropriate for the device. Return the best **fully completed** search result before the budget expires, not an unfinished or partial evaluation.
- **Fallback:** If no search depth finishes in time, choose a legal action using an inexpensive evaluation. If the legal-action list is empty, follow the normal forced-pass or game-end rules.

### 14.3 Smarter position evaluation

The bot should not rely on immediate score alone, since it can miss important opportunities to build or stop enclosures. Evaluate each board position from the bot's point of view using these priorities:

1. **Guaranteed territory:** Reward regions that currently belong exclusively to the bot and penalize regions already belonging to the opponent. Value actual final scoring above speculative influence.
2. **Near-complete enclosures:** Reward a plan when a large region can plausibly be secured in the next move or two. Distinguish a promising almost-closed region from an area that merely looks close on the board.
3. **Opponent threats:** Penalize positions where an opponent can seal a high-value area or trap valuable mobility on its next turn. Immediate block-or-lose threats require strong penalties.
4. **Reachability / zone of control:** Compare which player can access each still-contested cell through existing openings. Walls must affect distances, and isolated inaccessible cells should not count as freely controllable.
5. **Piece mobility:** Reward a useful selection of future legal move-plus-wall actions, and penalize pieces whose movement or wall options are nearly exhausted. Count **legal complete turns**, not just neighboring empty cells.
6. **Territory fragmentation:** Favor splitting contested regions when the split improves expected net ownership; discourage creating empty neutral regions or accidentally giving the enemy larger uncontested regions.
7. **Largest owned region:** Use the largest-region rule as a meaningful tie consideration, but never let it outweigh a greater guaranteed total score.

These are strategic priorities rather than fixed numeric weights. Weights should be calibrated through repeated self-play and representative human test positions. Do not present the heuristic score as the player's actual point total or a literal win probability.

**Crucial distinction:** An area that appears surrounded but still connects to an opponent's piece through an unblocked edge is **not yet owned**. The bot should distinguish current secured territory from *potential* territory; only the former enters the displayed official score.

### 14.4 Tactical awareness

Before favoring a quiet positional move, explicitly consider whether a candidate action:

- Seals a large uncontested region for either side.
- Allows the opponent to seal such a region next turn.
- Prevents the opponent's only effective defense against an enclosure.
- Leaves the mover with no useful future actions while the opponent retains several.
- Splits a contested region into two portions with distinctly different probable owners.
- Converts an apparent win into a loss by creating an empty or enemy-owned region.

These checks should be evaluated according to the actual game rules, not visual appearances alone. A deeper search should generally outperform a shallower search on curated tactical positions.

## 15. Difficulty levels

| Difficulty | Intended experience | Strategy requirements |
|---|---|---|
| **Easy** | Forgiving beginner opponent | Mostly random **legal** actions, modest preference for immediately securing territory; may overlook longer-term threats. Never deliberately violate rules. |
| **Medium** | Understands basic territory strategy | Minimax with roughly two complete turns of lookahead as a starting target; considers immediate territory, reachability, and simple threats. |
| **Hard** | Makes credible defensive and offensive plans | Deeper search when feasible (roughly three to four plies as a goal), stronger move ordering, mobility and near-enclosure evaluation, and imminent-threat protection. |
| **Expert** | Strongest local opponent within a bounded response time | Adaptive depth, iterative deepening, careful tactical evaluation, endgame prioritization, and reuse of verified results. |

**Ply** means one player's completed action, including any required wall, rather than a single click or step. The suggested depths are **targets, not guarantees**; performance must be acceptable on ordinary devices and early-game branching may limit depth. A harder bot should generally play more effectively, but the specification does not claim mathematical optimality.

The chosen difficulty must be visible before a solo match begins. Do not silently alter difficulty in the middle of a match.

## 16. Search correctness and safeguards

The following are **behavioral and correctness requirements** for a coding agent; they are not instructions to use a particular programming language or architecture.

1. **Complete search-depth results:** When searching at increasing depths, adopt the recommendation from the deepest **fully completed** iteration. Do not compare raw evaluation values from different depths and keep an earlier move simply because its numeric score happened to be larger.
2. **Correct turn identity:** Every evaluated and cached position must distinguish which side acts next and any phase that changes legal moves (for example, deployment versus normal play). A matching board layout with a different side to move is not necessarily the same search position.
3. **Safe caching:** If using a transposition table, distinguish search depth and the meaning of the stored score (exact value versus a bound produced by pruning). A lower or upper bound must not be blindly reused as an exact evaluation. Cache collisions or stale entries must not cause illegal actions.
4. **Actual game transitions:** Search simulation must apply **all** effects of a complete action, including the wall, handoff of the turn, forced passes, scoring consequences, and game termination. The bot should assess the same board state the human would see after an actual move.
5. **Consistent perspective:** Scores must consistently indicate which side is favored. Switching Red/Blue or max/min roles must not invert or corrupt search decisions.
6. **Budget everywhere:** Honor the time/cancellation budget through the entire search, not merely at the outer loop. An interrupted search must return a previously validated legal fallback or completed iteration.
7. **No phantom legal moves:** The bot cannot assume a move is legal based only on its destination; wall availability, blocked intermediate cells, and the special zero-step condition must also be checked.
8. **No soft-locks:** In unusual positions with zero legal actions, loops, or no affordable search continuation, the game must automatically apply forced-pass/end rules. It must never get stuck on “thinking.”
9. **No cheating:** Search may inspect the publicly visible board and simulate outcomes, but cannot override the opponent's choice, invent moves, change the human's prior move, or award territory that hasn't legally been secured.
10. **Stable fallback:** Every bot turn with one or more legal actions must finish with one of those actions, even when advanced search cannot complete.

## 17. Bot feedback and user experience

The solo mode should feel like a clear, fair board-game opponent:

- Show a short **Bot thinking…** status, but never block board inspection.
- When a move is selected, show the piece movement and the placed wall as one understandable turn. A brief pause between the two visual stages is acceptable, but it must not allow the human to interrupt the half-completed move.
- Display the same territory totals and legal-rule explanation as pass-and-play; do not reveal internal numerical evaluations as if they were game scores.
- After a bot forced pass, explicitly explain that no legal move-and-wall option remained.
- If several bot moves are strategically equivalent, limited variation is desirable so repeat matches do not feel mechanically identical.
- Include a **Play again** action with the same settings and a way to change mode, side, or difficulty.
- In pass-and-play, preserve the existing “Pass to Red/Blue” handoff behavior. In solo mode, **skip handoff overlays** and automatically continue from the bot's action to the human's next turn.

## 18. Bot acceptance criteria and sample scenarios

In addition to section 11, verify that:

1. **Both modes function:** A complete match can be played either human-vs-human on one screen or human-vs-bot on one screen, with identical rules and scoring.
2. **Opening order:** The bot correctly takes its turn in the Red → Blue → Blue → Red deployment order, whether assigned Red or Blue.
3. **Legal compound moves:** Every chosen bot action respects movement, wall placement, occupied cells, and zero-step restrictions.
4. **Single-action turn:** A bot never moves one piece and places a wall beside another piece.
5. **Immediate capture:** Given a position where one legal move secures a significantly larger region than all alternatives, Medium, Hard, and Expert should choose the winning capture if it is not offset by a larger forced loss.
6. **Urgent defense:** Given a position where the opponent can secure a large region on the very next move, Hard and Expert should block it when a legal effective defense exists and is strategically superior.
7. **Trap recognition:** Given a candidate move that creates an enemy-owned region, stronger bots should accurately account for that lost territory.
8. **Mobility:** When guaranteed scores are otherwise comparable, stronger bots should generally avoid voluntarily trapping all their own pieces.
9. **Endgame:** If a forced win exists within the completed search horizon, the bot should favor it over a nonterminal line with a superficially attractive heuristic score.
10. **Tie awareness:** When final total territory ties, the bot correctly values the largest-owned-region tiebreaker; a remaining exact tie is a draw.
11. **Forced pass:** If the bot has no legal action but the human does, it passes and gameplay continues. If neither has an action and the normal separation ending has not occurred, use the stalemate rules.
12. **Search interruption:** A search that runs out of its budget still produces a legal move from the last completed search iteration or validated fallback.
13. **Search integrity:** Equivalent board layouts with different current players do not share incorrect cached values; previously examined positions do not produce invalid moves.
14. **Difficulty distinction:** Easy is observably less consistent than Hard/Expert over repeated representative positions, while all levels remain legal and responsive.
15. **No AI regressions:** Adding bot mode does not change pass-and-play deployment, turns, handoffs, official scoring, or existing win conditions.

## 19. Source attribution and boundaries

**Reference project:** [schaoss/wall-go](https://github.com/schaoss/wall-go) — a public browser remake of the game.

Relevant source references:

- [Minimax and evaluation](https://github.com/schaoss/wall-go/blob/main/src/ai/minimax-ai.ts) — alpha-beta search, iterative deepening, zone-of-control, territory potential and caching.
- [AI action utilities](https://github.com/schaoss/wall-go/blob/main/src/utils/ai.ts) — legal actions, random action choice, deployment heuristics and simulated actions.
- [Bot agents](https://github.com/schaoss/wall-go/tree/main/src/agents) — interfaces and bot orchestration.

**What is borrowed as inspiration:** traditional game-tree search, action enumeration, distance-based reachability, territory evaluation, and heuristic opening placement.

**What this document intentionally improves:** consistent result selection from fully completed search depths, terminal win/loss prioritization, turn/phase-correct cached positions, safe interpretation of alpha-beta bounds, whole-action simulation, robust time budgeting, better recognition of enclosure threats, scoring-versus-potential distinction, and multiple player-facing difficulty levels.

The reference repository is **not** the authoritative source of televised rules. Whenever it differs from sections 2–7, implement **this specification's** rules for the current product. The enhanced heuristic priorities and difficulty levels are **new design choices**, not claims about what the television show used or what the reference repository already implements.
