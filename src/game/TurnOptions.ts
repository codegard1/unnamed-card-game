/**
 * Enum for available turn options in card games
 */
export enum TurnOptions {
  DRAW_CARD = 'Draw Card',
  PASS = 'Pass',
  BET = 'Bet',
}

export interface ITurnOption {
  key: TurnOptions;
  displayName: string;
  disabled: boolean;
}
