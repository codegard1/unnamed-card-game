import { Game } from './Game';
import { Player } from './Player';
import { Card } from './Card';
import { PlayerManager } from './PlayerManager';
import { GameStatus } from './enums/GameStatus';
import { PlayerStatus } from './enums/PlayerStatus';
import { PlayerAction } from './enums/PlayerAction';
import {
  GameEventBus,
  GameEventType,
} from './GameEventBus';
import { SettingsManager } from '../settings/SettingsManager';

/**
 * Hand value with Ace flexibility
 */
export interface HandValue {
  /** Value treating all Aces as 1 */
  aceAsOne: number;
  /** Value treating one Ace as 11 (if possible without busting) */
  aceAsEleven: number;
  /** Best valid value (≤21 if possible) */
  best: number;
  /** Whether this is a blackjack (21 with 2 cards) */
  isBlackjack: boolean;
  /** Whether the hand is busted (>21) */
  isBusted: boolean;
}

/**
 * Configuration for BlackjackGame
 */
export interface BlackjackConfig {
  /** Minimum bet amount */
  minimumBet?: number;
  /** Number of decks to use (for future multi-deck support) */
  deckCount?: number;
  /** Initial player names (excluding dealer) */
  playerNames?: string[];
}

/**
 * Blackjack game implementation.
 * Extends the abstract Game class with blackjack-specific rules.
 */
export class BlackjackGame extends Game {
  private playerManager: PlayerManager;
  private eventBus: GameEventBus;
  private settings: SettingsManager;

  private gameStatus: GameStatus = GameStatus.Init;
  private pot: number = 0;
  private minimumBet: number;
  private round: number = 0;
  private winnerId: string | null = null;
  private loserId: string | null = null;

  constructor(config: BlackjackConfig = {}) {
    // Initialize with player names or defaults
    const playerNames = config.playerNames ?? ['Player 1', 'Player 2'];
    super(playerNames);

    this.minimumBet = config.minimumBet ?? 10;
    this.eventBus = GameEventBus.getInstance();
    this.settings = SettingsManager.getInstance();

    // Initialize player manager with multiplayer support
    this.playerManager = new PlayerManager({
      defaultPlayerCount: 0,
      includeDealer: false,
      defaultAnte: this.minimumBet,
    });

    // Add players from parent class to manager
    this.players.forEach(player => {
      // Re-create as proper Player instances with blackjack properties
      this.playerManager.addPlayer({
        id: player.id,
        name: player.name,
        isNPC: false,
      });
    });

    // Add dealer
    this.playerManager.addPlayer({
      id: 'dealer',
      name: 'Dealer',
      isNPC: true,
      bank: Infinity,
    });

    // Subscribe to activity log events to persist them
    this.eventBus.on(GameEventType.ActivityLog, (event) => {
      this.settings.appendActivityLog(
        event.detail.message,
        event.detail.playerId
      );
    });
  }

  /**
   * Calculates the value of a hand with Ace flexibility
   */
  static calculateHandValue(hand: Card[]): HandValue {
    let aceCount = 0;
    let total = 0;

    // Sum up card values, counting Aces as 11 initially
    for (const card of hand) {
      const value = card.getValue();
      if (card.rank === 'A') {
        aceCount++;
        total += 11;
      } else {
        total += value;
      }
    }

    // Calculate ace-as-eleven value before adjustments
    const aceAsEleven = total;

    // Convert Aces from 11 to 1 as needed to avoid busting
    while (total > 21 && aceCount > 0) {
      total -= 10;
      aceCount--;
    }

    // Calculate ace-as-one (all aces as 1)
    const aceAsOne = hand.reduce((sum, card) => {
      if (card.rank === 'A') return sum + 1;
      return sum + card.getValue();
    }, 0);

    const isBlackjack = hand.length === 2 && total === 21;
    const isBusted = total > 21;

    return {
      aceAsOne,
      aceAsEleven,
      best: total,
      isBlackjack,
      isBusted,
    };
  }

