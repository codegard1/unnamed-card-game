import { CardTheme, ThemeConfig } from '.';

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
