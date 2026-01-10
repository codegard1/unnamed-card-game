import type { CardStyleConfig } from '../game/CardStyles';
import { DEFAULT_CARD_STYLE, CARD_STYLE_PRESETS } from '../game/CardStyles';

/**
 * Card theme types
 */
export enum CardTheme {
  CLASSIC = 'classic',
  MODERN = 'modern',
  MINIMAL = 'minimal',
}

/**
 * Theme configuration interface
 */
export interface ThemeConfig {
  name: CardTheme;
  displayName: string;
  description: string;
}

/**
 * Available card themes
 */
export const CARD_THEMES: ThemeConfig[] = [
  {
    name: CardTheme.CLASSIC,
    displayName: 'Classic',
    description: 'Traditional playing card style',
  },
  {
    name: CardTheme.MODERN,
    displayName: 'Modern',
    description: 'Contemporary design with bold colors',
  },
  {
    name: CardTheme.MINIMAL,
    displayName: 'Minimal',
    description: 'Clean and simple design',
  },
];

/**
 * Settings manager for the application
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private currentTheme: CardTheme = CardTheme.CLASSIC;
  private currentCardStyle: CardStyleConfig = DEFAULT_CARD_STYLE;
  private readonly STORAGE_KEY = 'card-game-settings';

  private constructor() {
    this.loadSettings();
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  /**
   * Loads settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        this.currentTheme = settings.theme || CardTheme.CLASSIC;
        this.currentCardStyle = settings.cardStyle || DEFAULT_CARD_STYLE;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * Saves settings to localStorage
   */
  private saveSettings(): void {
    try {
      const settings = {
        theme: this.currentTheme,
        cardStyle: this.currentCardStyle,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Gets the current card theme
   */
  getTheme(): CardTheme {
    return this.currentTheme;
  }

  /**
   * Sets the card theme
   */
  setTheme(theme: CardTheme): void {
    this.currentTheme = theme;
    this.saveSettings();
    this.applyTheme();
  }

  /**
   * Applies the current theme to the document
   */
  applyTheme(): void {
    // Remove all theme classes
    document.body.classList.remove(
      'theme-classic',
      'theme-modern',
      'theme-minimal'
    );
    
    // Add current theme class
    document.body.classList.add(`theme-${this.currentTheme}`);
    
    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme: this.currentTheme } 
    }));
  }

  /**
   * Initializes the theme on app start
   */
  initialize(): void {
    this.applyTheme();
    this.applyCardStyle();
  }

  /**
   * Gets the current card style configuration
   */
  getCardStyle(): CardStyleConfig {
    return this.currentCardStyle;
  }

  /**
   * Sets the card style configuration
   */
  setCardStyle(style: CardStyleConfig): void {
    this.currentCardStyle = style;
    this.saveSettings();
    this.applyCardStyle();
  }

  /**
   * Sets card style from preset name
   */
  setCardStylePreset(presetName: string): void {
    const preset = CARD_STYLE_PRESETS[presetName];
    if (preset) {
      this.setCardStyle(preset);
    }
  }

  /**
   * Applies the current card style to CSS custom properties
   */
  applyCardStyle(): void {
    const style = this.currentCardStyle;
    const root = document.documentElement;

    // Apply front style
    root.style.setProperty('--card-front-bg', style.front.backgroundColor);
    root.style.setProperty('--card-front-border-color', style.front.borderColor);
    root.style.setProperty('--card-front-border-width', `${style.front.borderWidth}px`);
    root.style.setProperty('--card-front-border-radius', `${style.front.borderRadius}px`);
    root.style.setProperty('--card-corner-font-size', `${style.front.cornerFontSize}rem`);
    root.style.setProperty('--card-center-font-size', `${style.front.centerFontSize}rem`);

    // Apply symbol styles
    root.style.setProperty('--card-heart-color', style.front.symbolStyle.heartColor);
    root.style.setProperty('--card-diamond-color', style.front.symbolStyle.diamondColor);
    root.style.setProperty('--card-club-color', style.front.symbolStyle.clubColor);
    root.style.setProperty('--card-spade-color', style.front.symbolStyle.spadeColor);
    root.style.setProperty('--card-symbol-font-weight', style.front.symbolStyle.fontWeight);

    // Apply back style
    root.style.setProperty('--card-back-border-color', style.back.borderColor || style.front.borderColor);
    root.style.setProperty('--card-back-border-width', `${style.back.borderWidth || style.front.borderWidth}px`);
    root.style.setProperty('--card-back-border-radius', `${style.back.borderRadius || style.front.borderRadius}px`);

    // Apply background based on type
    if (style.back.backgroundType === 'solid' && style.back.backgroundColor) {
      root.style.setProperty('--card-back-bg', style.back.backgroundColor);
    } else if (style.back.backgroundType === 'gradient' && style.back.gradient) {
      const gradient = style.back.gradient;
      const gradientStr = gradient.type === 'linear'
        ? `linear-gradient(${gradient.angle || 135}deg, ${gradient.colors.join(', ')})`
        : `radial-gradient(circle, ${gradient.colors.join(', ')})`;
      root.style.setProperty('--card-back-bg', gradientStr);
    } else if (style.back.backgroundType === 'image' && style.back.imageUrl) {
      root.style.setProperty('--card-back-bg', `url(${style.back.imageUrl})`);
      root.style.setProperty('--card-back-bg-size', 'cover');
    }

    // Dispatch custom event for card style change
    window.dispatchEvent(new CustomEvent('cardstylechange', { 
      detail: { cardStyle: this.currentCardStyle } 
    }));
  }
}
