import type { PlayerOptions, PlayerStats } from '../game/Player';

/**
 * Current storage schema version
 */
const STORAGE_VERSION = 1;

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
 * Activity log entry
 */
export interface ActivityLogEntry {
  timestamp: number;
  message: string;
  playerId?: string;
}

/**
 * Player storage data
 */
export interface PlayerStorageData {
  players: (PlayerOptions & { stats?: PlayerStats })[];
  ante: number;
}

/**
 * Complete storage structure
 */
interface StorageData {
  version: number;
  theme: CardTheme;
  players?: PlayerStorageData;
  activityLog?: ActivityLogEntry[];
}

/**
 * Settings manager for the application
 */
export class SettingsManager {
  private static instance: SettingsManager;
  private currentTheme: CardTheme = CardTheme.CLASSIC;
  private activityLog: ActivityLogEntry[] = [];
  private playerData: PlayerStorageData | null = null;

  private readonly STORAGE_KEY = 'card-game-settings';
  private readonly PLAYERS_STORAGE_KEY = 'card-game-players';
  private readonly ACTIVITY_LOG_KEY = 'card-game-activity-log';
  private readonly MAX_LOG_ENTRIES = 500;

  private constructor() {
    this.loadSettings();
    this.loadActivityLog();
    this.loadPlayers();
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
        const settings: StorageData = JSON.parse(stored);
        // Handle version migration if needed
        if (settings.version !== STORAGE_VERSION) {
          this.migrateStorage(settings);
        }
        this.currentTheme = settings.theme || CardTheme.CLASSIC;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  /**
   * Migrates storage from older versions
   */
  private migrateStorage(oldData: Partial<StorageData>): void {
    // Version 1 is current, so just ensure defaults
    console.log('Migrating storage from version', oldData.version ?? 0);
    // Future migrations would go here
  }

  /**
   * Saves settings to localStorage
   */
  private saveSettings(): void {
    try {
      const settings: StorageData = {
        version: STORAGE_VERSION,
        theme: this.currentTheme,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // ============ Player Persistence ============

  /**
   * Loads player data from localStorage
   */
  private loadPlayers(): void {
    try {
      const stored = localStorage.getItem(this.PLAYERS_STORAGE_KEY);
      if (stored) {
        this.playerData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load player data:', error);
      this.playerData = null;
    }
  }

  /**
   * Saves player data to localStorage
   */
  savePlayers(data: PlayerStorageData): void {
    try {
      this.playerData = data;
      localStorage.setItem(this.PLAYERS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save player data:', error);
    }
  }

  /**
   * Gets saved player data
   */
  getPlayers(): PlayerStorageData | null {
    return this.playerData;
  }

  /**
   * Clears saved player data
   */
  clearPlayers(): void {
    this.playerData = null;
    localStorage.removeItem(this.PLAYERS_STORAGE_KEY);
  }

  // ============ Activity Log ============

  /**
   * Loads activity log from localStorage
   */
  private loadActivityLog(): void {
    try {
      const stored = localStorage.getItem(this.ACTIVITY_LOG_KEY);
      if (stored) {
        this.activityLog = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load activity log:', error);
      this.activityLog = [];
    }
  }

  /**
   * Saves activity log to localStorage
   */
  private saveActivityLog(): void {
    try {
      localStorage.setItem(
        this.ACTIVITY_LOG_KEY,
        JSON.stringify(this.activityLog)
      );
    } catch (error) {
      console.error('Failed to save activity log:', error);
    }
  }

  /**
   * Appends an entry to the activity log
   */
  appendActivityLog(message: string, playerId?: string): void {
    const entry: ActivityLogEntry = {
      timestamp: Date.now(),
      message,
      playerId,
    };

    this.activityLog.push(entry);

    // Trim log if too large
    if (this.activityLog.length > this.MAX_LOG_ENTRIES) {
      this.activityLog = this.activityLog.slice(-this.MAX_LOG_ENTRIES);
    }

    this.saveActivityLog();

    // Dispatch event for real-time updates
    window.dispatchEvent(
      new CustomEvent('activitylog', { detail: entry })
    );
  }

  /**
   * Gets the activity log
   */
  getActivityLog(): ActivityLogEntry[] {
    return [...this.activityLog];
  }

  /**
   * Gets recent activity log entries
   */
  getRecentActivity(count: number = 50): ActivityLogEntry[] {
    return this.activityLog.slice(-count);
  }

  /**
   * Clears the activity log
   */
  clearActivityLog(): void {
    this.activityLog = [];
    localStorage.removeItem(this.ACTIVITY_LOG_KEY);
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

  /**
   * Clears all stored data
   */
  clearAll(): void {
    this.clearPlayers();
    this.clearActivityLog();
    this.currentTheme = CardTheme.CLASSIC;
    this.saveSettings();
    this.applyTheme();
  }
}
