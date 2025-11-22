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
  }
}
