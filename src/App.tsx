import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  ThemeProvider,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
// import { CardTheme } from './cardStyles';
import { CARD_THEMES, CardStyleConfig, CardTheme } from './cardStyles';
import { CardComponent, CardStyleCustomizer } from './components';
import { Player, SimpleCardGame } from './game';
import { SettingsManager, } from './settings';
import { theme } from './theme';

/**
 * App - Main application component for the card game
 * 
 * This is the root React component that manages the entire application state and UI.
 * It handles:
 * - Game state and lifecycle (starting games, tracking players, updating UI)
 * - Settings dialog for theme selection
 * - Card style customizer dialog for appearance customization
 * - Integration with SettingsManager for persistent user preferences
 * 
 * @component
 */
const App: React.FC = () => {
  // Game instance - initialized once with two players
  const [game] = useState(() => new SimpleCardGame(['Player 1', 'Player 2']));

  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState('Click "Start New Game" to begin');
  const [players, setPlayers] = useState<Player[]>([]);
  const [deckSize, setDeckSize] = useState(52);

  // Dialog visibility state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Settings state
  const [selectedTheme, setSelectedTheme] = useState<String>(CardTheme.CLASSIC);
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
   * @param themeName - The selected card theme (Classic, Modern, or Minimal)
   */
  const handleThemeSelect = (themeName: CardTheme) => {
    setSelectedTheme(themeName);
    settings.setTheme(themeName);
  };

  /**
   * Saves the customized card style and closes the customizer dialog
   * @param style - The card style configuration to save
   */
  const handleSaveCardStyle = (style: CardStyleConfig) => {
    settings.setCardStyle(style);
    setCurrentCardStyle(style);
    setCustomizerOpen(false);
    // Increment updateKey to force re-render of all card components with new styles
    setUpdateKey(prev => prev + 1);
  };

  /**
   * Opens the card style customizer dialog with current settings
   */
  const handleOpenCustomizer = () => {
    setCurrentCardStyle(settings.getCardStyle());
    setCustomizerOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ position: 'relative', textAlign: 'center', mb: 5 }}>
          <IconButton
            sx={{ position: 'absolute', top: 0, right: 0 }}
            onClick={() => setSettingsOpen(true)}
          >
            <SettingsIcon />
          </IconButton>
          <Typography variant="h1" sx={{ color: 'primary.main', mb: 1 }}>
            🃏 Unnamed Card Game
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem' }}>
            A TypeScript card game with Material Design 3
          </Typography>
        </Box>

        {/* Game Controls */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={handleStartGame}>
            Start New Game
          </Button>
        </Box>

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
                </Paper>
              ))}
              <Typography variant="body1" sx={{ mt: 2 }}>
                Cards remaining in deck: {deckSize}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ py: 1 }}>
              <Typography variant="h3" sx={{ mb: 1.5, color: 'primary.main', fontSize: '1.1rem' }}>
                Card Theme
              </Typography>
              <Box>
                {CARD_THEMES.map(themeConfig => (
                  <Box
                    key={themeConfig.name}
                    onClick={() => handleThemeSelect(themeConfig.name)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedTheme === themeConfig.name ? 'primary.main' : 'transparent',
                      bgcolor: selectedTheme === themeConfig.name ? 'rgba(103, 80, 164, 0.08)' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {themeConfig.displayName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#666' }}>
                        {themeConfig.description}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h3" sx={{ mb: 1.5, color: 'primary.main', fontSize: '1.1rem' }}>
                  Card Styles
                </Typography>
                <Button variant="contained" onClick={handleOpenCustomizer}>
                  Customize Card Appearance
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Card Style Customizer Dialog */}
        <Dialog
          open={customizerOpen}
          onClose={() => setCustomizerOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
              minWidth: { xs: 'auto', md: '800px' },
            },
          }}
        >
          <DialogTitle>Customize Card Appearance</DialogTitle>
          <DialogContent>
            {currentCardStyle && (
              <CardStyleCustomizer
                initialStyle={currentCardStyle}
                onSave={handleSaveCardStyle}
                onCancel={() => setCustomizerOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default App;
