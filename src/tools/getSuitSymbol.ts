import { Suit } from '../game/Card';

/**
 * Gets the Unicode suit symbol for the current preview suit
 * @returns The suit symbol character (♥, ♦, ♣, or ♠)
 */
export const getSuitSymbol = (suit: Suit): string => {
  const suitSymbols: Record<Suit, string> = {
    [Suit.HEARTS]: '♥',
    [Suit.DIAMONDS]: '♦',
    [Suit.CLUBS]: '♣',
    [Suit.SPADES]: '♠',
  };
  return suitSymbols[suit];
};
