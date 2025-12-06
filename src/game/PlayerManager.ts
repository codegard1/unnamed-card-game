import { Player, PlayerOptions, PlayerStats } from './Player';
import { PlayerStatus } from './enums/PlayerStatus';
import { PlayerAction } from './enums/PlayerAction';
import {
  GameEventBus,
  GameEventType,
  TurnChangeEvent,
} from './GameEventBus';

/**
 * Default starting bank for new players
 */
const DEFAULT_BANK = 1000;

/**
 * Default ante amount for betting rounds
 */
const DEFAULT_ANTE = 10;

/**
 * Configuration for PlayerManager
 */
export interface PlayerManagerConfig {
  defaultPlayerCount?: number;
  includeDealer?: boolean;
  defaultBank?: number;
  defaultAnte?: number;
}

/**
 * Manages a collection of players for multiplayer games.
 * Handles turn order, betting rounds, and player lifecycle.
 */
export class PlayerManager {
  private players: Map<string, Player> = new Map();
  private turnOrder: string[] = [];
  private currentPlayerIndex: number = 0;
  private eventBus: GameEventBus;
  private pot: number = 0;
  private ante: number;
  private round: number = 0;

  constructor(config: PlayerManagerConfig = {}) {
    this.eventBus = GameEventBus.getInstance();
    this.ante = config.defaultAnte ?? DEFAULT_ANTE;

    if (config.defaultPlayerCount || config.includeDealer) {
      this.initializeDefaultPlayers(
        config.defaultPlayerCount ?? 2,
        config.includeDealer ?? true,
        config.defaultBank ?? DEFAULT_BANK
      );
    }
  }

  /**
   * Initializes default players (generic names + dealer)
   */
  private initializeDefaultPlayers(
    count: number,
    includeDealer: boolean,
    bank: number
  ): void {
    // Add human players with generic names
    for (let i = 1; i <= count; i++) {
      this.addPlayer({
        id: `player-${i}`,
        name: `Player ${i}`,
        isNPC: false,
        bank,
      });
    }

    // Add dealer if requested
    if (includeDealer) {
      this.addPlayer({
        id: 'dealer',
        name: 'Dealer',
        isNPC: true,
        bank: Infinity, // Dealer has unlimited funds
      });
    }
  }

  /**
   * Adds a player to the game
   */
  addPlayer(options: PlayerOptions): Player {
    const player = new Player(options);
    this.players.set(player.id, player);
    this.turnOrder.push(player.id);
    return player;
  }

  /**
   * Removes a player from the game
   */
  removePlayer(playerId: string): boolean {
    const existed = this.players.delete(playerId);
    if (existed) {
      const index = this.turnOrder.indexOf(playerId);
      if (index > -1) {
        this.turnOrder.splice(index, 1);
        // Adjust current index if necessary
        if (this.currentPlayerIndex >= this.turnOrder.length) {
          this.currentPlayerIndex = 0;
        }
      }
    }
    return existed;
  }

  /**
   * Gets a player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Gets all players
   */
  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  /**
   * Gets all human players
   */
  getHumanPlayers(): Player[] {
    return this.getAllPlayers().filter(p => !p.isNPC);
  }

  /**
   * Gets all NPC players
   */
  getNPCPlayers(): Player[] {
    return this.getAllPlayers().filter(p => p.isNPC);
  }

  /**
   * Gets the dealer (if exists)
   */
  getDealer(): Player | undefined {
    return this.getPlayer('dealer');
  }

  /**
   * Gets the number of players
   */
  get playerCount(): number {
    return this.players.size;
  }

  /**
   * Gets the current pot
   */
  getPot(): number {
    return this.pot;
  }

  /**
   * Gets the current round number
   */
  getRound(): number {
    return this.round;
  }

  // ============ Turn Management ============

  /**
   * Gets the current player
   */
  getCurrentPlayer(): Player | undefined {
    const playerId = this.turnOrder[this.currentPlayerIndex];
    return playerId ? this.players.get(playerId) : undefined;
  }

