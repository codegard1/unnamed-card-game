import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import type { CardStyleConfig } from '../game/CardStyles';
import { BackgroundType, CARD_STYLE_PRESETS, DEFAULT_CARD_STYLE } from '../game/CardStyles';
import { Card, Suit, Rank } from '../game';
import { CardComponent } from './CardComponent';

interface CardStyleCustomizerProps {
  initialStyle?: CardStyleConfig;
  onSave: (style: CardStyleConfig) => void;
  onCancel: () => void;
}

/**
 * Card style customization component with live preview
 * Provides UI for customizing card front, back, and symbol styles
 */
export const CardStyleCustomizer: React.FC<CardStyleCustomizerProps> = ({
  initialStyle,
  onSave,
  onCancel,
}) => {
  const [currentStyle, setCurrentStyle] = useState<CardStyleConfig>(() =>
    initialStyle ? structuredClone(initialStyle) : structuredClone(DEFAULT_CARD_STYLE)
  );

  useEffect(() => {
    if (initialStyle) {
      setCurrentStyle(structuredClone(initialStyle));
    }
  }, [initialStyle]);

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

  const updateStyle = (updates: Partial<CardStyleConfig>) => {
    setCurrentStyle(prev => ({ ...prev, ...updates }));
  };

  const updateFront = (updates: Partial<typeof currentStyle.front>) => {
    setCurrentStyle(prev => ({
      ...prev,
      front: { ...prev.front, ...updates },
    }));
  };

  const updateBack = (updates: Partial<typeof currentStyle.back>) => {
    setCurrentStyle(prev => ({
      ...prev,
      back: { ...prev.back, ...updates },
    }));
  };

  const updateSymbolStyle = (updates: Partial<typeof currentStyle.front.symbolStyle>) => {
    setCurrentStyle(prev => ({
      ...prev,
      front: {
        ...prev.front,
        symbolStyle: { ...prev.front.symbolStyle, ...updates },
      },
    }));
  };

  const handleBackgroundTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as BackgroundType;
    updateBack({ backgroundType: type });
  };

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

  const applyPreset = (preset: CardStyleConfig) => {
    setCurrentStyle(structuredClone(preset));
  };

  const getPreviewCardStyles = (isBack: boolean) => {
    if (isBack) {
      let background = '';
      if (currentStyle.back.backgroundType === BackgroundType.SOLID && currentStyle.back.backgroundColor) {
        background = currentStyle.back.backgroundColor;
      } else if (currentStyle.back.backgroundType === BackgroundType.GRADIENT && currentStyle.back.gradient) {
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, p: 2 }}>
        {/* Left Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Presets */}
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

          {/* Live Preview */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Live Preview
            </Typography>
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
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Front
                </Typography>
                <Box
                  sx={{
                    ...getPreviewCardStyles(false),
                    width: 120,
                    height: 168,
                    display: 'inline-flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 1,
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
                    '& .card-rank': {
                      fontSize: 'var(--card-corner-font-size)',
                      color: 'var(--card-heart-color)',
                    },
                    '& .card-suit': {
                      fontSize: 'var(--card-center-font-size)',
                      color: 'var(--card-heart-color)',
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
                  <div className="card-rank top">A</div>
                  <div className="card-suit">♥</div>
                  <div className="card-rank bottom">A</div>
                </Box>
              </Box>
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

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={() => onSave(currentStyle)}>
              Save & Apply
            </Button>
          </Box>
        </Box>

        {/* Right Column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Front Style Controls */}
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

          {/* Symbol Style Controls */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Symbol Styles
            </Typography>
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

          {/* Back Style Controls */}
          <Paper className="customizer-section" elevation={0} sx={{ p: 2.5, bgcolor: '#fafafa' }}>
            <Typography variant="h3" sx={{ mb: 2, color: 'primary.main' }}>
              Back Face Style
            </Typography>
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
