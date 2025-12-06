/**
 * Represents actions a player can take during the game
 */
export enum PlayerAction {
  /** No action taken yet */
  None = 'none',
  /** Player requests another card */
  Hit = 'hit',
  /** Player keeps current hand */
  Stand = 'stand',
  /** Player places a bet */
  Bet = 'bet',
  /** Player places an ante (initial bet) */
  Ante = 'ante',
  /** Player's turn has started */
  StartTurn = 'start-turn',
  /** Player's turn has ended */
  EndTurn = 'end-turn',
  /** Player has finished for the round */
  Finish = 'finish',
  /** Player doubles down (doubles bet, gets one card) */
  DoubleDown = 'double-down',
  /** Player splits a pair into two hands */
  Split = 'split',
  /** Player surrenders (forfeits half bet) */
  Surrender = 'surrender',
}
