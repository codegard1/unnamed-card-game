import { Game, Player } from '.';

/**
 * SimpleCardGame - Example implementation of a simple card game
 *
 * This class extends the base Game class to provide a simple card drawing game
 * where players draw cards until someone has 10 cards or the deck is empty.
 * The winner is the player with the most cards.
 */
export class SimpleCardGame extends Game {
  /**
   * Deals initial cards to all players at the start of the game
   * Each player receives 5 cards from the deck
   */
  protected dealInitialCards(): void {
    for (let i = 0; i < 5; i++) {
      this.players.forEach(player => {
        const card = this.deck.draw();
        if (card) {
          player.addCard(card);
        }
      });
    }
  }

  /**
   * Executes a single turn for a player
   * @param player - The player taking their turn
   */
  playTurn(player: Player): void {
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
    }
  }

  /**
   * Checks if the game has ended
   * @returns true if the deck is empty or any player has 10 or more cards
   */
  isGameOver(): boolean {
    return this.deck.size === 0 || this.players.some(p => p.handSize >= 10);
  }

  /**
   * Determines the winner(s) of the game
   * @returns The player with the most cards, an array of players if tied, or null if game isn't over
   */
  getWinner(): Player | Player[] | null {
    if (!this.isGameOver()) {
      return null;
    }
    const maxCards = Math.max(...this.players.map(p => p.handSize));
    const winners = this.players.filter(p => p.handSize === maxCards);
    return winners.length === 1 ? winners[0] : winners;
  }
}
