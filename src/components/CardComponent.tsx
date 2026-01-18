import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Card, Suit } from '../game';

/**
 * Props for the CardComponent
 */
interface CardComponentProps {
  /** The card data to display */
  card: Card;
  /** Whether to show the back of the card initially (default: false) */
  showBack?: boolean;
}

/**
 * CardComponent - Displays a single playing card with flip functionality
 * 
 * This React component renders a playing card that can be flipped between
 * front and back faces. The front shows the rank and suit symbol, while
 * the back shows the customizable card back design.
 * 
 * Features:
 * - Interactive flip on click
 * - CSS-based styling using custom properties for theming
 * - Suit-specific coloring (hearts/diamonds red, clubs/spades black)
 * - Unicode suit symbols (♥ ♦ ♣ ♠)
 * 
 * @component
 * @example
 * ```tsx
 * <CardComponent card={new Card(Suit.HEARTS, Rank.ACE)} showBack={false} />
 * ```
 */
export const CardComponent: React.FC<CardComponentProps> = ({ card, showBack: initialShowBack = false }) => {
  // Track whether the card is showing its back face
  const [showingBack, setShowingBack] = useState(initialShowBack);

  /**
   * Returns the CSS class name for the card's suit
   * Used for applying suit-specific colors via CSS custom properties
   * @returns CSS class name (e.g., 'suit-hearts', 'suit-diamonds')
   */
  const getSuitClass = (): string => {
    switch (card.suit) {
      case Suit.HEARTS:
        return 'suit-hearts';
      case Suit.DIAMONDS:
        return 'suit-diamonds';
      case Suit.CLUBS:
        return 'suit-clubs';
      case Suit.SPADES:
        return 'suit-spades';
      default:
        return 'suit-unknown';
    }
  };

  /**
   * Returns the Unicode symbol for the card's suit
   * @returns Unicode character for the suit (♥ ♦ ♣ ♠)
   */
  const getSuitSymbol = (): string => {
    switch (card.suit) {
      case Suit.HEARTS:
        return '♥';
      case Suit.DIAMONDS:
        return '♦';
      case Suit.CLUBS:
        return '♣';
      case Suit.SPADES:
        return '♠';
      default:
        return '?';
    }
  };

  /**
   * Flips the card to show front or back
   * @param showBack - Optional parameter to explicitly set which face to show.
   *                   If not provided, toggles between front and back.
   */
  const flip = (showBack?: boolean) => {
    setShowingBack(showBack !== undefined ? showBack : !showingBack);
  };

  // Render card back if showing back
  if (showingBack) {
    return (
      <Box
        className="playing-card card-back"
        onClick={() => flip()}
        sx={{ cursor: 'pointer' }}
      >
        <div className="card-back-content" />
      </Box>
    );
  }

  // Render card front with rank and suit
  return (
    <Box
      className={`playing-card ${getSuitClass()}`}
      data-suit={card.suit}
      data-rank={card.rank}
      onClick={() => flip()}
      sx={{ cursor: 'pointer' }}
    >
      <div className="card-rank top">{card.rank}</div>
      <div className="card-suit">{getSuitSymbol()}</div>
      <div className="card-rank bottom">{card.rank}</div>
    </Box>
  );
};
