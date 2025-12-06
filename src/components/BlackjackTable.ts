import '@material/web/dialog/dialog.js';

import {
  BlackjackGame,
  Player,
  GameEventBus,
  GameEventType,
  NPCAgent,
  GameStatus,
  PlayerStatus,
  type StateChangeEvent,
  type TurnChangeEvent,
  type GameOverEvent,
  type PlayerUpdateEvent,
} from '../game';
import { SettingsManager } from '../settings/SettingsManager';
import { PlayerHand } from './PlayerHand';
import { GameControls } from './GameControls';
import { BettingPanel } from './BettingPanel';
import { PlayerSelector } from './PlayerSelector';
import { ActivityLogPanel } from './ActivityLogPanel';

/**
 * Main blackjack table component that orchestrates the game UI
 */
export class BlackjackTable {
  private element: HTMLElement;
  private game: BlackjackGame;
  private npcAgent: NPCAgent;
  private eventBus: GameEventBus;
  private settings: SettingsManager;

  // UI Components
  private playerHands: Map<string, PlayerHand> = new Map();
  private handsContainer!: HTMLElement;
  private gameControls: GameControls;
  private bettingPanel: BettingPanel;
  private playerSelector: PlayerSelector;
  private activityLog: ActivityLogPanel;
  private messageArea!: HTMLElement;
  private currentPlayerId: string | null = null;

  constructor(containerSelector: string = '#app') {
    this.eventBus = GameEventBus.getInstance();
    this.settings = SettingsManager.getInstance();

    // Initialize game with default players
    this.game = new BlackjackGame({
      playerNames: ['Player 1'],
      minimumBet: 10,
    });

    // Initialize NPC agent
    this.npcAgent = new NPCAgent();
    this.npcAgent.attachToGame(this.game);

    // Create UI components
    this.gameControls = new GameControls();
    this.bettingPanel = new BettingPanel();
    this.playerSelector = new PlayerSelector();
    this.activityLog = new ActivityLogPanel();

    // Create main element
    this.element = this.createElement();

    // Mount to container
    const container = document.querySelector(containerSelector);
    if (container) {
      container.appendChild(this.element);
    }

    // Setup event handlers
    this.setupEventHandlers();
    this.setupGameEventListeners();

    // Load persisted activity log
    this.activityLog.setEntries(this.settings.getRecentActivity(100));

    // Initialize player selector
    this.initializePlayerSelector();
  }

  /**
   * Creates the main table element
   */
  private createElement(): HTMLElement {
    const table = document.createElement('div');
    table.className = 'blackjack-table';

    // Header with title and stats
    const header = document.createElement('div');
    header.className = 'table-header';

    const title = document.createElement('h1');
    title.textContent = 'Blackjack';
    header.appendChild(title);

    table.appendChild(header);

    // Message area for game status
    this.messageArea = document.createElement('div');
    this.messageArea.className = 'message-area';
    table.appendChild(this.messageArea);

    // Hands container
    this.handsContainer = document.createElement('div');
    this.handsContainer.className = 'hands-container';
    table.appendChild(this.handsContainer);

    // Controls area
    const controlsArea = document.createElement('div');
    controlsArea.className = 'controls-area';
    controlsArea.appendChild(this.bettingPanel.getElement());
    controlsArea.appendChild(this.gameControls.getElement());
    table.appendChild(controlsArea);

    // Player selector (initially visible)
    table.appendChild(this.playerSelector.getElement());

    // Activity log sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.appendChild(this.activityLog.getElement());
    table.appendChild(sidebar);

    return table;
  }

