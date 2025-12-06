import { Card } from './Card';
import { PlayerStatus } from './enums/PlayerStatus';
import { PlayerAction } from './enums/PlayerAction';

/**
 * Statistics tracked per player across games
 */
export interface PlayerStats {
  numberOfGamesLost: number;
  numberOfGamesPlayed: number;
  numberOfGamesWon: number;
  numberOfTimesBlackjack: number;
  numberOfTimesBusted: number;
  totalWinnings: number;
  winLossRatio: number;
}

/**
 * Creates default player stats
 */
function createDefaultStats(): PlayerStats {
  return {
    numberOfGamesLost: 0,
    numberOfGamesPlayed: 0,
    numberOfGamesWon: 0,
    numberOfTimesBlackjack: 0,
    numberOfTimesBusted: 0,
    totalWinnings: 0,
    winLossRatio: 0,
  };
}

/**
 * Options for creating a new player
 */
export interface PlayerOptions {
  id: string;
  name: string;
  isNPC?: boolean;
  bank?: number;
  stats?: PlayerStats;
}

/**
 * Represents a player in the card game
 */
export class Player {
  private hand: Card[] = [];
  private score: number = 0;

  /** Unique identifier for the player */
  public readonly id: string;
  /** Display name */
  public readonly name: string;
  /** Whether this player is controlled by AI */
  public readonly isNPC: boolean;

  /** Player's current money */
  private _bank: number;
  /** Player's statistics across games */
  private _stats: PlayerStats;
  /** Whether it's currently this player's turn */
  private _turn: boolean = false;
  /** Whether the player has finished their actions this round */
  private _isFinished: boolean = false;
  /** The player's most recent action */
  private _lastAction: PlayerAction = PlayerAction.None;
  /** The player's current status */
  private _status: PlayerStatus = PlayerStatus.OK;
  /** The player's bet for the current round */
  private _currentBet: number = 0;
  /** The player's last bet amount (for re-betting) */
  private _lastBet: number = 0;
  /** The player's ante for the current round */
  private _lastAnte: number = 0;
  /** Total amount bet across the round (including doubles) */
  private _totalBet: number = 0;

  constructor(options: PlayerOptions) {
    this.id = options.id;
    this.name = options.name;
    this.isNPC = options.isNPC ?? false;
    this._bank = options.bank ?? 1000;
    this._stats = options.stats ?? createDefaultStats();
  }

  /**
   * Creates a player with legacy constructor signature for backwards compatibility
   */
  static create(id: string, name: string, isNPC: boolean = false): Player {
    return new Player({ id, name, isNPC });
  }

  /**
   * Adds a card to the player's hand
   */
  addCard(card: Card): void {
    this.hand.push(card);
  }

