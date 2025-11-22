/**
 * Represents the suit of a playing card
 */
export enum Suit {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades',
}

/**
 * Represents the rank of a playing card
 */
export enum Rank {
  ACE = 'A',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
}

/**
 * Represents a single playing card
 */
export class Card {
  constructor(
    public readonly suit: Suit,
    public readonly rank: Rank
  ) {}

  /**
   * Returns a string representation of the card
   */
  toString(): string {
    return `${this.rank} of ${this.suit}`;
  }

  /**
   * Returns the numeric value of the card (for scoring purposes)
   * Can be overridden for specific game rules
   */
  getValue(): number {
    switch (this.rank) {
      case Rank.ACE:
        return 11;
      case Rank.JACK:
      case Rank.QUEEN:
      case Rank.KING:
        return 10;
      default:
        return parseInt(this.rank);
    }
  }
}