  /**
   * Sets up UI event handlers
   */
  private setupEventHandlers(): void {
    // Game controls
    this.gameControls.onHit = () => {
      if (this.currentPlayerId) {
        this.game.hit(this.currentPlayerId);
      }
    };

    this.gameControls.onStand = () => {
      if (this.currentPlayerId) {
        this.game.stand(this.currentPlayerId);
      }
    };

    this.gameControls.onDouble = () => {
      if (this.currentPlayerId) {
        this.game.doubleDown(this.currentPlayerId);
      }
    };

    this.gameControls.onNewGame = () => {
      this.showPlayerSelector();
    };

    // Betting panel
    this.bettingPanel.onBet = (amount: number) => {
      if (this.currentPlayerId) {
        const player = this.game.getPlayerManager().getPlayer(this.currentPlayerId);
        if (player) {
          player.placeBet(amount);
          this.bettingPanel.setCurrentBet(player.totalBet);
          this.bettingPanel.setBank(player.bank);
        }
      }
    };

    // Player selector
    this.playerSelector.onStartGame = (selectedIds: string[]) => {
      this.startGameWithPlayers(selectedIds);
    };

    this.playerSelector.onAddPlayer = (name: string) => {
      this.game.addPlayer(name);
      this.initializePlayerSelector();
    };
  }

  /**
   * Sets up game event listeners
   */
  private setupGameEventListeners(): void {
    this.eventBus.on(GameEventType.StateChange, (event: StateChangeEvent) => {
      this.handleStateChange(event);
    });

    this.eventBus.on(GameEventType.TurnChange, (event: TurnChangeEvent) => {
      this.handleTurnChange(event);
    });

    this.eventBus.on(GameEventType.GameOver, (event: GameOverEvent) => {
      this.handleGameOver(event);
    });

    this.eventBus.on(GameEventType.PlayerUpdate, (event: PlayerUpdateEvent) => {
      this.handlePlayerUpdate(event);
    });
  }

  /**
   * Handles state change events
   */
  private handleStateChange(event: StateChangeEvent): void {
    const { gameStatus, pot } = event.detail;
    this.bettingPanel.setPot(pot);

    switch (gameStatus) {
      case GameStatus.InProgress:
        this.bettingPanel.setEnabled(false);
        this.gameControls.showActionButtons();
        break;
      case GameStatus.GameOver:
        this.gameControls.hideActionButtons();
        this.bettingPanel.setEnabled(true);
        break;
    }
  }

  /**
   * Handles turn change events
   */
  private handleTurnChange(event: TurnChangeEvent): void {
    const { currentPlayer, action } = event.detail;

    // Update active states
    this.playerHands.forEach((hand, playerId) => {
      hand.setActive(playerId === currentPlayer.id);
    });

    // Update controls for human players
    if (!currentPlayer.isNPC && action === 'start-turn') {
      this.currentPlayerId = currentPlayer.id;
      this.gameControls.setEnabled(true);

      // Enable double only with 2 cards
      const canDouble = currentPlayer.handSize === 2 &&
        currentPlayer.bank >= currentPlayer.currentBet;
      this.gameControls.setDoubleEnabled(canDouble);

      this.showMessage(`${currentPlayer.name}'s turn`);
    } else if (currentPlayer.isNPC) {
      this.gameControls.setEnabled(false);
      this.showMessage(`${currentPlayer.name} is playing...`);
    }
  }

  /**
   * Handles game over events
   */
  private handleGameOver(event: GameOverEvent): void {
    const { winners, reason } = event.detail;

    // Reveal dealer's hole card
    const dealerHand = this.playerHands.get('dealer');
    if (dealerHand) {
      dealerHand.revealAll();
      const dealer = this.game.getDealer();
      if (dealer) {
        const handValue = this.game.getPlayerHandValue(dealer);
        dealerHand.setValue(handValue.best);
      }
    }

    // Update hand statuses
    this.game.getPlayers().forEach(player => {
      const hand = this.playerHands.get(player.id);
      if (hand) {
        hand.setStatus(player.status);
      }
    });

    this.showMessage(reason, 'result');
    this.gameControls.setEnabled(false);
  }