  /**
   * Gets the best hand value for a player
   */
  getPlayerHandValue(player: Player): HandValue {
    return BlackjackGame.calculateHandValue(player.getHand());
  }

  /**
   * Deals initial cards to all players (2 cards each)
   */
  protected dealInitialCards(): void {
    const allPlayers = this.playerManager.getAllPlayers();

    // Deal 2 cards to each player
    for (let i = 0; i < 2; i++) {
      for (const player of allPlayers) {
        const card = this.deck.draw();
        if (card) {
          player.addCard(card);
        }
      }
    }

    // Check for blackjacks
    for (const player of allPlayers) {
      const handValue = this.getPlayerHandValue(player);
      player.setScore(handValue.best);

      if (handValue.isBlackjack) {
        player.recordBlackjack();
        this.eventBus.log(`${player.name} has Blackjack!`, player.id);
      }
    }

    this.eventBus.emit(GameEventType.DeckUpdate, {
      cardsRemaining: this.deck.size,
      action: 'draw',
    });
  }

  /**
   * Starts a new game
   */
  override start(): void {
    this.round++;
    this.winnerId = null;
    this.loserId = null;
    this.pot = 0;

    // Reset deck and players
    this.deck.reset();
    this.playerManager.startNewRound();

    // Collect antes/minimum bets
    this.playerManager.collectAntes();
    this.pot = this.playerManager.getPot();

    this.isGameActive = true;
    this.gameStatus = GameStatus.InProgress;

    // Deal cards
    this.dealInitialCards();

    // Emit state change
    this.eventBus.emit(GameEventType.StateChange, {
      gameStatus: this.gameStatus,
      round: this.round,
      pot: this.pot,
    });

    this.eventBus.log(`Round ${this.round} started`);

    // Start first player's turn
    this.playerManager.startTurn();
  }

  /**
   * Processes a player's turn action
   */
  playTurn(player: Player): void {
    // This is called when a player needs to make a decision
    // The actual action handling is done via hit() and stand()
    if (player.isNPC) {
      this.playNPCTurn(player);
    }
  }

  /**
   * Handles NPC (dealer) turn logic
   */
  private playNPCTurn(player: Player): void {
    const handValue = this.getPlayerHandValue(player);

    // Dealer hits on 16 or less, stands on 17+
    if (handValue.best <= 16) {
      this.hit(player.id);
    } else {
      this.stand(player.id);
    }
  }

  /**
   * Player requests to hit (draw a card)
   */
  hit(playerId: string): boolean {
    const player = this.playerManager.getPlayer(playerId);
    if (!player || player.isFinished || !this.isGameActive) {
      return false;
    }

    const card = this.deck.draw();
    if (!card) {
      this.eventBus.log('Deck is empty!');
      return false;
    }

    player.addCard(card);
    player.lastAction = PlayerAction.Hit;

    const handValue = this.getPlayerHandValue(player);
    player.setScore(handValue.best);

    this.eventBus.log(
      `${player.name} hits and draws ${card.toString()}`,
      player.id
    );

    this.eventBus.emit(GameEventType.PlayerUpdate, {
      player,
      changes: { hand: true },
    });

    // Check for bust
    if (handValue.isBusted) {
      player.recordBust();
      this.eventBus.log(`${player.name} busts with ${handValue.best}!`, player.id);
      this.advanceTurn();
    }

    // Check for 21
    if (handValue.best === 21) {
      this.stand(playerId);
    }

    return true;
  }

  /**
   * Player chooses to stand (keep current hand)
   */
  stand(playerId: string): boolean {
    const player = this.playerManager.getPlayer(playerId);
    if (!player || player.isFinished || !this.isGameActive) {
      return false;
    }

    player.lastAction = PlayerAction.Stand;
    player.isFinished = true;

    const handValue = this.getPlayerHandValue(player);
    this.eventBus.log(
      `${player.name} stands with ${handValue.best}`,
      player.id
    );

    this.advanceTurn();
    return true;
  }

