import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { theme } from './theme';
import { Card, Deck, Player, Game } from './game';
import { CardComponent, CardStyleCustomizer } from './components';
import { SettingsManager, CARD_THEMES, CardTheme } from './settings';
import type { CardStyleConfig } from './game/CardStyles';

/**
 * Example implementation of a simple card game
 */
class SimpleCardGame extends Game {
  protected dealInitialCards(): void {
    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
      this.players.forEach(player => {
        const card = this.deck.draw();
        if (card) {
          player.addCard(card);
        }
      });
    }
  }

  playTurn(player: Player): void {
    // Simple turn logic: draw a card
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
    }
  }

  isGameOver(): boolean {
    // Game is over when deck is empty or any player has 10 cards
    return this.deck.size === 0 || this.players.some(p => p.handSize >= 10);
  }

  getWinner(): Player | Player[] | null {
    if (!this.isGameOver()) {
      return null;
    }
    // Winner is the player with the most cards
    const maxCards = Math.max(...this.players.map(p => p.handSize));
    const winners = this.players.filter(p => p.handSize === maxCards);
    return winners.length === 1 ? winners[0] : winners;
  }
}

const App: React.FC = () => {
  const [game] = useState(() => new SimpleCardGame(['Player 1', 'Player 2']));
  const [gameActive, setGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState('Click "Start New Game" to begin');
  const [players, setPlayers] = useState<Player[]>([]);
  const [deckSize, setDeckSize] = useState(52);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(CardTheme.CLASSIC);
  const [currentCardStyle, setCurrentCardStyle] = useState<CardStyleConfig | null>(null);
  const [updateKey, setUpdateKey] = useState(0);

  const settings = SettingsManager.getInstance();

  useEffect(() => {
    // Initialize settings
    settings.initialize();
    setSelectedTheme(settings.getTheme());
    setCurrentCardStyle(settings.getCardStyle());
  }, []);

  const handleStartGame = () => {
    game.start();
    setGameActive(true);
    updateGameUI();
  };

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

  const handleThemeSelect = (themeName: CardTheme) => {
    setSelectedTheme(themeName);
    settings.setTheme(themeName);
  };

  const handleSaveCardStyle = (style: CardStyleConfig) => {
    settings.setCardStyle(style);
    setCurrentCardStyle(style);
    setCustomizerOpen(false);
    // Force re-render of cards
    setUpdateKey(prev => prev + 1);
  };

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
                    {player.getHand().map((card, idx) => (
                      <CardComponent key={`${player.id}-${idx}-${updateKey}`} card={card} showBack={false} />
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

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 5, pt: 2.5, borderTop: '1px solid #e0e0e0', color: '#666' }}>
          <Typography variant="body2">
            Built with TypeScript, React and Material-UI
          </Typography>
        </Box>

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
