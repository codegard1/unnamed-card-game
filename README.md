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

## License

ISC