  /**
   * Player doubles down (double bet, draw one card, stand)
   */
  doubleDown(playerId: string): boolean {
    const player = this.playerManager.getPlayer(playerId);
    if (!player || player.isFinished || !this.isGameActive) {
      return false;
    }

    // Can only double down with 2 cards
    if (player.handSize !== 2) {
      return false;
    }

    // Double the bet
    if (!player.doubleBet()) {
      this.eventBus.log(
        `${player.name} cannot afford to double down`,
        player.id
      );
      return false;
    }

    this.pot += player.currentBet / 2; // Add the additional bet to pot

    // Draw one card
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
      const handValue = this.getPlayerHandValue(player);
      player.setScore(handValue.best);

      this.eventBus.log(
        `${player.name} doubles down and draws ${card.toString()}`,
        player.id
      );

      if (handValue.isBusted) {
        player.recordBust();
        this.eventBus.log(
          `${player.name} busts with ${handValue.best}!`,
          player.id
        );
      }
    }

    // Must stand after double down
    player.isFinished = true;
    this.advanceTurn();
    return true;
  }

  /**
   * Advances to the next player's turn
   */
  private advanceTurn(): void {
    const nextPlayer = this.playerManager.nextActivePlayer();

    if (!nextPlayer || this.playerManager.allPlayersFinished()) {
      this.evaluateGame();
    } else if (nextPlayer.isNPC) {
      // Auto-play NPC turns
      setTimeout(() => this.playTurn(nextPlayer), 500);
    }
  }

  /**
   * Evaluates the game to determine winners/losers
   */
  private evaluateGame(): void {
    const players = this.playerManager.getHumanPlayers();
    const dealer = this.playerManager.getDealer();

    if (!dealer) {
      console.error('No dealer found');
      return;
    }

    const dealerValue = this.getPlayerHandValue(dealer);
    const dealerBusted = dealerValue.isBusted;
    const dealerBlackjack = dealerValue.isBlackjack;

    for (const player of players) {
      const playerValue = this.getPlayerHandValue(player);
      const playerBusted = playerValue.isBusted;
      const playerBlackjack = playerValue.isBlackjack;

      if (playerBusted) {
        // Player busted - dealer wins
        player.recordLoss();
        this.loserId = player.id;
        this.winnerId = dealer.id;
        this.eventBus.log(`${player.name} loses (busted)`, player.id);
      } else if (dealerBlackjack && !playerBlackjack) {
        // Dealer has blackjack, player doesn't - dealer wins
        player.recordLoss();
        this.loserId = player.id;
        this.winnerId = dealer.id;
        this.eventBus.log(`${player.name} loses to dealer's Blackjack`, player.id);
      } else if (playerBlackjack && !dealerBlackjack) {
        // Player has blackjack, dealer doesn't - player wins (3:2 payout)
        player.recordWin();
        const winnings = Math.floor(player.totalBet * 2.5);
        player.receiveWinnings(winnings);
        this.winnerId = player.id;
        this.loserId = dealer.id;
        this.eventBus.log(
          `${player.name} wins with Blackjack! ($${winnings})`,
          player.id
        );
      } else if (dealerBusted) {
        // Dealer busted - player wins
        player.recordWin();
        const winnings = player.totalBet * 2;
        player.receiveWinnings(winnings);
        this.winnerId = player.id;
        this.loserId = dealer.id;
        this.eventBus.log(
          `${player.name} wins! Dealer busted ($${winnings})`,
          player.id
        );
      } else if (playerValue.best > dealerValue.best) {
        // Player has higher hand - player wins
        player.recordWin();
        const winnings = player.totalBet * 2;
        player.receiveWinnings(winnings);
        this.winnerId = player.id;
        this.loserId = dealer.id;
        this.eventBus.log(
          `${player.name} wins with ${playerValue.best} vs ${dealerValue.best}! ($${winnings})`,
          player.id
        );
      } else if (playerValue.best < dealerValue.best) {
        // Dealer has higher hand - dealer wins
        player.recordLoss();
        this.loserId = player.id;
        this.winnerId = dealer.id;
        this.eventBus.log(
          `${player.name} loses with ${playerValue.best} vs ${dealerValue.best}`,
          player.id
        );
      } else {
        // Push - return bet
        player.receiveWinnings(player.totalBet);
        this.eventBus.log(
          `${player.name} pushes with ${playerValue.best}`,
          player.id
        );
      }
    }

    // Update game status
    if (this.winnerId === dealer.id) {
      this.gameStatus = GameStatus.DealerWins;
    } else if (this.winnerId) {
      this.gameStatus = GameStatus.HumanWins;
    } else {
      this.gameStatus = GameStatus.Push;
    }

    this.isGameActive = false;
    this.gameStatus = GameStatus.GameOver;

    // Save player stats
    this.savePlayerData();

    // Emit game over event
    this.eventBus.emit(GameEventType.GameOver, {
      winners: this.winnerId ? [this.playerManager.getPlayer(this.winnerId)!] : [],
      losers: this.loserId ? [this.playerManager.getPlayer(this.loserId)!] : [],
      reason: this.getGameOverReason(),
    });

    this.eventBus.emit(GameEventType.StateChange, {
      gameStatus: this.gameStatus,
      round: this.round,
      pot: this.pot,
    });
  }

  /**
   * Gets a human-readable reason for game over
   */
  private getGameOverReason(): string {
    const winner = this.winnerId
      ? this.playerManager.getPlayer(this.winnerId)
      : null;
    if (!winner) return 'Push - bets returned';
    return `${winner.name} wins!`;
  }

  /**
   * Saves player data to persistent storage
   */
  private savePlayerData(): void {
    this.settings.savePlayers(this.playerManager.toJSON());
  }

  /**
   * Loads player data from persistent storage
   */
  loadPlayerData(): boolean {
    const data = this.settings.getPlayers();
    if (data) {
      // Restore players from saved data
      this.playerManager = PlayerManager.fromJSON(data);
      return true;
    }
    return false;
  }

  /**
   * Checks if the game is over
   */
  isGameOver(): boolean {
    return !this.isGameActive || this.gameStatus === GameStatus.GameOver;
  }

  /**
   * Gets the winner(s) of the game
   */
  getWinner(): Player | Player[] | null {
    if (!this.winnerId) return null;
    const winner = this.playerManager.getPlayer(this.winnerId);
    return winner ?? null;
  }

  /**
   * Gets the current game status
   */
  getGameStatus(): GameStatus {
    return this.gameStatus;
  }

  /**
   * Gets the current pot amount
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

  /**
   * Gets the player manager for direct access
   */
  getPlayerManager(): PlayerManager {
    return this.playerManager;
  }

  /**
   * Sets the minimum bet amount
   */
  setMinimumBet(amount: number): void {
    this.minimumBet = Math.max(1, amount);
    this.playerManager.setAnte(this.minimumBet);
  }

  /**
   * Gets the minimum bet amount
   */
  getMinimumBet(): number {
    return this.minimumBet;
  }

  /**
   * Adds a new player to the game
   */
  addPlayer(name: string, isNPC: boolean = false): Player {
    const id = `player-${Date.now()}`;
    return this.playerManager.addPlayer({ id, name, isNPC });
  }

  /**
   * Removes a player from the game
   */
  removePlayer(playerId: string): boolean {
    return this.playerManager.removePlayer(playerId);
  }

  /**
   * Gets all players
   */
  override getPlayers(): Player[] {
    return this.playerManager.getAllPlayers();
  }

  /**
   * Gets the dealer
   */
  getDealer(): Player | undefined {
    return this.playerManager.getDealer();
  }
}
