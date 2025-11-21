import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import { Card, Deck, Player, Game } from './game';

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
            <strong>${player.name}</strong><br>
            Cards: ${player.handSize}<br>
            Score: ${player.getScore()}
          </div>
        `;
      });
      
      infoHTML += `<p>Cards remaining in deck: ${game.getDeck().size}</p>`;
      playerInfo.innerHTML = infoHTML;

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
