# 🃏 Unnamed Card Game

A TypeScript web application for card games, built with Google's Material Design 3 (Material Web Components). This extensible framework provides a complete card game infrastructure with visual components, customizable styling, and an abstract game system.

## Features

- **TypeScript**: Fully typed codebase for better maintainability and developer experience
- **Material Design 3**: Modern UI using Google's latest Material Web Components
- **Card Game Framework**: Extensible base classes for building various card games
- **Visual Card Components**: Rendering system for displaying playing cards with customizable styles
- **Advanced Card Customization**: Comprehensive style editor for card appearance, symbols, backgrounds, and themes
- **Settings Management**: Persistent user preferences with theme and style options
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
│   ├── game/               # Card game base classes
│   │   ├── Card.ts         # Card class with suit and rank
│   │   ├── Deck.ts         # Deck class with shuffle and draw methods
│   │   ├── Player.ts       # Player class with hand and score
│   │   ├── Game.ts         # Abstract base game class
│   │   ├── CardStyles.ts   # Card style configuration and presets
│   │   └── index.ts        # Exports for game module
│   ├── components/         # Visual components
│   │   ├── CardComponent.ts       # Card rendering component
│   │   ├── CardStyleCustomizer.ts # Style customization UI
│   │   └── index.ts        # Exports for components module
│   ├── settings/           # Settings and persistence
│   │   ├── SettingsManager.ts # User settings manager
│   │   └── index.ts        # Exports for settings module
│   └── main.ts             # Main application entry point
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Project dependencies and scripts
```

## Card Game Framework

The project includes a comprehensive set of base classes and components for building card games:

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

## Visual Components

### CardComponent
Visual representation of a playing card with support for front and back faces.

```typescript
import { CardComponent } from './components';
import { Card, Suit, Rank } from './game';

const card = new Card(Suit.HEARTS, Rank.ACE);
const cardComponent = new CardComponent(card);
document.body.appendChild(cardComponent.getElement());

// Flip the card
cardComponent.flip();
```

**Features:**
- Front face displays suit symbols, rank, and values
- Back face shows customizable patterns
- Smooth flip animation
- Responsive to card style configuration
- Applies CSS custom properties for theming

### CardStyleCustomizer
Comprehensive UI component for customizing card appearance with live preview.

```typescript
import { CardStyleCustomizer } from './components';

const customizer = new CardStyleCustomizer();

// Set up callbacks
customizer.onSave((style) => {
  console.log('Saved style:', style);
});

customizer.onCancel(() => {
  console.log('Canceled');
});

// Add to DOM
document.body.appendChild(customizer.getElement());
cust...   
- **Interactive Controls**: Material Design 3 form elements
- **Callback System**: Integration with application settings

## Card Styles System

### CardStyleConfig
Type-safe configuration for complete card appearance.

```typescript
import type { CardStyleConfig } from './game';
import { DEFAULT_CARD_STYLE, CARD_STYLE_PRESETS } from './game';

// Use a preset
const classicStyle = CARD_STYLE_PRESETS.classic;

// Create a custom style
const customStyle: CardStyleConfig = {
  name: 'custom',
  displayName: 'My Style',
  front: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 2,
    borderRadius: 8,
    cornerFontSize: 1.2,
    centerFontSize: 2.5,
    symbolStyle: {
      fontSize: 2.5,
      fontWeight: 'bold',
      heartColor: '#ff0000',
      diamondColor: '#ff0000',
      clubColor: '#000000',
      spadeColor: '#000000',
    },
  },
  back: {
    backgroundType: BackgroundType.GRADIENT,
    gradient: {
      type: 'linear',
      angle: 135,
      colors: ['#667eea', '#764ba2'],
    },
    borderColor: '#333333',
    borderWidth: 2,
    borderRadius: 8,
  },
};
```

**Available Presets:**
- **Classic**: Traditional red and black with gradient back
- **Elegant**: Rich crimson tones with luxurious gold accents
- **Modern**: Contemporary purple gradient with bold styling
- **Minimal**: Clean, monochromatic design with subtle borders

## Settings Management

### SettingsManager
Singleton class for managing user preferences with local storage persistence.

```typescript
import { SettingsManager } from './settings';

const settings = SettingsManager.getInstance();
settings.initialize();

// Get/Set card style
const currentStyle = settings.getCardStyle();
settings.setCardStyle(customStyle);

// Use preset
settings.setCardStylePreset('elegant');

// Get/Set theme
const theme = settings.getTheme();
settings.setTheme(CardTheme.MODERN);
```

**Features:**
- Persistent storage using localStorage
- Automatic CSS custom property application
- Theme management (Classic, Modern, Minimal)
- Card style configuration management
- Singleton pattern for global access

## Gameplay Elements

### Example Game Implementation

The application includes a simple example card game demonstrating the framework:

```typescript
class SimpleCardGame extends Game {
  protected dealInitialCards(): void {
    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
      this.players.forEach(player => {
        const card = this.deck.draw();
        if (card) {
          player.addCard(card);
        }
      });
    }
  }

  playTurn(player: Player): void {
    // Simple turn logic: draw a card
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
    }
  }

  isGameOver(): boolean {
    // Game is over when deck is empty or any player has 10 cards
    return this.deck.size === 0 || this.players.some(p => p.handSize >= 10);
  }

  getWinner(): Player | Player[] | null {
    // Player with most cards wins
    const maxCards = Math.max(...this.players.map(p => p.handSize));
    const winners = this.players.filter(p => p.handSize === maxCards);
    return winners.length === 1 ? winners[0] : winners;
  }
}
```

### User Interface

The application provides a complete game interface:

- **Game Controls**: Start new game button
- **Settings Dialog**: 
  - Theme selection with radio buttons
  - Card style customization button
- **Card Style Customizer Dialog**: Full-featured style editor
- **Game Area**: 
  - Game status display
  - Player information with card hands
  - Visual card components for each card
- **Material Design Components**: Modern, accessible UI elements

## Technology Stack

- **TypeScript 5.9+**: Type-safe JavaScript with modern features
- **Vite 7.x**: Next-generation frontend tooling with hot module replacement
- **Material Web Components 2.x**: Google's Material Design 3 implementation
- **ES2020**: Modern JavaScript features including optional chaining and nullish coalescing
- **CSS Custom Properties**: Dynamic theming and styling
- **LocalStorage API**: Persistent user preferences

## Architecture Highlights

- **Separation of Concerns**: Game logic, visual components, and settings are cleanly separated
- **Type Safety**: Comprehensive TypeScript interfaces and types throughout
- **Extensibility**: Abstract base classes allow easy implementation of new games
- **Customization**: Complete visual customization through the CardStyleCustomizer
- **Persistence**: User preferences survive page reloads
- **Modern Web Standards**: Uses web components and ES modules

## License

ISC