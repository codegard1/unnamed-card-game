import type { Player } from './Player';
import type { GameStatus } from './enums/GameStatus';
import type { PlayerAction } from './enums/PlayerAction';

/**
 * Event types emitted by the game event bus
 */
export enum GameEventType {
  StateChange = 'statechange',
  TurnChange = 'turnchange',
  GameOver = 'gameover',
  ActivityLog = 'activitylog',
  PlayerUpdate = 'playerupdate',
  DeckUpdate = 'deckupdate',
}

/**
 * Detail payload for StateChangeEvent
 */
export interface StateChangeDetail {
  gameStatus: GameStatus;
  round: number;
  pot: number;
}

/**
 * Detail payload for TurnChangeEvent
 */
export interface TurnChangeDetail {
  currentPlayer: Player;
  playerIndex: number;
  action?: PlayerAction;
}

/**
 * Detail payload for GameOverEvent
 */
export interface GameOverDetail {
  winners: Player[];
  losers: Player[];
  reason: string;
}

/**
 * Detail payload for ActivityLogEvent
 */
export interface ActivityLogDetail {
  timestamp: number;
  message: string;
  playerId?: string;
}

/**
 * Detail payload for PlayerUpdateEvent
 */
export interface PlayerUpdateDetail {
  player: Player;
  changes: Partial<{
    hand: boolean;
    bank: boolean;
    stats: boolean;
    status: boolean;
  }>;
}

/**
 * Detail payload for DeckUpdateEvent
 */
export interface DeckUpdateDetail {
  cardsRemaining: number;
  action: 'shuffle' | 'draw' | 'reset';
}

/**
 * Typed custom event for game state changes
 */
export class StateChangeEvent extends CustomEvent<StateChangeDetail> {
  constructor(detail: StateChangeDetail) {
    super(GameEventType.StateChange, { detail });
  }
}

/**
 * Typed custom event for turn changes
 */
export class TurnChangeEvent extends CustomEvent<TurnChangeDetail> {
  constructor(detail: TurnChangeDetail) {
    super(GameEventType.TurnChange, { detail });
  }
}

/**
 * Typed custom event for game over
 */
export class GameOverEvent extends CustomEvent<GameOverDetail> {
  constructor(detail: GameOverDetail) {
    super(GameEventType.GameOver, { detail });
  }
}

/**
 * Typed custom event for activity log entries
 */
export class ActivityLogEvent extends CustomEvent<ActivityLogDetail> {
  constructor(detail: ActivityLogDetail) {
    super(GameEventType.ActivityLog, { detail });
  }
}

/**
 * Typed custom event for player updates
 */
export class PlayerUpdateEvent extends CustomEvent<PlayerUpdateDetail> {
  constructor(detail: PlayerUpdateDetail) {
    super(GameEventType.PlayerUpdate, { detail });
  }
}

/**
 * Typed custom event for deck updates
 */
export class DeckUpdateEvent extends CustomEvent<DeckUpdateDetail> {
  constructor(detail: DeckUpdateDetail) {
    super(GameEventType.DeckUpdate, { detail });
  }
}

/**
 * Map of event types to their corresponding event classes
 */
type GameEventMap = {
  [GameEventType.StateChange]: StateChangeEvent;
  [GameEventType.TurnChange]: TurnChangeEvent;
  [GameEventType.GameOver]: GameOverEvent;
  [GameEventType.ActivityLog]: ActivityLogEvent;
  [GameEventType.PlayerUpdate]: PlayerUpdateEvent;
  [GameEventType.DeckUpdate]: DeckUpdateEvent;
};

/**
 * Map of event types to their detail types
 */
type GameEventDetailMap = {
  [GameEventType.StateChange]: StateChangeDetail;
  [GameEventType.TurnChange]: TurnChangeDetail;
  [GameEventType.GameOver]: GameOverDetail;
  [GameEventType.ActivityLog]: ActivityLogDetail;
  [GameEventType.PlayerUpdate]: PlayerUpdateDetail;
  [GameEventType.DeckUpdate]: DeckUpdateDetail;
};

/**
 * Callback type for event listeners
 */
type GameEventCallback<T extends GameEventType> = (
  event: GameEventMap[T]
) => void;

/**
 * Central event bus for game events using EventTarget pattern.
 * Provides typed events and helper methods for pub/sub communication
 * between game logic and UI components.
 */
export class GameEventBus extends EventTarget {
  private static instance: GameEventBus;

  private constructor() {
    super();
  }

  /**
   * Gets the singleton instance of the event bus
   */
  static getInstance(): GameEventBus {
    if (!GameEventBus.instance) {
      GameEventBus.instance = new GameEventBus();
    }
    return GameEventBus.instance;
  }

  /**
   * Emits a typed game event
   */
  emit<T extends GameEventType>(
    type: T,
    detail: GameEventDetailMap[T]
  ): boolean {
    let event: CustomEvent;
    switch (type) {
      case GameEventType.StateChange:
        event = new StateChangeEvent(detail as StateChangeDetail);
        break;
      case GameEventType.TurnChange:
        event = new TurnChangeEvent(detail as TurnChangeDetail);
        break;
      case GameEventType.GameOver:
        event = new GameOverEvent(detail as GameOverDetail);
        break;
      case GameEventType.ActivityLog:
        event = new ActivityLogEvent(detail as ActivityLogDetail);
        break;
      case GameEventType.PlayerUpdate:
        event = new PlayerUpdateEvent(detail as PlayerUpdateDetail);
        break;
      case GameEventType.DeckUpdate:
        event = new DeckUpdateEvent(detail as DeckUpdateDetail);
        break;
      default:
        throw new Error(`Unknown event type: ${type}`);
    }
    return this.dispatchEvent(event);
  }

  /**
   * Subscribes to a typed game event
   */
  on<T extends GameEventType>(
    type: T,
    callback: GameEventCallback<T>
  ): void {
    this.addEventListener(type, callback as EventListener);
  }

  /**
   * Unsubscribes from a typed game event
   */
  off<T extends GameEventType>(
    type: T,
    callback: GameEventCallback<T>
  ): void {
    this.removeEventListener(type, callback as EventListener);
  }

  /**
   * Subscribes to an event and automatically unsubscribes after first emission
   */
  once<T extends GameEventType>(
    type: T,
    callback: GameEventCallback<T>
  ): void {
    const wrapper = (event: Event) => {
      this.removeEventListener(type, wrapper);
      callback(event as GameEventMap[T]);
    };
    this.addEventListener(type, wrapper);
  }

  /**
   * Helper to emit an activity log entry
   */
  log(message: string, playerId?: string): void {
    this.emit(GameEventType.ActivityLog, {
      timestamp: Date.now(),
      message,
      playerId,
    });
  }
}

// Export singleton instance for convenience
export const gameEventBus = GameEventBus.getInstance();
