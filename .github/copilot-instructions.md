## Copilot Instructions for AI Coding Agents

### Project Overview
- This is a TypeScript web app for card games, using Vite for build/dev and Material Web Components for UI.
- The core logic is in `src/game/` (Card, Deck, Player, Game base classes). UI components are in `src/components/`.
- Extend the `Game` abstract class in `src/game/Game.ts` to implement new card games.

### Key Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev` (serves at http://localhost:3000)
- **Build for production:** `npm run build` (runs TypeScript compiler then Vite build)
- **Preview production build:** `npm run preview`

### Architecture & Patterns
- All game logic is in `src/game/`. Each class (Card, Deck, Player, Game) is designed for extensibility.
- UI logic is separated into `src/components/` (e.g., `CardComponent.ts`).
- Use TypeScript types and interfaces throughout. Prefer composition and inheritance for new game logic.
- Exports for each module are managed via `index.ts` files in their respective folders.
- Material Web Components are used for UI consistency; follow their usage patterns for new UI features.
- Settings and configuration are managed through `src/settings/` directory.

### Code Style & Conventions
- **TypeScript**: Use strict mode enabled in `tsconfig.json`. Never use `any` type unless absolutely necessary.
- **ES2020+**: Use modern JavaScript features (async/await, optional chaining, nullish coalescing).
- **Naming**: Use descriptive names. Classes are PascalCase, functions/variables are camelCase.
- **Structure**: Keep all new card game logic in `src/game/` and new UI in `src/components/`.
- **Components**: Prefer functional, stateless components for UI unless state is required.
- **Enums**: Use TypeScript enums for fixed sets of values (see `Suit`, `Rank`, `CardTheme`).
- **Base Classes**: Always extend provided base classes (`Game`, `Card`, `Player`) for new implementations.

### Testing & Quality
- **Testing**: No formal test suite exists yet. When adding tests, use a framework compatible with Vite (e.g., Vitest).
- **Linting**: ESLint is in devDependencies but not yet configured. Feel free to add an ESLint config file if needed.
- **Type Checking**: Always run `npm run build` before committing to ensure TypeScript compilation succeeds.
- **Manual Testing**: After changes, run `npm run dev` and manually verify functionality in the browser.

### Restrictions & Boundaries
- **DO NOT** modify core framework files (`vite.config.ts`, `tsconfig.json`) unless absolutely necessary.
- **DO NOT** change the base class APIs (`Game`, `Card`, `Deck`, `Player`) without good reason—these are used by existing implementations.
- **DO** extend and inherit from base classes rather than modifying them directly.
- **DO** keep game logic separate from UI components.
- **DO** maintain the existing folder structure: `src/game/` for logic, `src/components/` for UI, `src/settings/` for configuration.

### Key Files & Directories
- `src/game/`: Core game logic (Card, Deck, Player, Game base classes)
- `src/components/`: UI components (e.g., CardComponent)
- `src/settings/`: Settings management (SettingsManager, themes)
- `src/main.ts`: App entry point and game initialization
- `vite.config.ts`: Vite build configuration
- `tsconfig.json`: TypeScript compiler configuration
- `package.json`: Dependencies and npm scripts
- `README.md`: User-facing documentation with usage examples

### Example: Extending the Game
```typescript
import { Game, Player, Card } from './game';

class MyCardGame extends Game {
  protected dealInitialCards(): void {
    // Deal 5 cards to each player
    for (let i = 0; i < 5; i++) {
      this.players.forEach(player => {
        const card = this.deck.draw();
        if (card) player.addCard(card);
      });
    }
  }
  
  playTurn(player: Player): void {
    // Example: player draws one card
    const card = this.deck.draw();
    if (card) {
      player.addCard(card);
      console.log(`${player.name} drew ${card.toString()}`);
    }
  }
  
  isGameOver(): boolean {
    // Game ends when deck is empty or a player has 10 cards
    return this.deck.size === 0 || 
           this.players.some(p => p.handSize >= 10);
  }
  
  getWinner(): Player | Player[] | null {
    if (!this.isGameOver()) return null;
    
    // Winner has the most cards
    const maxCards = Math.max(...this.players.map(p => p.handSize));
    const winners = this.players.filter(p => p.handSize === maxCards);
    return winners.length === 1 ? winners[0] : winners;
  }
}

// Usage
const game = new MyCardGame(['Alice', 'Bob']);
game.start();
```

### Additional Examples

**Creating a Custom Card Component:**
```typescript
import { CardComponent } from './components';
import { Card, Suit, Rank } from './game';

const card = new Card(Suit.HEARTS, Rank.ACE);
const cardComponent = new CardComponent(card);
document.getElementById('card-container')?.appendChild(cardComponent.getElement());
```

**Using the Settings Manager:**
```typescript
import { SettingsManager, CardTheme } from './settings';

const settings = SettingsManager.getInstance();
settings.setTheme(CardTheme.MODERN);
console.log(`Current theme: ${settings.getTheme()}`);
```

---
If any conventions or workflows are unclear, ask for clarification or check the README for more details.
