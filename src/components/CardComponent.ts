import { Card, Suit } from '../game';

/**
 * Visual component for displaying a playing card
 * Creates a DOM element with card styling
 */
export class CardComponent {
  private element: HTMLElement;

  constructor(private card: Card) {
    this.element = this.createCardElement();
  }

  /**
   * Creates the card DOM element with styling
   */
  private createCardElement(): HTMLElement {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'playing-card';
    
    // Add suit-specific class for coloring
    const suitClass = this.getSuitClass();
    cardDiv.classList.add(suitClass);
    
    // Add data attribute for theming
    cardDiv.setAttribute('data-suit', this.card.suit);
    cardDiv.setAttribute('data-rank', this.card.rank);
    
    // Create card content
    const rankTop = document.createElement('div');
    rankTop.className = 'card-rank top';
    rankTop.textContent = this.card.rank;
    
    const suitSymbol = document.createElement('div');
    suitSymbol.className = 'card-suit';
    suitSymbol.textContent = this.getSuitSymbol();
    
    const rankBottom = document.createElement('div');
    rankBottom.className = 'card-rank bottom';
    rankBottom.textContent = this.card.rank;
    
    cardDiv.appendChild(rankTop);
    cardDiv.appendChild(suitSymbol);
    cardDiv.appendChild(rankBottom);
    
    return cardDiv;
  }

  /**
   * Returns the suit-specific CSS class
   */
  private getSuitClass(): string {
    switch (this.card.suit) {
      case Suit.HEARTS:
        return 'suit-hearts';
      case Suit.DIAMONDS:
        return 'suit-diamonds';
      case Suit.CLUBS:
        return 'suit-clubs';
      case Suit.SPADES:
        return 'suit-spades';
      default:
        return 'suit-unknown';
    }
  }

  /**
   * Returns the Unicode symbol for the card's suit
   */
  private getSuitSymbol(): string {
    switch (this.card.suit) {
      case Suit.HEARTS:
        return '♥';
      case Suit.DIAMONDS:
        return '♦';
      case Suit.CLUBS:
        return '♣';
      case Suit.SPADES:
        return '♠';
      default:
        return '?';
    }
  }

  /**
   * Returns the DOM element for this card
   */
  getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Returns the card data
   */
  getCard(): Card {
    return this.card;
  }
}
