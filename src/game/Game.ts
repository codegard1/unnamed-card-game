import { Deck } from './Deck';
import { Player } from './Player';
import { Card } from './Card';

/**
 * Base class for card games
 * This can be extended to implement specific game rules
 */
export abstract class Game {
  protected deck: Deck;
  protected players: Player[] = [];
  protected currentPlayerIndex: number = 0;
  protected isGameActive: boolean = false;

  constructor(playerNames: string[]) {
    this.deck = new Deck();
    this.initializePlayers(playerNames);
  }

  /**
   * Initializes players for the game
   */
  private initializePlayers(playerNames: string[]): void {
    playerNames.forEach((name, index) => {
      this.players.push(new Player(`player-${index}`, name));
    });
  }

  /**
   * Starts a new game
   */
  start(): void {
    this.deck.reset();
    this.players.forEach(player => player.reset());
    this.currentPlayerIndex = 0;
    this.isGameActive = true;
    this.dealInitialCards();
  }

  /**
   * Deals initial cards to players
   * Override this method to implement specific dealing logic
   */
  protected abstract dealInitialCards(): void;

  /**
   * Processes a player's turn
   * Override this method to implement specific turn logic
   */
  abstract playTurn(player: Player): void;

  /**
   * Determines if the game has ended
   * Override this method to implement specific end conditions
   */
  abstract isGameOver(): boolean;

  /**
   * Determines the winner(s) of the game
   * Override this method to implement specific winning conditions
   */
  abstract getWinner(): Player | Player[] | null;

  /**
   * Returns the current player
   */
  getCurrentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Advances to the next player
   */
  nextPlayer(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
  }

  /**
   * Returns all players in the game
   */
  getPlayers(): Player[] {
    return [...this.players];
  }

  /**
   * Returns the game deck
   */
  getDeck(): Deck {
    return this.deck;
  }

  /**
   * Returns whether the game is currently active
   */
  isActive(): boolean {
    return this.isGameActive;
  }

  /**
   * Ends the game
   */
  endGame(): void {
    this.isGameActive = false;
  }
}
