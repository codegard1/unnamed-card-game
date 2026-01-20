import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import { Game } from '../game';

interface GameInfoDialogProps {
  open: boolean;
  onClose: () => void;
  game: Game;
}

/**
 * GameInfoDialog - Displays game metadata in a modal dialog
 * 
 * Shows the game description, rules, version, creator name, and link to rules website
 * in a formatted, easy-to-read layout.
 * 
 * @component
 * @param open - Whether the dialog is open
 * @param onClose - Callback when the dialog should close
 * @param game - The game instance to display metadata from
 */
const GameInfoDialog: React.FC<GameInfoDialogProps> = ({ open, onClose, game }) => {
  // Access metadata through a getter or direct property - we'll need to check Game class
  const metadata = (game as any).metadata;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'primary.main' }}>
        Game Information
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {metadata && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Description */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#333' }}>
                {metadata.description}
              </Typography>
            </Box>

            <Divider />

            {/* Rules */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                Rules
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{ whiteSpace: 'pre-wrap', color: '#333', fontSize: '0.95rem' }}
              >
                {metadata.rules}
              </Typography>
            </Box>

            <Divider />

            {/* Game Info Details */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Version
                </Typography>
                <Typography variant="body2">{metadata.version}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Creator
                </Typography>
                <Typography variant="body2">{metadata.creatorName}</Typography>
              </Box>
            </Box>

            {/* Rules Website */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
                Learn More
              </Typography>
              <Link
                href={metadata.rulesWebsite}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ wordBreak: 'break-all' }}
              >
                {metadata.rulesWebsite}
              </Link>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameInfoDialog;
