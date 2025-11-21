import { Card, Suit, Rank } from './Card';

/**
 * Represents a deck of playing cards
 */
export class Deck {
  private cards: Card[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the deck with a standard 52-card deck
   */
  private initialize(): void {
    this.cards = [];
    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  /**
   * Shuffles the deck using Fisher-Yates algorithm
   */
  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Draws a card from the top of the deck
   */
  draw(): Card | undefined {
    return this.cards.pop();
  }

  /**
   * Returns the number of cards remaining in the deck
   */
  get size(): number {
    return this.cards.length;
  }

  /**
   * Resets the deck to a full 52-card deck and shuffles it
   */
  reset(): void {
    this.initialize();
    this.shuffle();
  }

  /**
   * Returns all cards in the deck (for testing/debugging)
   */
  getCards(): Card[] {
    return [...this.cards];
  }
}
