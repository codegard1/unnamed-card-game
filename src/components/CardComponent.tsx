import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Card, Suit } from '../game';

interface CardComponentProps {
  card: Card;
  showBack?: boolean;
}

/**
 * React component for displaying a playing card
 */
export const CardComponent: React.FC<CardComponentProps> = ({ card, showBack: initialShowBack = false }) => {
  const [showingBack, setShowingBack] = useState(initialShowBack);

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

  const flip = (showBack?: boolean) => {
    setShowingBack(showBack !== undefined ? showBack : !showingBack);
  };

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
