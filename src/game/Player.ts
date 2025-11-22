import { Card } from './Card';

/**
 * Represents a player in the card game
 */
export class Player {
  private hand: Card[] = [];
  private score: number = 0;

  constructor(
    public readonly id: string,
    public readonly name: string
  ) {}

  /**
   * Adds a card to the player's hand
   */
  addCard(card: Card): void {
    this.hand.push(card);
  }

  /**
   * Removes a card from the player's hand
   */
  removeCard(card: Card): boolean {
    const index = this.hand.indexOf(card);
    if (index > -1) {
      this.hand.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Returns the player's current hand
   */
  getHand(): Card[] {
    return [...this.hand];
  }

  /**
   * Clears the player's hand
   */
  clearHand(): void {
    this.hand = [];
  }

  /**
   * Returns the number of cards in the player's hand
   */
  get handSize(): number {
    return this.hand.length;
  }

  /**
   * Updates the player's score
   */
  setScore(score: number): void {
    this.score = score;
  }

  /**
   * Adds to the player's score
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Returns the player's current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Resets the player's hand and score
   */
  reset(): void {
    this.clearHand();
    this.score = 0;
  }
}
