import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { CARD_THEMES, CardStyleConfig, CardTheme } from '../cardStyles';
import { CardStyleCustomizer } from './CardStyleCustomizer';

/**
 * Props for the SettingsDialog component
 */
interface SettingsDialogProps {
  /** Whether the settings dialog is open */
  open: boolean;
  /** Callback when the dialog should be closed */
  onClose: () => void;
  /** Currently selected card theme */
  selectedTheme: CardTheme;
  /** Callback when a theme is selected */
  onThemeSelect: (theme: CardTheme) => void;
  /** Current card style configuration */
  currentCardStyle: CardStyleConfig | null;
  /** Callback when card style is saved */
  onSaveCardStyle: (style: CardStyleConfig) => void;
}

/**
 * SettingsDialog - Component for managing application settings
 * 
 * This component provides a dialog interface for:
 * - Selecting card themes (Classic, Modern, Minimal)
 * - Accessing the card style customizer for detailed appearance customization
 * 
 * @component
 */
export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  selectedTheme,
  onThemeSelect,
  currentCardStyle,
  onSaveCardStyle,
}) => {
  // Local state for the card customizer dialog
  const [customizerOpen, setCustomizerOpen] = useState(false);

  /**
   * Opens the card style customizer dialog
   */
  const handleOpenCustomizer = () => {
    setCustomizerOpen(true);
  };

  /**
   * Handles saving the card style and closing the customizer
   */
  const handleSaveCardStyle = (style: CardStyleConfig) => {
    onSaveCardStyle(style);
    setCustomizerOpen(false);
  };

  return (
    <>
      {/* Settings Dialog */}
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                  onClick={() => onThemeSelect(themeConfig.name)}
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
          <Button onClick={onClose}>Close</Button>
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
    </>
  );
};
