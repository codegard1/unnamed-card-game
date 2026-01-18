## Copilot Instructions for AI Coding Agents

### Project Overview
- This is a TypeScript web app for card games, using React 18 + Material-UI (MUI) for UI and Vite for build/dev.
- The core logic is in `src/game/` (Card, Deck, Player, Game base classes). UI components are React components in `src/components/`.
- Extend the `Game` abstract class in `src/game/Game.ts` to implement new card games.

### Key Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev` (serves at http://localhost:3000)
- **Build for production:** `npm run build` (runs TypeScript compiler then Vite build)
- **Preview production build:** `npm run preview`

### Architecture & Patterns
- All game logic is in `src/game/`. Each class (Card, Deck, Player, Game) is designed for extensibility.
- UI logic is separated into React components in `src/components/` (e.g., `CardComponent.tsx`, `CardStyleCustomizer.tsx`).
- Use TypeScript types and interfaces throughout. Prefer composition and inheritance for new game logic.
- Exports for each module are managed via `index.ts` files in their respective folders.
- React components use functional components with hooks (useState, useEffect) - no class components.
- Material-UI (MUI) components are used for UI consistency; use MUI's `sx` prop for styling.
- Settings and configuration are managed through `src/settings/` directory.
- Main application logic is in `src/App.tsx` with React state management.
- Entry point is `src/main.tsx` which renders the App component.

### Code Style & Conventions
- **TypeScript**: Use strict mode enabled in `tsconfig.json`. Never use `any` type unless absolutely necessary.
- **React**: Use functional components with hooks. Follow React best practices:
  - Immutable state updates (never mutate state directly)
  - Proper dependency arrays in useEffect
  - Meaningful component and variable names
- **ES2020+**: Use modern JavaScript features (async/await, optional chaining, nullish coalescing).
- **Naming**: Use descriptive names. Classes are PascalCase, functions/variables are camelCase, React components are PascalCase.
- **Structure**: Keep all new card game logic in `src/game/` and new UI in `src/components/` as React components (`.tsx` files).
- **Components**: All UI components are React functional components. Use MUI components for UI elements.
- **Enums**: Use TypeScript enums for fixed sets of values (see `Suit`, `Rank`, `CardTheme`).
- **Base Classes**: Always extend provided base classes (`Game`, `Card`, `Player`) for new implementations.
- **Styling**: Use MUI's `sx` prop for component-specific styles. Use MUI theme for global styling.

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
- **DO** maintain the existing folder structure: `src/game/` for logic, `src/components/` for UI (React components), `src/settings/` for configuration.
- **DO** use React functional components with hooks, not class components.
- **DO** use MUI components for all UI elements (Button, Dialog, TextField, etc.).

### Key Files & Directories
- `src/game/`: Core game logic (Card, Deck, Player, Game base classes)
- `src/components/`: React UI components (CardComponent.tsx, CardStyleCustomizer.tsx)
- `src/settings/`: Settings management (SettingsManager, themes)
- `src/App.tsx`: Main React application component with game state management
- `src/main.tsx`: React application entry point
- `src/theme.ts`: MUI theme configuration
- `vite.config.ts`: Vite build configuration with React plugin
- `tsconfig.json`: TypeScript compiler configuration (includes jsx: "react-jsx")
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
```tsx
import { CardComponent } from './components';
import { Card, Suit, Rank } from './game';

// In your React component
function MyGameComponent() {
  const card = new Card(Suit.HEARTS, Rank.ACE);
  
  return (
    <div>
      <CardComponent card={card} showBack={false} />
    </div>
  );
}
```

**Using the Settings Manager:**
```typescript
import { SettingsManager, CardTheme } from './settings';

const settings = SettingsManager.getInstance();
settings.setTheme(CardTheme.MODERN);
console.log(`Current theme: ${settings.getTheme()}`);
```

**Creating a React Component with MUI:**
```tsx
import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, Box } from '@mui/material';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>My Dialog</DialogTitle>
        <DialogContent>
          Content goes here
        </DialogContent>
      </Dialog>
    </Box>
  );
}
```

### React + MUI Specific Guidelines
- **State Management**: Use `useState` for component state, `useEffect` for side effects
- **MUI Components**: Use MUI components instead of HTML elements:
  - `<Button>` instead of `<button>`
  - `<Dialog>` instead of custom modals
  - `<TextField>` instead of `<input>`
  - `<Box>` for layout containers
- **Styling**: Use the `sx` prop for inline styles with theme-aware values
- **Theme**: Import and use the theme from `src/theme.ts` via `<ThemeProvider>`
- **Props**: Define TypeScript interfaces for component props
- **Keys**: Use stable, unique keys for list items (not array indices)
- **Immutability**: Always create new objects/arrays when updating state

---
If any conventions or workflows are unclear, ask for clarification or check the README for more details.
