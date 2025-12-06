/**
 * Represents the current status of a player in the game
 */
export enum PlayerStatus {
  /** Player is active and in good standing */
  OK = 'ok',
  /** Player has exceeded 21 points */
  Busted = 'busted',
  /** Player won the round */
  Winner = 'winner',
  /** Player lost the round */
  Loser = 'loser',
  /** Player has blackjack (21 with initial 2 cards) */
  Blackjack = 'blackjack',
  /** Player is waiting for their turn */
  Waiting = 'waiting',
  /** Player is sitting out this round */
  SittingOut = 'sitting-out',
}