  /**
   * Removes a card from the player's hand
   */
  removeCard(card: Card): boolean {
    const index = this.hand.indexOf(card);
    if (index > -1) {
      this.hand.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Returns the player's current hand
   */
  getHand(): Card[] {
    return [...this.hand];
  }

  /**
   * Clears the player's hand
   */
  clearHand(): void {
    this.hand = [];
  }

  /**
   * Returns the number of cards in the player's hand
   */
  get handSize(): number {
    return this.hand.length;
  }

  /**
   * Updates the player's score
   */
  setScore(score: number): void {
    this.score = score;
  }

  /**
   * Adds to the player's score
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * Returns the player's current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Resets the player's hand and score
   */
  reset(): void {
    this.clearHand();
    this.score = 0;
    this._turn = false;
    this._isFinished = false;
    this._lastAction = PlayerAction.None;
    this._status = PlayerStatus.OK;
    this._currentBet = 0;
    this._totalBet = 0;
  }

  // ============ Bank & Betting ============

  /** Gets the player's current bank balance */
  get bank(): number {
    return this._bank;
  }

  /** Sets the player's bank balance */
  set bank(value: number) {
    this._bank = Math.max(0, value);
  }

  /** Gets the current bet amount */
  get currentBet(): number {
    return this._currentBet;
  }

  /** Gets the last bet amount */
  get lastBet(): number {
    return this._lastBet;
  }

  /** Gets the last ante amount */
  get lastAnte(): number {
    return this._lastAnte;
  }

  /** Gets the total bet for this round */
  get totalBet(): number {
    return this._totalBet;
  }

  /**
   * Places a bet, deducting from bank
   */
  placeBet(amount: number): boolean {
    if (amount > this._bank || amount <= 0) {
      return false;
    }
    this._bank -= amount;
    this._currentBet = amount;
    this._lastBet = amount;
    this._totalBet += amount;
    this._lastAction = PlayerAction.Bet;
    return true;
  }

  /**
   * Places an ante bet
   */
  placeAnte(amount: number): boolean {
    if (amount > this._bank || amount <= 0) {
      return false;
    }
    this._bank -= amount;
    this._lastAnte = amount;
    this._totalBet += amount;
    this._lastAction = PlayerAction.Ante;
    return true;
  }

  /**
   * Doubles the current bet (for double down)
   */
  doubleBet(): boolean {
    const doubleAmount = this._currentBet;
    if (doubleAmount > this._bank) {
      return false;
    }
    this._bank -= doubleAmount;
    this._currentBet *= 2;
    this._totalBet += doubleAmount;
    this._lastAction = PlayerAction.DoubleDown;
    return true;
  }

  /**
   * Awards winnings to the player
   */
  receiveWinnings(amount: number): void {
    this._bank += amount;
    this._stats.totalWinnings += amount;
  }

  /**
   * Clears betting state for a new round
   */
  clearBets(): void {
    this._currentBet = 0;
    this._totalBet = 0;
  }

  // ============ Turn State ============

  /** Gets whether it's this player's turn */
  get turn(): boolean {
    return this._turn;
  }

  /** Sets whether it's this player's turn */
  set turn(value: boolean) {
    this._turn = value;
    if (value) {
      this._lastAction = PlayerAction.StartTurn;
    }
  }

  /** Gets whether the player has finished their actions */
  get isFinished(): boolean {
    return this._isFinished;
  }

  /** Sets whether the player has finished their actions */
  set isFinished(value: boolean) {
    this._isFinished = value;
    if (value) {
      this._lastAction = PlayerAction.Finish;
    }
  }

  /** Gets the player's last action */
  get lastAction(): PlayerAction {
    return this._lastAction;
  }

  /** Sets the player's last action */
  set lastAction(action: PlayerAction) {
    this._lastAction = action;
  }

  /** Gets the player's current status */
  get status(): PlayerStatus {
    return this._status;
  }

  /** Sets the player's current status */
  set status(value: PlayerStatus) {
    this._status = value;
  }

  // ============ Statistics ============

  /** Gets the player's stats */
  get stats(): PlayerStats {
    return { ...this._stats };
  }

  /**
   * Records a game won
   */
  recordWin(): void {
    this._stats.numberOfGamesWon++;
    this._stats.numberOfGamesPlayed++;
    this._status = PlayerStatus.Winner;
    this.updateWinLossRatio();
  }

  /**
   * Records a game lost
   */
  recordLoss(): void {
    this._stats.numberOfGamesLost++;
    this._stats.numberOfGamesPlayed++;
    this._status = PlayerStatus.Loser;
    this.updateWinLossRatio();
  }

  /**
   * Records a bust
   */
  recordBust(): void {
    this._stats.numberOfTimesBusted++;
    this._status = PlayerStatus.Busted;
    this._isFinished = true;
  }

  /**
   * Records a blackjack
   */
  recordBlackjack(): void {
    this._stats.numberOfTimesBlackjack++;
    this._status = PlayerStatus.Blackjack;
  }

  /**
   * Updates the win/loss ratio
   */
  private updateWinLossRatio(): void {
    if (this._stats.numberOfGamesLost === 0) {
      this._stats.winLossRatio = this._stats.numberOfGamesWon;
    } else {
      this._stats.winLossRatio =
        this._stats.numberOfGamesWon / this._stats.numberOfGamesLost;
    }
  }

  /**
   * Serializes player data for persistence
   */
  toJSON(): PlayerOptions & { stats: PlayerStats } {
    return {
      id: this.id,
      name: this.name,
      isNPC: this.isNPC,
      bank: this._bank,
      stats: { ...this._stats },
    };
  }

  /**
   * Creates a player from serialized data
   */
  static fromJSON(data: PlayerOptions & { stats?: PlayerStats }): Player {
    return new Player({
      id: data.id,
      name: data.name,
      isNPC: data.isNPC ?? false,
      bank: data.bank ?? 1000,
      stats: data.stats ?? createDefaultStats(),
    });
  }
}