  /**
   * Handles player update events
   */
  private handlePlayerUpdate(event: PlayerUpdateEvent): void {
    const { player, changes } = event.detail;
    const hand = this.playerHands.get(player.id);

    if (hand && changes.hand) {
      hand.setCards(player.getHand());
      const handValue = this.game.getPlayerHandValue(player);

      // Show value for human players, hide dealer's first card value
      if (player.id !== 'dealer' || this.game.isGameOver()) {
        hand.setValue(handValue.best);
      }

      // Update status
      if (handValue.isBusted) {
        hand.setStatus(PlayerStatus.Busted);
      }
    }

    // Update betting display
    if (player.id === this.currentPlayerId) {
      this.bettingPanel.setBank(player.bank);
      this.bettingPanel.setCurrentBet(player.totalBet);
    }
  }

  /**
   * Initializes the player selector with available players
   */
  private initializePlayerSelector(): void {
    const players = this.game.getPlayers().map(p => ({
      id: p.id,
      name: p.name,
      isNPC: p.isNPC,
    }));
    this.playerSelector.setPlayers(players);
  }

  /**
   * Shows the player selector
   */
  private showPlayerSelector(): void {
    this.playerSelector.setVisible(true);
    this.handsContainer.style.display = 'none';
    this.gameControls.getElement().style.display = 'none';
    this.bettingPanel.setVisible(false);
  }

  /**
   * Hides the player selector and shows the game
   */
  private hidePlayerSelector(): void {
    this.playerSelector.setVisible(false);
    this.handsContainer.style.display = 'flex';
    this.gameControls.getElement().style.display = 'flex';
    this.bettingPanel.setVisible(true);
  }

  /**
   * Starts a game with the selected players
   */
  private startGameWithPlayers(playerIds: string[]): void {
    // Set active players
    this.game.getPlayerManager().setActivePlayers(playerIds);

    // Create hand components
    this.createPlayerHands();

    // Hide selector, show game
    this.hidePlayerSelector();

    // Start the game
    this.game.start();

    // Update UI state
    this.updateAllHands();

    // Set first human player as current
    const humanPlayers = this.game.getPlayerManager().getHumanPlayers();
    if (humanPlayers.length > 0) {
      this.currentPlayerId = humanPlayers[0].id;
      this.bettingPanel.setBank(humanPlayers[0].bank);
    }
  }

  /**
   * Creates hand components for all players
   */
  private createPlayerHands(): void {
    this.handsContainer.innerHTML = '';
    this.playerHands.clear();

    const players = this.game.getPlayers();

    // Create dealer hand first (at top)
    const dealer = players.find(p => p.id === 'dealer');
    if (dealer) {
      const dealerHand = new PlayerHand(dealer.id, dealer.name);
      dealerHand.setHideFirstCard(true); // Hide dealer's hole card
      this.playerHands.set(dealer.id, dealerHand);
      this.handsContainer.appendChild(dealerHand.getElement());
    }

    // Create human player hands
    players.filter(p => !p.isNPC).forEach(player => {
      const hand = new PlayerHand(player.id, player.name);
      this.playerHands.set(player.id, hand);
      this.handsContainer.appendChild(hand.getElement());
    });
  }

  /**
   * Updates all player hand displays
   */
  private updateAllHands(): void {
    this.game.getPlayers().forEach(player => {
      const hand = this.playerHands.get(player.id);
      if (hand) {
        hand.setCards(player.getHand());
        const handValue = this.game.getPlayerHandValue(player);

        // Show value, but hide dealer's until game over
        if (player.id !== 'dealer') {
          hand.setValue(handValue.best);
        } else {
          // For dealer, show partial value (visible card only)
          const visibleCards = player.getHand().slice(1);
          const visibleValue = BlackjackGame.calculateHandValue(visibleCards);
          hand.setValue(visibleCards.length > 0 ? `? + ${visibleValue.best}` : '?');
        }
      }
    });
  }

  /**
   * Shows a message in the message area
   */
  private showMessage(message: string, type: string = 'info'): void {
    this.messageArea.textContent = message;
    this.messageArea.className = `message-area message-${type}`;
  }

  /**
   * Gets the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Gets the game instance
   */
  getGame(): BlackjackGame {
    return this.game;
  }
}
