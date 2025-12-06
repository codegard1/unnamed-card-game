/**
 * Represents the current status of the game
 */
export enum GameStatus {
  /** Game has not started yet */
  Init = 'init',
  /** Game is currently in progress */
  InProgress = 'in-progress',
  /** Waiting for the next player's turn */
  NextTurn = 'next-turn',
  /** Betting phase is active */
  Betting = 'betting',
  /** Dealing cards to players */
  Dealing = 'dealing',
  /** Game has ended */
  GameOver = 'game-over',
  /** Human player won */
  HumanWins = 'human-wins',
  /** Dealer/house won */
  DealerWins = 'dealer-wins',
  /** Game ended in a tie/push */
  Push = 'push',
}
