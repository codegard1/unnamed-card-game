# 🃏 Unnamed Card Game

A TypeScript web application for card games, built with Google's Material Design 3 (Material Web Components).

## Features

- **TypeScript**: Fully typed codebase for better maintainability and developer experience
- **Material Design 3**: Modern UI using Google's latest Material Web Components
- **Card Game Framework**: Extensible base classes for building various card games
- **Modern Build Tools**: Vite for fast development and optimized production builds

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Build for production:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
.
├── src/
│   ├── game/           # Card game base classes
│   │   ├── Card.ts     # Card class with suit and rank
│   │   ├── Deck.ts     # Deck class with shuffle and draw methods
│   │   ├── Player.ts   # Player class with hand and score
│   │   ├── Game.ts     # Abstract base game class
│   │   └── index.ts    # Exports for game module
│   └── main.ts         # Main application entry point
├── index.html          # HTML entry point
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies and scripts
```

## Card Game Framework

The project includes a set of base classes for building card games:

### Card
Represents a playing card with suit and rank.

```typescript
import { Card, Suit, Rank } from './game';

const card = new Card(Suit.HEARTS, Rank.ACE);
console.log(card.toString()); // "A of hearts"
console.log(card.getValue()); // 11
```

### Deck
Manages a deck of 52 playing cards with shuffle and draw functionality.

```typescript
import { Deck } from './game';

const deck = new Deck();
deck.shuffle();
const card = deck.draw();
```

### Player
Represents a player with a hand of cards and a score.

```typescript
import { Player } from './game';

const player = new Player('player-1', 'Alice');
player.addCard(card);
console.log(player.handSize); // 1
```

### Game (Abstract)
Base class for implementing specific card games. Extend this class to create your own games.

```typescript
import { Game, Player } from './game';

class MyCardGame extends Game {
  protected dealInitialCards(): void {
    // Implement dealing logic
  }
  
  playTurn(player: Player): void {
    // Implement turn logic
  }
  
  isGameOver(): boolean {
    // Implement end condition
  }
  
  getWinner(): Player | Player[] | null {
    // Implement winner determination
  }
}
```

## Technology Stack

- **TypeScript 5.9+**: Type-safe JavaScript
- **Vite 7.x**: Next-generation frontend tooling
- **Material Web Components 2.x**: Google's Material Design 3 implementation
- **ES2020**: Modern JavaScript features

## Blackjack Game (Merged from `blackjack` repository)

The blackjack game was migrated from a separate React/Fluent UI/Create-React-App codebase into this vanilla TypeScript/Material Web architecture. The migration preserved multiplayer support, statistics persistence, and core game logic while adopting the new framework patterns.

### Features Migrated

- **Complete Blackjack Rules**: Hit, stand, double down, blackjack detection (21 with 2 cards), bust detection, dealer vs player evaluation
- **Multiplayer Support**: Multiple human players can compete against the dealer with turn-based gameplay
- **Statistics Persistence**: Player stats (games won/lost/played, busts, blackjacks, total winnings, win/loss ratio) saved to localStorage
- **Activity Logging**: Game events logged and persisted for review
- **Dealer AI**: Configurable NPC strategies (hit on ≤16, stand on 17+)

### New Architecture Components

**Game Logic (`src/game/`):**
| File | Description |
|------|-------------|
| `BlackjackGame.ts` | Full blackjack implementation extending the abstract `Game` class |
| `PlayerManager.ts` | Multiplayer orchestration, turn tracking, betting system |
| `GameEventBus.ts` | EventTarget-based pub/sub system with typed events |
| `NPCAgent.ts` | Dealer AI with pluggable strategies |
| `enums/` | `GameStatus`, `PlayerAction`, `PlayerStatus` enums |

**UI Components (`src/components/`):**
| Component | Description |
|-----------|-------------|
| `BlackjackTable.ts` | Main game orchestrator connecting all UI pieces |
| `PlayerHand.ts` | Displays player's cards with deal animations |
| `GameControls.ts` | Hit/Stand/Double Down action buttons |
| `BettingPanel.ts` | Bet input, quick bets, bank/pot display |
| `PlayerSelector.ts` | Player selection before game start |
| `ActivityLogPanel.ts` | Scrollable game event history |

### Extended Base Classes

The `Player` class was extended with blackjack-specific properties:
- `isNPC`, `bank`, `stats` - Player type and financial tracking
- `turn`, `isFinished`, `lastAction`, `status` - Turn state management
- `currentBet`, `lastBet`, `totalBet` - Betting system
- `recordWin()`, `recordLoss()`, `recordBust()`, `recordBlackjack()` - Statistics tracking
- `toJSON()` / `fromJSON()` - Serialization for persistence

### Event-Driven Architecture

The game uses an `EventTarget`-based pub/sub pattern for loose coupling between game logic and UI:

```typescript
import { gameEventBus, GameEventType } from './game';

// Subscribe to events
gameEventBus.on(GameEventType.TurnChange, (event) => {
  console.log(`${event.detail.currentPlayer.name}'s turn`);
});

// Emit events
gameEventBus.emit(GameEventType.StateChange, {
  gameStatus: GameStatus.InProgress,
  round: 1,
  pot: 100,
});
```

### Usage Example

```typescript
import { BlackjackGame, NPCAgent } from './game';
import { BlackjackTable } from './components';

// Option 1: Use the full UI component
const table = new BlackjackTable('#game-container');

// Option 2: Use game logic directly
const game = new BlackjackGame({
  playerNames: ['Alice', 'Bob'],
  minimumBet: 25,
});

const agent = new NPCAgent();
agent.attachToGame(game);

game.start();
game.hit('player-0');  // Alice hits
game.stand('player-0'); // Alice stands
```

## License

ISC
