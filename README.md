# 🃏 Unnamed Card Game

A TypeScript web application for card games, built with React 18 and Material-UI (MUI). This extensible framework provides a complete card game infrastructure with visual components, customizable styling, and an abstract game system.

## Features

- **TypeScript**: Fully typed codebase for better maintainability and developer experience
- **React 18**: Modern UI using React functional components with hooks
- **Material-UI (MUI)**: Material Design 3 inspired UI with comprehensive component library
- **Card Game Framework**: Extensible base classes for building various card games
- **Visual Card Components**: React components for displaying playing cards with customizable styles
- **Advanced Card Customization**: Comprehensive style editor for card appearance, symbols, backgrounds, and themes
- **Settings Management**: Persistent user preferences with theme and style options
- **Event Logging**: Automatic logging of custom events (theme changes, style changes) for debugging and analytics
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
│   ├── components/         # React components
│   │   ├── CardComponent.tsx       # Card rendering component
│   │   ├── CardStyleCustomizer.tsx # Style customization UI
│   │   └── index.ts        # Exports for components module
│   ├── settings/           # Settings and persistence
│   │   ├── SettingsManager.ts # User settings manager
│   │   └── index.ts        # Exports for settings module
│   ├── tools/              # Utility functions and helpers
│   │   ├── EventLogger.ts  # Event logging system
│   │   ├── getSuitSymbol.ts # Suit symbol utilities
│   │   └── index.ts        # Exports for tools module
│   ├── App.tsx             # Main React application component
│   ├── main.tsx            # React application entry point
│   └── theme.ts            # MUI theme configuration
├── index.html              # HTML entry point
├── vite.config.ts          # Vite configuration with React plugin
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

## React Components

### CardComponent
React functional component for displaying a playing card with flip functionality.

```tsx
import { CardComponent } from './components';
import { Card, Suit, Rank } from './game';

const card = new Card(Suit.HEARTS, Rank.ACE);

// In your React component
<CardComponent card={card} showBack={false} />
```

**Features:**
- Front face displays suit symbols, rank, and values
- Back face shows customizable patterns
- Interactive flip on click using React state
- Responsive to card style configuration
- Applies CSS custom properties for theming

**Props:**
- `card: Card` - The card data to display
- `showBack?: boolean` - Whether to show the back of the card initially (default: false)

### CardStyleCustomizer
Comprehensive React component for customizing card appearance with live preview.

```tsx
import { CardStyleCustomizer } from './components';

// In your React component
<CardStyleCustomizer
  initialStyle={currentStyle}
  onSave={(style) => handleSave(style)}
  onCancel={() => handleCancel()}
/>
```

**Features:**
- **Live Preview**: Real-time card preview (front and back) that updates as you customize
- **Preset Styles**: Quick access to Classic, Casino, Modern, and Minimal presets
- **Front Face Customization**: Background color, border color/width/radius
- **Symbol Styles**: Individual colors for hearts, diamonds, clubs, spades, and size adjustment
- **Back Face Customization**: 
  - Solid colors
  - Linear/radial gradients with angle control
  - Custom images via URL or file upload
- **MUI Form Components**: TextField, Select, Button for a consistent modern UI
- **Callback System**: Integration with application settings

**Props:**
- `initialStyle?: CardStyleConfig` - Initial card style configuration
- `onSave: (style: CardStyleConfig) => void` - Callback when user saves changes
- `onCancel: () => void` - Callback when user cancels

### App Component
Main application component that manages game state and UI.

```tsx
import App from './App';

// The App component handles:
// - Game instance and state management
// - Settings dialog with theme selection
// - Card style customizer dialog
// - Player information and card displays
// - Integration with SettingsManager
```

**Features:**
- React hooks for state management (`useState`, `useEffect`)
- MUI Dialogs for settings and customizer
- Responsive layout with MUI Container and Box
- Theme provider for consistent styling
- Persistent settings via SettingsManager

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
- **Casino**: Rich crimson tones with luxurious gold accents
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
settings.setCardStylePreset('casino');

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

