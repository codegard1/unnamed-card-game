import React from 'react';
import { Box, Button } from '@mui/material';
import { Game, ITurnOption, Player } from '../game';

interface TurnOptionsComponentProps {
  game: Game;
  player: Player;
  onOptionSelect?: (option: ITurnOption) => void;
}

/**
 * TurnOptionsComponent - Displays turn action buttons
 * 
 * Renders a horizontal row of buttons, each representing an available turn option
 * for the current player. Options are retrieved from the game's getTurnOptions method.
 * 
 * @component
 * @param game - The game instance
 * @param player - The player whose turn options to display
 * @param onOptionSelect - Optional callback when an option is selected
 */
const TurnOptionsComponent: React.FC<TurnOptionsComponentProps> = ({
  game,
  player,
  onOptionSelect,
}) => {
  const options = game.getTurnOptions(player);

  const handleOptionClick = (option: ITurnOption) => {
    if (onOptionSelect) {
      onOptionSelect(option);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        justifyContent: 'center',
        flexWrap: 'wrap',
        mt: 2,
      }}
    >
      {options.map((option, index) => (
        <Button
          key={index}
          variant="contained"
          onClick={() => handleOptionClick(option)}
          disabled={option.disabled}
        >
          {option.displayName}
        </Button>
      ))}
    </Box>
  );
};

export default TurnOptionsComponent;
