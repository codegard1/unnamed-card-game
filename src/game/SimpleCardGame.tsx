import { Game, ITurnOption, Player, TurnOptions } from '.';
import { IGameMetadata } from './GameMetadata';

/**
 * SimpleCardGame - Example implementation of a simple card game
 *
 * This class extends the base Game class to provide a simple card drawing game
 * where players draw cards until someone has 10 cards or the deck is empty.
 * The winner is the player with the most cards.
 */
export class SimpleCardGame extends Game {
  /**
   * Game metadata including description, rules, version, creator, and website
   */
  protected metadata: IGameMetadata = {
    description: `
# Simple Card Game

A basic card drawing game where players compete to collect the most cards.
Players take turns drawing cards from a shared deck until someone reaches 10 cards or the deck runs out.
    `.trim(),
    rules: `
# Game Rules

## Objective
Be the player with the most cards when the game ends.

## Setup
- Each player starts with 5 cards dealt from a standard 52-card deck.

## Gameplay
- On your turn, you must draw one card from the deck.
- If the deck runs out of cards, the game ends immediately.
- Players take turns in order.

## Winning
- The game ends when any player has 10 or more cards, or when the deck is empty.
- The player with the most cards wins.
- If there is a tie, all tied players are declared winners.

## Turn Options
- **Draw Card**: Draw a card from the deck and add it to your hand (required action).
- **Pass**: Skip your turn without drawing (available but not recommended).
- **Bet**: Not yet implemented.
    `.trim(),
    version: '1.0.0',
    creatorName: 'Anonymous',
    rulesWebsite: 'https://example.com/simple-card-game-rules',
  };

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

  getTurnOptions(player: Player): ITurnOption[] {
    return [
      { key: TurnOptions.DRAW_CARD, displayName: "Draw card", disabled: false },
      { key: TurnOptions.PASS, displayName: "Pass", disabled: false },
      { key: TurnOptions.BET, displayName: "Bet", disabled: true },
    ];
  }
}
