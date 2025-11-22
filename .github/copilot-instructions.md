## Copilot Instructions for AI Coding Agents

### Project Overview
- This is a TypeScript web app for card games, using Vite for build/dev and Material Web Components for UI.
- The core logic is in `src/game/` (Card, Deck, Player, Game base classes). UI components are in `src/components/`.
- Extend the `Game` abstract class in `src/game/Game.ts` to implement new card games.

### Key Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev` (serves at http://localhost:3000)
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`

### Architecture & Patterns
- All game logic is in `src/game/`. Each class (Card, Deck, Player, Game) is designed for extensibility.
- UI logic is separated into `src/components/` (e.g., `CardComponent.ts`).
- Use TypeScript types and interfaces throughout. Prefer composition and inheritance for new game logic.
- Exports for each module are managed via `index.ts` files in their respective folders.
- Material Web Components are used for UI consistency; follow their usage patterns for new UI features.

### Conventions
- Use ES2020+ and TypeScript 5.9+ features.
- Keep all new card game logic in `src/game/` and new UI in `src/components/`.
- Prefer functional, stateless components for UI unless state is required.
- Use the provided base classes for all new card/board game implementations.

### Key Files & Directories
- `src/game/`: Core game logic (Card, Deck, Player, Game)
- `src/components/`: UI components (e.g., CardComponent)
- `src/main.ts`: App entry point
- `vite.config.ts`, `tsconfig.json`: Build and TypeScript config
- `README.md`: More usage and extension examples

### Example: Extending the Game
```typescript
import { Game, Player } from './game';
class MyCardGame extends Game {
	protected dealInitialCards(): void { /* ... */ }
	playTurn(player: Player): void { /* ... */ }
	isGameOver(): boolean { /* ... */ }
	getWinner(): Player | Player[] | null { /* ... */ }
}
```

---
If any conventions or workflows are unclear, ask for clarification or check the README for more details.
