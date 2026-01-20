import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  ThemeProvider,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CardStyleConfig, CardTheme } from './cardStyles';
import { CardComponent, SettingsDialog, TurnOptionsComponent, GameInfoDialog, GameSelector, type GameType } from './components';
import { Player, SimpleCardGame, Game } from './game';
import { SettingsManager, } from './settings';
import { theme } from './theme';

/**
 * App - Main application component for the card game
 * 
 * This is the root React component that manages the entire application state and UI.
 * It handles:
 * - Game state and lifecycle (starting games, tracking players, updating UI)
 * - Game selection via dropdown (switching between different Game subclasses)
 * - Settings dialog for theme selection
 * - Card style customizer dialog for appearance customization
 * - Integration with SettingsManager for persistent user preferences
 * 
 * @component
 */
const App: React.FC = () => {
  // Game selection state - tracks which game subclass is loaded
  const [selectedGameType, setSelectedGameType] = useState<GameType>('SimpleCardGame');

  // Game instance - recreated when game type changes
  const [game, setGame] = useState<Game>(() => new SimpleCardGame(['Player 1', 'Player 2']));

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState('Click "Start New Game" to begin');
  const [players, setPlayers] = useState<Player[]>([]);
  const [deckSize, setDeckSize] = useState(52);

  // Dialog visibility state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gameInfoOpen, setGameInfoOpen] = useState(false);

  // Settings state
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(CardTheme.CLASSIC);
  const [currentCardStyle, setCurrentCardStyle] = useState<CardStyleConfig | null>(null);

  // Force re-render key for card components when styles change
  const [updateKey, setUpdateKey] = useState(0);

  const settings = SettingsManager.getInstance();

  /**
   * Initialize settings from localStorage on component mount
   */
  useEffect(() => {
    settings.initialize();
    setSelectedTheme(settings.getTheme());
    setCurrentCardStyle(settings.getCardStyle());
  }, []);

  /**
   * Creates a new game instance based on the selected game type
   * @param gameType - The type of game to create
   */
  const createGameInstance = (gameType: GameType): Game => {
    switch (gameType) {
      case 'SimpleCardGame':
        return new SimpleCardGame(['Player 1', 'Player 2']);
      default:
        return new SimpleCardGame(['Player 1', 'Player 2']);
    }
  };

  /**
   * Handles game type selection from the dropdown
   * Creates a new game instance and resets game state
   * @param gameType - The selected game type
   */
  const handleGameTypeSelect = (gameType: GameType) => {
    setSelectedGameType(gameType);
    const newGame = createGameInstance(gameType);
    setGame(newGame);
    setGameActive(false);
    setGameStatus('Click "Start New Game" to begin');
    setPlayers([]);
    setDeckSize(newGame.getDeck().size);
  };

  /**
   * Starts a new game and updates the UI
   */
  const handleStartGame = () => {
    game.start();
    setGameActive(true);
    updateGameUI();
  };

  /**
   * Updates the game UI state based on current game status
   * Checks for game over conditions and displays winner information
   */
  const updateGameUI = () => {
    if (game.isActive()) {
      setGameStatus('Game in progress...');
      setPlayers([...game.getPlayers()]);
      setDeckSize(game.getDeck().size);

      if (game.isGameOver()) {
        const winner = game.getWinner();
        if (winner) {
          if (Array.isArray(winner)) {
            setGameStatus(`Tie between: ${winner.map(p => p.name).join(', ')}`);
          } else {
            setGameStatus(`Winner: ${winner.name}!`);
          }
        }
        game.endGame();
      }
    }
  };

  /**
   * Handles theme selection from the settings dialog
   * Applies the theme and its matching card style preset (except for CUSTOM)
   * @param themeName - The selected card theme (Classic, Modern, Minimal, Casino, or Custom)
   */
  const handleThemeSelect = (themeName: CardTheme) => {
    // Update React state for UI
    setSelectedTheme(themeName);
    // Persist to settings manager (also applies matching card style preset)
    settings.setTheme(themeName);
    // Update card style state to reflect the applied preset
    setCurrentCardStyle(settings.getCardStyle());
    // Force re-render of card components with new styles
    setUpdateKey(prev => prev + 1);
  };

  /**
   * Handles turn option selection
   * @param option - The selected turn option
   */
  const handleTurnOptionSelect = (option: any) => {
    console.log(`Option selected: ${option.displayName}`);
    // TODO: Implement game logic for the selected option
  };

  /**
   * Saves the customized card style
   * Switches to CUSTOM theme to indicate user customization
   * @param style - The card style configuration to save
   */
  const handleSaveCardStyle = (style: CardStyleConfig) => {
    // Persist customized card style
    settings.setCardStyle(style);
    // Update React state for UI
    setCurrentCardStyle(style);
    // Switch to CUSTOM theme when user customizes beyond presets
    setSelectedTheme(CardTheme.CUSTOM);
    settings.setTheme(CardTheme.CUSTOM);
    // Increment updateKey to force re-render of all card components with new styles
    setUpdateKey(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ position: 'relative', textAlign: 'center', mb: 5 }}>
          <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => setGameInfoOpen(true)}
              title="Game Information"
            >
              <InfoIcon />
            </IconButton>
            <IconButton
              onClick={() => setSettingsOpen(true)}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
          <Typography variant="h1" sx={{ color: 'primary.main', mb: 1 }}>
            🃏 Unnamed Card Game
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
            A TypeScript card game with Material Design 3
          </Typography>
        </Box>

        <Paper sx={{ p: 2, borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          {/* Game Selector */}
          <Box sx={{ mb: 3, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 2 }}>
            <GameSelector selectedGame={selectedGameType} onGameSelect={handleGameTypeSelect} disabled={gameActive} />

            {/* Game Controls */}
            <Button variant="contained" onClick={handleStartGame}>
              Start New Game
            </Button>
          </Box>
        </Paper>

        {/* Game Area */}
        <Paper sx={{ p: 4, mb: 2, borderRadius: 1.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2.5, color: 'primary.main', fontSize: '1.3rem' }}
          >
            {gameStatus}
          </Typography>

          {gameActive && (
            <Box>
              <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
                Players:
              </Typography>
              {players.map(player => (
                <Paper
                  key={player.id}
                  sx={{
                    p: 2,
                    mb: 1.5,
                    borderRadius: 1,
                    borderLeft: '4px solid',
                    borderLeftColor: 'primary.main',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem', color: 'primary.main', mb: 1 }}>
                    {player.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Score: {player.getScore()}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      mt: 1.5,
                      p: 1.5,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      minHeight: 50,
                    }}
                  >
                    {player.getHand().map((card) => (
                      <CardComponent key={`${card.suit}-${card.rank}-${updateKey}`} card={card} showBack={false} />
                    ))}
                  </Box>
                  {player.id === game.getCurrentPlayer().id && (
                    <TurnOptionsComponent
                      game={game}
                      player={player}
                      onOptionSelect={handleTurnOptionSelect}
                    />
                  )}
                </Paper>
              ))}
              <Typography variant="body1" sx={{ mt: 2 }}>
                Cards remaining in deck: {deckSize}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Settings Dialog */}
        <SettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          selectedTheme={selectedTheme}
          onThemeSelect={handleThemeSelect}
          currentCardStyle={currentCardStyle}
          onSaveCardStyle={handleSaveCardStyle}
        />

        {/* Game Info Dialog */}
        <GameInfoDialog
          open={gameInfoOpen}
          onClose={() => setGameInfoOpen(false)}
          game={game}
        />
      </Container>
    </ThemeProvider>
  );
};

export default App;
