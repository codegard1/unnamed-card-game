import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/dialog/dialog.js';
import { Card, Deck, Player, Game } from './game';
import { CardComponent } from './components';
import { SettingsManager, CARD_THEMES, CardTheme } from './settings';

/**
 * Example implementation of a simple card game
 */
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
    if (!this.isGameOver()) {
      return null;
    }
    // Winner is the player with the most cards
    const maxCards = Math.max(...this.players.map(p => p.handSize));
    const winners = this.players.filter(p => p.handSize === maxCards);
    return winners.length === 1 ? winners[0] : winners;
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Unnamed Card Game - Initialized');
  
  // Initialize settings manager
  const settings = SettingsManager.getInstance();
  settings.initialize();
  
  // Set up settings dialog
  const settingsButton = document.getElementById('settings-button');
  const settingsDialog = document.getElementById('settings-dialog') as any;
  const themeOptionsContainer = document.getElementById('theme-options');
  
  if (settingsButton && settingsDialog && themeOptionsContainer) {
    // Populate theme options
    CARD_THEMES.forEach(theme => {
      const option = document.createElement('div');
      option.className = 'theme-option';
      if (theme.name === settings.getTheme()) {
        option.classList.add('selected');
      }
      
      option.innerHTML = `
        <div class="theme-info">
          <h4>${theme.displayName}</h4>
          <p>${theme.description}</p>
        </div>
      `;
      
      option.addEventListener('click', () => {
        // Update selection
        themeOptionsContainer.querySelectorAll('.theme-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        option.classList.add('selected');
        
        // Apply theme
        settings.setTheme(theme.name);
      });
      
      themeOptionsContainer.appendChild(option);
    });
    
    // Open settings dialog
    settingsButton.addEventListener('click', () => {
      settingsDialog.show();
    });
  }
  
  // Example: Create a simple game with two players
  const game = new SimpleCardGame(['Player 1', 'Player 2']);
  
  // Set up UI event listeners
  const startButton = document.getElementById('start-game');
  const gameStatus = document.getElementById('game-status');
  const playerInfo = document.getElementById('player-info');

  if (startButton && gameStatus && playerInfo) {
    startButton.addEventListener('click', () => {
      game.start();
      updateUI();
    });
  }

  function updateUI() {
    if (!gameStatus || !playerInfo) return;

    if (game.isActive()) {
      gameStatus.textContent = 'Game in progress...';
      
      let infoHTML = '<h3>Players:</h3>';
      game.getPlayers().forEach(player => {
        infoHTML += `
          <div class="player-card">
            <strong>${player.name}</strong>
            <div>Score: ${player.getScore()}</div>
            <div class="cards-container" id="player-${player.id}-cards"></div>
          </div>
        `;
      });
      
      infoHTML += `<p>Cards remaining in deck: ${game.getDeck().size}</p>`;
      playerInfo.innerHTML = infoHTML;

      // Render card components for each player
      game.getPlayers().forEach(player => {
        const cardsContainer = document.getElementById(`player-${player.id}-cards`);
        if (cardsContainer) {
          cardsContainer.innerHTML = ''; // Clear existing cards
          player.getHand().forEach(card => {
            const cardComponent = new CardComponent(card);
            cardsContainer.appendChild(cardComponent.getElement());
          });
        }
      });

      if (game.isGameOver()) {
        const winner = game.getWinner();
        if (winner) {
          if (Array.isArray(winner)) {
            gameStatus.textContent = `Tie between: ${winner.map(p => p.name).join(', ')}`;
          } else {
            gameStatus.textContent = `Winner: ${winner.name}!`;
          }
        }
        game.endGame();
      }
    }
  }
});
