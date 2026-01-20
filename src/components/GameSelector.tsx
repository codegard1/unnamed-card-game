import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material';

export type GameType = 'SimpleCardGame';

interface GameSelectorProps {
  selectedGame: GameType;
  onGameSelect: (game: GameType) => void;
  disabled?: boolean;
}

/**
 * GameSelector - Dropdown component for selecting which game to load
 * 
 * Allows users to choose between different Game subclass implementations
 * Disabled while a game is actively being played to prevent mid-game switching
 * 
 * @component
 * @param selectedGame - The currently selected game type
 * @param onGameSelect - Callback when a new game is selected
 * @param disabled - Whether the selector is disabled (defaults to false)
 */
const GameSelector: React.FC<GameSelectorProps> = ({ selectedGame, onGameSelect, disabled = false }) => {
  // Map of available games to their display names
  const availableGames: { value: GameType; label: string }[] = [
    { value: 'SimpleCardGame', label: 'Simple Card Game' },
    // Add more games here as they're implemented
    // { value: 'BlackjackGame', label: 'Blackjack' },
    // { value: 'PokerGame', label: 'Poker' },
  ];

  return (
    <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
          Game:
        </Typography>
        <FormControl sx={{ minWidth: 200 }} disabled={disabled}>
          <InputLabel id="game-select-label">Select a Game</InputLabel>
          <Select
            labelId="game-select-label"
            id="game-select"
            value={selectedGame}
            label="Select a Game"
            disabled={disabled}
            onChange={(e) => onGameSelect(e.target.value as GameType)}
          >
            {availableGames.map((game) => (
              <MenuItem key={game.value} value={game.value}>
                {game.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default GameSelector;