## Event Logging

### EventLogger
Singleton class for logging all custom events dispatched by the application, including theme changes and card style changes.

```typescript
import { EventLogger } from './tools';

const logger = EventLogger.getInstance();

// Get all logged events
const allEvents = logger.getEvents();

// Get events of a specific type
const themeEvents = logger.getEventsByType('themechange');
const styleEvents = logger.getEventsByType('cardstylechange');

// Get recent events
const recentEvents = logger.getRecentEvents(10);

// Get events within a date range
const startDate = new Date('2024-01-01');
const endDate = new Date('2024-12-31');
const eventsInRange = logger.getEventsByDateRange(startDate, endDate);

// Get event count by type
const counts = logger.getEventCountByType();
console.log(counts); // { themechange: 5, cardstylechange: 3 }

// Clear all logs
logger.clearLogs();
```

**Features:**
- Automatic event capture for custom events
- Singleton pattern for global access
- Filter events by type or date range
- Retrieve recent events
- Get event statistics
- Console logging in development mode
- Maximum log size management (default: 1000 events)

**Logged Events:**
- `themechange`: Dispatched when the card theme is changed
- `cardstylechange`: Dispatched when card styles are applied

Each logged event includes:
- Unique ID
- Timestamp
- Event type
- Event details (payload)

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

The application provides a complete game interface built with React and MUI:

- **Game Controls**: MUI Button for starting new game
- **Settings Dialog**: 
  - MUI Dialog with theme selection
  - Clickable theme options with visual feedback
  - Card style customization button
- **Card Style Customizer Dialog**: 
  - Full-screen MUI Dialog for style editing
  - MUI TextField, Select, Button components
  - Live preview with front and back cards
- **Game Area**: 
  - MUI Paper component for card display
  - Player information cards with MUI Typography
  - Visual React card components for each card
- **Responsive Layout**: MUI Container and Box for flexible layouts
- **Material Design**: Consistent, accessible UI following Material Design 3 principles

## Technology Stack

- **TypeScript 5.9+**: Type-safe JavaScript with modern features
- **React 18**: Modern UI library with hooks and functional components
- **Vite 7.x**: Next-generation frontend tooling with hot module replacement and React Fast Refresh
- **Material-UI (MUI) 5.x**: React component library implementing Material Design 3
- **Emotion**: CSS-in-JS library used by MUI for styling
- **ES2020**: Modern JavaScript features including optional chaining and nullish coalescing
- **CSS Custom Properties**: Dynamic theming and styling
- **LocalStorage API**: Persistent user preferences

## Architecture Highlights

- **Separation of Concerns**: Game logic, React components, and settings are cleanly separated
- **Type Safety**: Comprehensive TypeScript interfaces and types throughout
- **Extensibility**: Abstract base classes allow easy implementation of new games
- **Component-Based**: React functional components with hooks for state management
- **Customization**: Complete visual customization through the CardStyleCustomizer
- **Persistence**: User preferences survive page reloads via SettingsManager
- **Modern React**: Uses React 18 features, functional components, and hooks (no class components)
- **Material Design 3**: Consistent, accessible UI following Google's latest design system
- **Immutable State**: React best practices with immutable state updates

## Migration from Material Web Components

This project was recently migrated from Material Web Components to React + MUI:

**Benefits:**
- Better React integration with purpose-built components
- More comprehensive component library
- Better TypeScript support
- Active maintenance and community support
- Easier customization and theming

**What Changed:**
- UI framework: Material Web Components → React + Material-UI
- Component architecture: Class-based → Functional components with hooks
- State management: Direct DOM manipulation → React state
- Build: Added @vitejs/plugin-react

**What Stayed the Same:**
- Game logic (Card, Deck, Player, Game classes)
- Settings management (SettingsManager)
- Card style configuration system
- All features and functionality

## License

ISC