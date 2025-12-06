import { Player } from './Player';
import { BlackjackGame, HandValue } from './BlackjackGame';
import {
  GameEventBus,
  GameEventType,
  TurnChangeEvent,
} from './GameEventBus';

/**
 * Strategy interface for NPC decision making
 */
export interface NPCStrategy {
  /**
   * Decides whether the NPC should hit or stand
   * @returns 'hit' | 'stand' | 'double'
   */
  decide(player: Player, handValue: HandValue, dealerUpCard?: number): 'hit' | 'stand' | 'double';
}

/**
 * Basic dealer strategy: hit on 16 or less, stand on 17+
 */
export class BasicDealerStrategy implements NPCStrategy {
  decide(player: Player, handValue: HandValue): 'hit' | 'stand' | 'double' {
    if (handValue.best <= 16) {
      return 'hit';
    }
    return 'stand';
  }
}

/**
 * Soft 17 dealer strategy: hit on soft 17 (Ace + 6)
 */
export class Soft17DealerStrategy implements NPCStrategy {
  decide(player: Player, handValue: HandValue): 'hit' | 'stand' | 'double' {
    // Hit on soft 17 (Ace counted as 11 + total of 6)
    if (handValue.best === 17 && handValue.aceAsOne !== handValue.aceAsEleven) {
      return 'hit';
    }
    if (handValue.best <= 16) {
      return 'hit';
    }
    return 'stand';
  }
}

/**
 * Conservative NPC strategy: stand on 15+
 */
export class ConservativeStrategy implements NPCStrategy {
  decide(player: Player, handValue: HandValue): 'hit' | 'stand' | 'double' {
    if (handValue.best <= 14) {
      return 'hit';
    }
    return 'stand';
  }
}

/**
 * Aggressive NPC strategy: always try to beat 18
 */
export class AggressiveStrategy implements NPCStrategy {
  decide(player: Player, handValue: HandValue): 'hit' | 'stand' | 'double' {
    if (handValue.best <= 17) {
      return 'hit';
    }
    return 'stand';
  }
}

/**
 * Basic strategy that considers dealer's up card
 * Simplified version of optimal blackjack basic strategy
 */
export class BasicStrategy implements NPCStrategy {
  decide(
    player: Player,
    handValue: HandValue,
    dealerUpCard?: number
  ): 'hit' | 'stand' | 'double' {
    const playerTotal = handValue.best;
    const dealerShows = dealerUpCard ?? 10;

    // Hard hands (no Ace or Ace counts as 1)
    if (handValue.aceAsOne === handValue.best) {
      if (playerTotal >= 17) return 'stand';
      if (playerTotal >= 13 && dealerShows <= 6) return 'stand';
      if (playerTotal === 12 && dealerShows >= 4 && dealerShows <= 6) return 'stand';
      if (playerTotal === 11 && player.handSize === 2) return 'double';
      if (playerTotal === 10 && dealerShows <= 9 && player.handSize === 2) return 'double';
      return 'hit';
    }

    // Soft hands (Ace counts as 11)
    if (playerTotal >= 19) return 'stand';
    if (playerTotal === 18) {
      if (dealerShows >= 9) return 'hit';
      return 'stand';
    }
    return 'hit';
  }
}

/**
 * NPC Agent that manages automated player decisions.
 * Subscribes to turn change events and executes appropriate actions.
 */
export class NPCAgent {
  private eventBus: GameEventBus;
  private game: BlackjackGame | null = null;
  private strategies: Map<string, NPCStrategy> = new Map();
  private defaultStrategy: NPCStrategy;
  private turnHandler: ((event: TurnChangeEvent) => void) | null = null;
  private autoPlayDelay: number = 800;

  constructor(defaultStrategy?: NPCStrategy) {
    this.eventBus = GameEventBus.getInstance();
    this.defaultStrategy = defaultStrategy ?? new BasicDealerStrategy();
  }

  /**
   * Attaches the agent to a game
   */
  attachToGame(game: BlackjackGame): void {
    this.game = game;
    this.subscribeToTurnChanges();
  }

  /**
   * Detaches the agent from the current game
   */
  detach(): void {
    this.unsubscribeFromTurnChanges();
    this.game = null;
  }

  /**
   * Sets a custom strategy for a specific player
   */
  setStrategy(playerId: string, strategy: NPCStrategy): void {
    this.strategies.set(playerId, strategy);
  }

  /**
   * Gets the strategy for a player
   */
  getStrategy(playerId: string): NPCStrategy {
    return this.strategies.get(playerId) ?? this.defaultStrategy;
  }

  /**
   * Sets the delay before NPC actions (in ms)
   */
  setAutoPlayDelay(delay: number): void {
    this.autoPlayDelay = Math.max(0, delay);
  }

  /**
   * Subscribes to turn change events
   */
  private subscribeToTurnChanges(): void {
    this.turnHandler = (event: TurnChangeEvent) => {
      this.handleTurnChange(event);
    };
    this.eventBus.on(GameEventType.TurnChange, this.turnHandler);
  }

  /**
   * Unsubscribes from turn change events
   */
  private unsubscribeFromTurnChanges(): void {
    if (this.turnHandler) {
      this.eventBus.off(GameEventType.TurnChange, this.turnHandler);
      this.turnHandler = null;
    }
  }

  /**
   * Handles turn change events
   */
  private handleTurnChange(event: TurnChangeEvent): void {
    const { currentPlayer, action } = event.detail;

    // Only act on turn start for NPCs
    if (action !== 'start-turn' || !currentPlayer.isNPC) {
      return;
    }

    // Delay the action for more natural gameplay
    setTimeout(() => {
      this.playTurn(currentPlayer);
    }, this.autoPlayDelay);
  }

  /**
   * Plays a turn for an NPC player
   */
  private playTurn(player: Player): void {
    if (!this.game || player.isFinished) {
      return;
    }

    const handValue = this.game.getPlayerHandValue(player);

    // Already busted or has blackjack
    if (handValue.isBusted || handValue.isBlackjack) {
      this.game.stand(player.id);
      return;
    }

    // Get dealer's up card (first visible card)
    const dealer = this.game.getDealer();
    let dealerUpCard: number | undefined;
    if (dealer && dealer.handSize > 0) {
      const dealerHand = dealer.getHand();
      dealerUpCard = dealerHand[0]?.getValue();
    }

    // Get strategy and decide
    const strategy = this.getStrategy(player.id);
    const decision = strategy.decide(player, handValue, dealerUpCard);

    // Execute decision
    switch (decision) {
      case 'hit':
        this.game.hit(player.id);
        // Check if we need to continue playing
        const newHandValue = this.game.getPlayerHandValue(player);
        if (!player.isFinished && !newHandValue.isBusted && newHandValue.best < 21) {
          // Continue playing after a delay
          setTimeout(() => this.playTurn(player), this.autoPlayDelay);
        }
        break;
      case 'stand':
        this.game.stand(player.id);
        break;
      case 'double':
        if (!this.game.doubleDown(player.id)) {
          // If can't double, just hit
          this.game.hit(player.id);
        }
        break;
    }
  }

  /**
   * Manually triggers NPC to play (for testing/debugging)
   */
  triggerPlay(playerId: string): void {
    if (!this.game) return;
    const player = this.game.getPlayerManager().getPlayer(playerId);
    if (player && player.isNPC) {
      this.playTurn(player);
    }
  }
}
