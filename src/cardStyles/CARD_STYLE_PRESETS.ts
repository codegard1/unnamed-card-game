import { CardStyleConfig, BackgroundType } from ".";

/**
 * Preset card style configurations
 */

export const CARD_STYLE_PRESETS: Record<string, CardStyleConfig> = {
  classic: {
    name: 'classic',
    displayName: 'Classic',
    front: {
      backgroundColor: '#ffffff',
      borderColor: '#333333',
      borderWidth: 2,
      borderRadius: 8,
      cornerFontSize: 1.2,
      centerFontSize: 2.5,
      symbolStyle: {
        fontSize: 2.5,
        fontWeight: 'normal',
        heartColor: '#e53935',
        diamondColor: '#e53935',
        clubColor: '#212121',
        spadeColor: '#212121',
      },
    },
    back: {
      backgroundType: BackgroundType.GRADIENT,
      gradient: {
        type: 'linear',
        angle: 135,
        colors: ['#1e3c72', '#2a5298', '#1e3c72'],
      },
      borderColor: '#333333',
      borderWidth: 2,
      borderRadius: 8,
    },
  },
  casino: {
    name: 'casino',
    displayName: 'Casino',
    front: {
      backgroundColor: '#ffffff',
      borderColor: '#d4af37',
      borderWidth: 3,
      borderRadius: 8,
      cornerFontSize: 1.3,
      centerFontSize: 2.8,
      symbolStyle: {
        fontSize: 2.8,
        fontWeight: 'bold',
        heartColor: '#c41e3a',
        diamondColor: '#c41e3a',
        clubColor: '#000000',
        spadeColor: '#000000',
      },
    },
    back: {
      backgroundType: BackgroundType.GRADIENT,
      gradient: {
        type: 'linear',
        angle: 45,
        colors: ['#8b0000', '#dc143c', '#8b0000'],
      },
      borderColor: '#d4af37',
      borderWidth: 3,
      borderRadius: 8,
    },
  },
  minimal: {
    name: 'minimal',
    displayName: 'Minimal',
    front: {
      backgroundColor: '#fafafa',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      cornerFontSize: 1.1,
      centerFontSize: 2.0,
      symbolStyle: {
        fontSize: 2.0,
        fontWeight: 'normal',
        heartColor: '#9e9e9e',
        diamondColor: '#9e9e9e',
        clubColor: '#424242',
        spadeColor: '#424242',
      },
    },
    back: {
      backgroundType: BackgroundType.SOLID,
      backgroundColor: '#eceff1',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
    },
  },
  modern: {
    name: 'modern',
    displayName: 'Modern',
    front: {
      backgroundColor: '#ffffff',
      borderColor: '#6750A4',
      borderWidth: 3,
      borderRadius: 8,
      cornerFontSize: 1.2,
      centerFontSize: 2.5,
      symbolStyle: {
        fontSize: 2.5,
        fontWeight: 'bold',
        heartColor: '#ff1744',
        diamondColor: '#ff1744',
        clubColor: '#6750A4',
        spadeColor: '#6750A4',
      },
    },
    back: {
      backgroundType: BackgroundType.GRADIENT,
      gradient: {
        type: 'linear',
        angle: 135,
        colors: ['#667eea', '#764ba2'],
      },
      borderColor: '#6750A4',
      borderWidth: 3,
      borderRadius: 8,
    },
  },
};
/**
 * Default card style (classic)
 */

export const DEFAULT_CARD_STYLE: CardStyleConfig = CARD_STYLE_PRESETS.classic;