  /**
   * Gets the current player's index
   */
  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }

  /**
   * Starts the current player's turn
   */
  startTurn(): Player | undefined {
    const player = this.getCurrentPlayer();
    if (player) {
      // End previous player's turn if any
      this.getAllPlayers().forEach(p => {
        if (p.turn && p.id !== player.id) {
          p.turn = false;
          p.lastAction = PlayerAction.EndTurn;
        }
      });

      player.turn = true;
      player.lastAction = PlayerAction.StartTurn;

      this.eventBus.emit(GameEventType.TurnChange, {
        currentPlayer: player,
        playerIndex: this.currentPlayerIndex,
        action: PlayerAction.StartTurn,
      });

      this.eventBus.log(`${player.name}'s turn started`, player.id);
    }
    return player;
  }

  /**
   * Ends the current player's turn
   */
  endTurn(): void {
    const player = this.getCurrentPlayer();
    if (player) {
      player.turn = false;
      player.lastAction = PlayerAction.EndTurn;

      this.eventBus.emit(GameEventType.TurnChange, {
        currentPlayer: player,
        playerIndex: this.currentPlayerIndex,
        action: PlayerAction.EndTurn,
      });
    }
  }

  /**
   * Advances to the next player
   */
  nextPlayer(): Player | undefined {
    this.endTurn();
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.turnOrder.length;
    return this.startTurn();
  }

  /**
   * Finds the next player who hasn't finished
   */
  nextActivePlayer(): Player | undefined {
    const startIndex = this.currentPlayerIndex;
    let attempts = 0;

    do {
      this.currentPlayerIndex =
        (this.currentPlayerIndex + 1) % this.turnOrder.length;
      const player = this.getCurrentPlayer();

      if (player && !player.isFinished && player.status === PlayerStatus.OK) {
        return this.startTurn();
      }

      attempts++;
    } while (attempts < this.turnOrder.length);

    // All players finished
    return undefined;
  }

  /**
   * Checks if all players have finished their turns
   */
  allPlayersFinished(): boolean {
    return this.getAllPlayers().every(
      p => p.isFinished || p.status === PlayerStatus.Busted
    );
  }

  /**
   * Resets turn state for a new round
   */
  resetTurns(): void {
    this.currentPlayerIndex = 0;
    this.getAllPlayers().forEach(player => {
      player.turn = false;
      player.isFinished = false;
      player.status = PlayerStatus.OK;
      player.lastAction = PlayerAction.None;
    });
  }

  // ============ Betting ============

  /**
   * Collects ante from all players
   */
  collectAntes(): void {
    this.pot = 0;
    this.getAllPlayers().forEach(player => {
      if (!player.isNPC || player.id !== 'dealer') {
        if (player.placeAnte(this.ante)) {
          this.pot += this.ante;
          this.eventBus.log(
            `${player.name} places ante of $${this.ante}`,
            player.id
          );
        }
      }
    });
  }

  /**
   * Places a bet for a player
   */
  placeBet(playerId: string, amount: number): boolean {
    const player = this.getPlayer(playerId);
    if (!player) return false;

    if (player.placeBet(amount)) {
      this.pot += amount;
      this.eventBus.log(
        `${player.name} bets $${amount}`,
        player.id
      );
      return true;
    }
    return false;
  }

  /**
   * Awards the pot to the winner(s)
   */
  awardPot(winnerIds: string[]): void {
    if (winnerIds.length === 0) return;

    const share = Math.floor(this.pot / winnerIds.length);
    winnerIds.forEach(id => {
      const player = this.getPlayer(id);
      if (player) {
        player.receiveWinnings(share);
        this.eventBus.log(
          `${player.name} wins $${share}`,
          player.id
        );
      }
    });
    this.pot = 0;
  }

  /**
   * Returns bets to players (push/tie)
   */
  returnBets(): void {
    this.getAllPlayers().forEach(player => {
      if (player.totalBet > 0) {
        player.receiveWinnings(player.totalBet);
        this.eventBus.log(
          `${player.name}'s bet of $${player.totalBet} returned`,
          player.id
        );
      }
    });
    this.pot = 0;
  }

  /**
   * Clears all bets for a new round
   */
  clearBets(): void {
    this.pot = 0;
    this.getAllPlayers().forEach(player => player.clearBets());
  }

  /**
   * Sets the ante amount
   */
  setAnte(amount: number): void {
    this.ante = Math.max(0, amount);
  }

  /**
   * Gets the ante amount
   */
  getAnte(): number {
    return this.ante;
  }

  // ============ Round Management ============

  /**
   * Starts a new round
   */
  startNewRound(): void {
    this.round++;
    this.resetTurns();
    this.clearBets();
    this.getAllPlayers().forEach(player => {
      player.clearHand();
      player.setScore(0);
    });
    this.eventBus.log(`Round ${this.round} started`);
  }

  /**
   * Resets the manager for a new game
   */
  resetGame(): void {
    this.round = 0;
    this.pot = 0;
    this.currentPlayerIndex = 0;
    this.getAllPlayers().forEach(player => player.reset());
  }

  // ============ Persistence ============

  /**
   * Serializes all players for persistence
   */
  toJSON(): { players: ReturnType<Player['toJSON']>[]; ante: number } {
    return {
      players: this.getAllPlayers().map(p => p.toJSON()),
      ante: this.ante,
    };
  }

  /**
   * Restores players from serialized data
   */
  static fromJSON(data: {
    players: (PlayerOptions & { stats?: PlayerStats })[];
    ante?: number;
  }): PlayerManager {
    const manager = new PlayerManager({ defaultPlayerCount: 0 });
    manager.ante = data.ante ?? DEFAULT_ANTE;

    data.players.forEach(playerData => {
      const player = Player.fromJSON(playerData);
      manager.players.set(player.id, player);
      manager.turnOrder.push(player.id);
    });

    return manager;
  }

  /**
   * Sets the active players for the game
   */
  setActivePlayers(playerIds: string[]): void {
    // Reorder turn order based on selected players
    this.turnOrder = playerIds.filter(id => this.players.has(id));
    this.currentPlayerIndex = 0;
  }
}
