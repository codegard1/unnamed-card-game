import { Card } from '../game';
import { CardComponent } from './CardComponent';

/**
 * Displays a player's hand of cards
 */
export class PlayerHand {
  private element: HTMLElement;
  private cardsContainer: HTMLElement;
  private valueDisplay: HTMLElement;
  private cards: CardComponent[] = [];
  private showValue: boolean = true;
  private hideFirstCard: boolean = false;

  constructor(
    private playerId: string,
    private playerName: string
  ) {
    this.element = this.createElement();
    this.cardsContainer = this.element.querySelector('.hand-cards')!;
    this.valueDisplay = this.element.querySelector('.hand-value')!;
  }

  /**
   * Creates the hand container element
   */
  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'player-hand';
    container.setAttribute('data-player-id', this.playerId);

    const header = document.createElement('div');
    header.className = 'hand-header';

    const nameEl = document.createElement('span');
    nameEl.className = 'player-name';
    nameEl.textContent = this.playerName;
    header.appendChild(nameEl);

    const valueEl = document.createElement('span');
    valueEl.className = 'hand-value';
    header.appendChild(valueEl);

    container.appendChild(header);

    const cardsEl = document.createElement('div');
    cardsEl.className = 'hand-cards';
    container.appendChild(cardsEl);

    return container;
  }

  /**
   * Sets the cards in the hand
   */
  setCards(cards: Card[]): void {
    this.cards = [];
    this.cardsContainer.innerHTML = '';

    cards.forEach((card, index) => {
      const shouldHide = this.hideFirstCard && index === 0;
      const cardComponent = new CardComponent(card);
      const cardEl = cardComponent.getElement();

      if (shouldHide) {
        cardEl.classList.add('face-down');
        cardEl.setAttribute('data-hidden', 'true');
      }

      this.cards.push(cardComponent);
      this.cardsContainer.appendChild(cardEl);
    });
  }

  /**
   * Adds a card to the hand with animation
   */
  addCard(card: Card): void {
    const cardComponent = new CardComponent(card);
    const cardEl = cardComponent.getElement();

    // Add animation class
    cardEl.classList.add('card-dealt');

    this.cards.push(cardComponent);
    this.cardsContainer.appendChild(cardEl);

    // Remove animation class after animation completes
    setTimeout(() => cardEl.classList.remove('card-dealt'), 300);
  }

  /**
   * Updates the displayed hand value
   */
  setValue(value: number | string): void {
    if (this.showValue) {
      this.valueDisplay.textContent = String(value);
    } else {
      this.valueDisplay.textContent = '';
    }
  }

  /**
   * Shows or hides the hand value
   */
  setShowValue(show: boolean): void {
    this.showValue = show;
    if (!show) {
      this.valueDisplay.textContent = '';
    }
  }

  /**
   * Sets whether the first card should be hidden (dealer's hole card)
   */
  setHideFirstCard(hide: boolean): void {
    this.hideFirstCard = hide;

    // Update first card's visibility
    const firstCard = this.cardsContainer.querySelector('.playing-card');
    if (firstCard) {
      if (hide) {
        firstCard.classList.add('face-down');
        firstCard.setAttribute('data-hidden', 'true');
      } else {
        firstCard.classList.remove('face-down');
        firstCard.removeAttribute('data-hidden');
      }
    }
  }

  /**
   * Reveals all hidden cards
   */
  revealAll(): void {
    this.cardsContainer.querySelectorAll('.playing-card.face-down').forEach(card => {
      card.classList.remove('face-down');
      card.removeAttribute('data-hidden');
    });
  }

  /**
   * Clears all cards from the hand
   */
  clear(): void {
    this.cards = [];
    this.cardsContainer.innerHTML = '';
    this.valueDisplay.textContent = '';
  }

  /**
   * Highlights the hand (active player indicator)
   */
  setActive(active: boolean): void {
    if (active) {
      this.element.classList.add('active');
    } else {
      this.element.classList.remove('active');
    }
  }

  /**
   * Sets a status class (busted, winner, etc.)
   */
  setStatus(status: string): void {
    // Remove existing status classes
    this.element.classList.remove('status-ok', 'status-busted', 'status-winner', 'status-loser', 'status-blackjack');

    if (status) {
      this.element.classList.add(`status-${status}`);
    }
  }

  /**
   * Gets the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Updates the player name
   */
  setPlayerName(name: string): void {
    this.playerName = name;
    const nameEl = this.element.querySelector('.player-name');
    if (nameEl) {
      nameEl.textContent = name;
    }
  }
}
