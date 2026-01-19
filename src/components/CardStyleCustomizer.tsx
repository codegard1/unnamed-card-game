import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Rank, Suit } from '../game';
import { BackgroundType, CARD_STYLE_PRESETS, CardStyleConfig, DEFAULT_CARD_STYLE } from '../cardStyles';
import { getSuitSymbol } from '../tools';

/**
 * Props for the CardStyleCustomizer component
 */
interface CardStyleCustomizerProps {
  /** The initial card style to display; if not provided, uses the default preset */
  initialStyle?: CardStyleConfig;
  /** Callback function invoked when user clicks "Save & Apply" with the updated style */
  onSave: (style: CardStyleConfig) => void;
  /** Callback function invoked when user clicks "Cancel" to close without saving */
  onCancel: () => void;
}

/**
 * Card style customization component with live preview
 * 
 * Provides a comprehensive UI for customizing card front, back, and symbol styles.
 * Features include:
 * - Live preview of front and back card designs
 * - Preset style templates for quick application
 * - Detailed controls for colors, borders, gradients, and images
 * - Support for solid, gradient, and image backgrounds on card backs
 * - Symbol color customization for each suit (hearts, diamonds, clubs, spades)
 */
export const CardStyleCustomizer: React.FC<CardStyleCustomizerProps> = ({
  initialStyle,
  onSave,
  onCancel,
}) => {
  // Current card style being edited - starts with initial style or default preset
  const [currentStyle, setCurrentStyle] = useState<CardStyleConfig>(() =>
    initialStyle ? structuredClone(initialStyle) : structuredClone(DEFAULT_CARD_STYLE)
  );

  // Preview card suit and rank for the front card display
  const [previewRank, setPreviewRank] = useState<Rank>(Rank.ACE);
  const [previewSuit, setPreviewSuit] = useState<Suit>(Suit.HEARTS);

  // Update current style when initialStyle prop changes
  useEffect(() => {
    if (initialStyle) {
      setCurrentStyle(structuredClone(initialStyle));
    }
  }, [initialStyle]);

  /**
   * Ensures a gradient object exists on the card back style
   * If the gradient doesn't exist, creates a default linear gradient with empty colors
   * @param style - The card style configuration to check/update
   * @returns The style with a guaranteed gradient object
   */
  const ensureGradientExists = (style: CardStyleConfig): CardStyleConfig => {
    if (!style.back.gradient) {
      return {
        ...style,
        back: {
          ...style.back,
          gradient: { type: 'linear', colors: ['', '', ''] },
        },
      };
    }
    return style;
  };

  /**
   * Updates the top-level style configuration (merges with current state)
   * @param updates - Partial style properties to merge into current style
   */
  const updateStyle = (updates: Partial<CardStyleConfig>) => {
    setCurrentStyle(prev => ({ ...prev, ...updates }));
  };

  /**
   * Updates the front face style properties (e.g., background, border colors, font sizes)
   * @param updates - Partial front style properties to merge
   */
  const updateFront = (updates: Partial<typeof currentStyle.front>) => {
    setCurrentStyle(prev => ({
      ...prev,
      front: { ...prev.front, ...updates },
    }));
  };

  /**
   * Updates the back face style properties (e.g., background type, gradient, border)
   * @param updates - Partial back style properties to merge
   */
  const updateBack = (updates: Partial<typeof currentStyle.back>) => {
    setCurrentStyle(prev => ({
      ...prev,
      back: { ...prev.back, ...updates },
    }));
  };

  /**
   * Updates the symbol (suit) styling including colors and font size
   * @param updates - Partial symbol style properties (heart/diamond/club/spade colors, fontSize, fontWeight)
   */
  const updateSymbolStyle = (updates: Partial<typeof currentStyle.front.symbolStyle>) => {
    setCurrentStyle(prev => ({
      ...prev,
      front: {
        ...prev.front,
        symbolStyle: { ...prev.front.symbolStyle, ...updates },
      },
    }));
  };

  /**
   * Handles background type selection change (solid, gradient, or image)
   * Updates the back style with the newly selected background type
   * @param event - Select change event with the new background type value
   */
  const handleBackgroundTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as BackgroundType;
    updateBack({ backgroundType: type });
  };

  /**
   * Handles gradient type selection (linear or radial)
   * Ensures gradient exists before updating, then updates the type property
   * @param event - Select change event with the new gradient type value
   */
  const handleGradientTypeChange = (event: SelectChangeEvent) => {
    setCurrentStyle(prev => {
      const updated = ensureGradientExists(prev);
      return {
        ...updated,
        back: {
          ...updated.back,
          gradient: {
            ...updated.back.gradient!,
            type: event.target.value as 'linear' | 'radial',
          },
        },
      };
    });
  };

  /**
   * Handles gradient color updates at a specific color stop
   * Updates one of the three gradient colors (start, middle, end)
   * @param index - The color stop index (0, 1, or 2)
   * @param color - The new color hex value
   */
  const handleGradientColorChange = (index: number, color: string) => {
    setCurrentStyle(prev => {
      const updated = ensureGradientExists(prev);
      const newColors = [...(updated.back.gradient?.colors || ['', '', ''])];
      newColors[index] = color;
      return {
        ...updated,
        back: {
          ...updated.back,
          gradient: {
            ...updated.back.gradient!,
            colors: newColors,
          },
        },
      };
    });
  };

  /**
   * Handles gradient angle rotation updates (0-360 degrees)
   * Only applicable to linear gradients
   * @param angle - The new gradient angle in degrees
   */
  const handleGradientAngleChange = (angle: number) => {
    setCurrentStyle(prev => {
      const updated = ensureGradientExists(prev);
      return {
        ...updated,
        back: {
          ...updated.back,
          gradient: {
            ...updated.back.gradient!,
            angle,
          },
        },
      };
    });
  };

  /**
   * Handles image file uploads for the card back background
   * Reads the file as a data URL and updates the back style's imageUrl
   * @param event - File input change event
   */
  const handleImageFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateBack({ imageUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Applies a preset card style configuration to the current style
   * Uses structuredClone to avoid shared reference issues
   * @param preset - The preset configuration to apply
   */
  const applyPreset = (preset: CardStyleConfig) => {
    setCurrentStyle(structuredClone(preset));
  };

  /**
   * Generates a random card rank and suit for the preview card
   * Used when clicking the front card preview to change its appearance
   */
  const randomizePreviewCard = () => {
    const ranks = Object.values(Rank);
    const suits = Object.values(Suit);
    setPreviewRank(ranks[Math.floor(Math.random() * ranks.length)]);
    setPreviewSuit(suits[Math.floor(Math.random() * suits.length)]);
  };

  /**
   * Generates CSS styles for the card preview based on current configuration
   * For back: generates background (solid/gradient/image) and border styles
   * For front: generates background, border, and CSS custom properties for symbol colors and font sizes
   * @param isBack - If true, generates back face styles; if false, generates front face styles
   * @returns Object containing CSS style properties for the preview card
   */
  const getPreviewCardStyles = (isBack: boolean) => {
    // Generate back face styles
    if (isBack) {
      // Build the background style based on the selected background type
      let background = '';
      if (currentStyle.back.backgroundType === BackgroundType.SOLID && currentStyle.back.backgroundColor) {
        background = currentStyle.back.backgroundColor;
      } else if (currentStyle.back.backgroundType === BackgroundType.GRADIENT && currentStyle.back.gradient) {
        // Generate CSS gradient string with angle and colors
        const gradient = currentStyle.back.gradient;
        const validColors = gradient.colors.filter(c => c);
        background = gradient.type === 'linear'
          ? `linear-gradient(${gradient.angle || 135}deg, ${validColors.join(', ')})`
          : `radial-gradient(circle, ${validColors.join(', ')})`;
      } else if (currentStyle.back.backgroundType === BackgroundType.IMAGE && currentStyle.back.imageUrl) {
        background = `url(${currentStyle.back.imageUrl}) center/cover`;
      }

      return {
        background,
        borderColor: currentStyle.back.borderColor || currentStyle.front.borderColor,
        borderWidth: `${currentStyle.back.borderWidth || currentStyle.front.borderWidth}px`,
        borderRadius: `${currentStyle.back.borderRadius || currentStyle.front.borderRadius}px`,
      };
    } else {
      // Generate front face styles with symbol colors and text sizes
      const suitColors: Record<string, string> = {
        hearts: currentStyle.front.symbolStyle.heartColor,
        diamonds: currentStyle.front.symbolStyle.diamondColor,
        clubs: currentStyle.front.symbolStyle.clubColor,
        spades: currentStyle.front.symbolStyle.spadeColor,
      };

      return {
        backgroundColor: currentStyle.front.backgroundColor,
        borderColor: currentStyle.front.borderColor,
        borderWidth: `${currentStyle.front.borderWidth}px`,
        borderRadius: `${currentStyle.front.borderRadius}px`,
        // CSS custom properties passed to card element for dynamic symbol colors
        '--card-corner-font-size': `${currentStyle.front.cornerFontSize}rem`,
        '--card-center-font-size': `${currentStyle.front.centerFontSize}rem`,
        '--card-heart-color': suitColors.hearts,
        '--card-diamond-color': suitColors.diamonds,
        '--card-club-color': suitColors.clubs,
        '--card-spade-color': suitColors.spades,
      };
    }
  };

  return (
    <Box className="card-style-customizer" sx={{ width: '100%', maxHeight: '75vh', overflow: 'auto' }}>
      {/* Two-column layout: Left for presets/preview, Right for detailed controls */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, p: 2 }}>
        {/* Left Column - Contains presets, preview, and action buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Presets Section - Quick apply buttons for pre-configured card styles */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Presets
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {Object.values(CARD_STYLE_PRESETS).map(preset => (
                <Button
                  key={preset.name}
                  variant="outlined"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.displayName}
                </Button>
              ))}
            </Box>
          </Paper>

          {/* Live Preview Section - Shows real-time preview of front and back card styles */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Live Preview
            </Typography>
            {/* Preview container with gradient background to showcase both front and back */}
            <Box
              className="preview-container"
              sx={{
                display: 'flex',
                gap: 4,
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: 1.5,
                minHeight: 220,
              }}
            >
              {/* Front card preview with Ace of Hearts as example */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Front
                </Typography>
                <Box
                  onClick={randomizePreviewCard}
                  sx={{
                    ...getPreviewCardStyles(false),
                    width: 120,
                    height: 168,
                    display: 'inline-flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 1,
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 20px rgba(0, 0, 0, 0.4)',
                    },
                    '& .card-rank': {
                      fontSize: 'var(--card-corner-font-size)',
                      color: `var(--card-${previewSuit === Suit.HEARTS || previewSuit === Suit.DIAMONDS ? 'heart' : 'club'}-color)`,
                    },
                    '& .card-suit': {
                      fontSize: 'var(--card-center-font-size)',
                      color: `var(--card-${previewSuit === Suit.HEARTS || previewSuit === Suit.DIAMONDS ? 'heart' : 'club'}-color)`,
                      textAlign: 'center',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    '& .card-rank.top': {
                      alignSelf: 'flex-start',
                    },
                    '& .card-rank.bottom': {
                      alignSelf: 'flex-end',
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  <div className="card-rank top">{previewRank}</div>
                  <div className="card-suit">{getSuitSymbol(previewSuit)}</div>
                  <div className="card-rank bottom">{previewRank}</div>
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666', fontSize: '0.75rem' }}>
                  Click to randomize
                </Typography>
              </Box>
              {/* Back card preview - shows gradient or solid background */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Back
                </Typography>
                <Box
                  sx={{
                    ...getPreviewCardStyles(true),
                    width: 120,
                    height: 168,
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons - Save current style or cancel changes */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => onSave(currentStyle)}>
              Save & Apply
            </Button>
          </Box>
        </Box>

        {/* Right Column - Contains customization controls for front, symbols, and back styles */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Front Style Controls - Background, border, and layout customization */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Front Face Style
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Background Color"
                type="color"
                value={currentStyle.front.backgroundColor}
                onChange={(e) => updateFront({ backgroundColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Border Color"
                type="color"
                value={currentStyle.front.borderColor}
                onChange={(e) => updateFront({ borderColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Border Width (px)"
                type="number"
                value={currentStyle.front.borderWidth}
                onChange={(e) => updateFront({ borderWidth: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 10, step: 1 }}
                fullWidth
                size="small"
              />
              <TextField
                label="Border Radius (px)"
                type="number"
                value={currentStyle.front.borderRadius}
                onChange={(e) => updateFront({ borderRadius: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 20, step: 1 }}
                fullWidth
                size="small"
              />
            </Box>
          </Paper>

          {/* Symbol Style Controls - Customize suit symbol colors and sizes */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Symbol Styles
            </Typography>
            {/* Individual color pickers for each suit and symbol size control */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="♥ Hearts Color"
                type="color"
                value={currentStyle.front.symbolStyle.heartColor}
                onChange={(e) => updateSymbolStyle({ heartColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="♦ Diamonds Color"
                type="color"
                value={currentStyle.front.symbolStyle.diamondColor}
                onChange={(e) => updateSymbolStyle({ diamondColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="♣ Clubs Color"
                type="color"
                value={currentStyle.front.symbolStyle.clubColor}
                onChange={(e) => updateSymbolStyle({ clubColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="♠ Spades Color"
                type="color"
                value={currentStyle.front.symbolStyle.spadeColor}
                onChange={(e) => updateSymbolStyle({ spadeColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Symbol Size (rem)"
                type="number"
                value={currentStyle.front.centerFontSize}
                onChange={(e) => {
                  const size = parseFloat(e.target.value);
                  updateFront({ centerFontSize: size });
                  updateSymbolStyle({ fontSize: size });
                }}
                inputProps={{ min: 1, max: 5, step: 0.1 }}
                fullWidth
                size="small"
              />
            </Box>
          </Paper>

          {/* Back Style Controls - Background type, gradient, image, and border customization */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Back Face Style
            </Typography>
            {/* Dynamic controls based on selected background type (solid, gradient, or image) */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Background Type</InputLabel>
                <Select
                  value={currentStyle.back.backgroundType}
                  label="Background Type"
                  onChange={handleBackgroundTypeChange}
                >
                  <MenuItem value="solid">Solid Color</MenuItem>
                  <MenuItem value="gradient">Gradient</MenuItem>
                  <MenuItem value="image">Custom Image</MenuItem>
                </Select>
              </FormControl>

              {/* Solid Color Controls */}
              {currentStyle.back.backgroundType === BackgroundType.SOLID && (
                <TextField
                  label="Background Color"
                  type="color"
                  value={currentStyle.back.backgroundColor || '#ffffff'}
                  onChange={(e) => updateBack({ backgroundColor: e.target.value })}
                  fullWidth
                  size="small"
                />
              )}

              {/* Gradient Controls - Type, angle, and three gradient color stops */}
              {currentStyle.back.backgroundType === BackgroundType.GRADIENT && (
                <>
                  <FormControl fullWidth size="small">
                    <InputLabel>Gradient Type</InputLabel>
                    <Select
                      value={currentStyle.back.gradient?.type || 'linear'}
                      label="Gradient Type"
                      onChange={handleGradientTypeChange}
                    >
                      <MenuItem value="linear">Linear</MenuItem>
                      <MenuItem value="radial">Radial</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Gradient Angle (deg)"
                    type="number"
                    value={currentStyle.back.gradient?.angle || 135}
                    onChange={(e) => handleGradientAngleChange(parseFloat(e.target.value))}
                    inputProps={{ min: 0, max: 360, step: 15 }}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Gradient Color 1"
                    type="color"
                    value={currentStyle.back.gradient?.colors[0] || '#1e3c72'}
                    onChange={(e) => handleGradientColorChange(0, e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Gradient Color 2"
                    type="color"
                    value={currentStyle.back.gradient?.colors[1] || '#2a5298'}
                    onChange={(e) => handleGradientColorChange(1, e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Gradient Color 3 (optional)"
                    type="color"
                    value={currentStyle.back.gradient?.colors[2] || '#1e3c72'}
                    onChange={(e) => handleGradientColorChange(2, e.target.value)}
                    fullWidth
                    size="small"
                  />
                </>
              )}

              {/* Image Background Controls - URL or file upload */}
              {currentStyle.back.backgroundType === BackgroundType.IMAGE && (
                <>
                  <TextField
                    label="Image URL"
                    type="text"
                    value={currentStyle.back.imageUrl || ''}
                    onChange={(e) => updateBack({ imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    fullWidth
                    size="small"
                  />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>
                      Or upload a file:
                    </Typography>
                    <Box
                      component="input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      sx={{ width: '100%' }}
                    />
                  </Box>
                </>
              )}

              <TextField
                label="Border Color"
                type="color"
                value={currentStyle.back.borderColor || currentStyle.front.borderColor}
                onChange={(e) => updateBack({ borderColor: e.target.value })}
                fullWidth
                size="small"
              />
              <TextField
                label="Border Width (px)"
                type="number"
                value={currentStyle.back.borderWidth || currentStyle.front.borderWidth}
                onChange={(e) => updateBack({ borderWidth: parseFloat(e.target.value) })}
                inputProps={{ min: 0, max: 10, step: 1 }}
                fullWidth
                size="small"
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};
