import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';

/**
 * Game control buttons for blackjack (Hit, Stand, Double Down, etc.)
 */
export class GameControls {
  private element: HTMLElement;
  private hitButton!: HTMLElement;
  private standButton!: HTMLElement;
  private doubleButton!: HTMLElement;
  private newGameButton!: HTMLElement;
  private enabled: boolean = true;

  // Event callbacks
  public onHit?: () => void;
  public onStand?: () => void;
  public onDouble?: () => void;
  public onNewGame?: () => void;

  constructor() {
    this.element = this.createElement();
    this.attachEventListeners();
  }

  /**
   * Creates the controls container element
   */
  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'game-controls';

    // Action buttons group
    const actionGroup = document.createElement('div');
    actionGroup.className = 'control-group action-buttons';

    this.hitButton = document.createElement('md-filled-button');
    this.hitButton.textContent = 'Hit';
    this.hitButton.className = 'control-button hit-button';
    actionGroup.appendChild(this.hitButton);

    this.standButton = document.createElement('md-filled-button');
    this.standButton.textContent = 'Stand';
    this.standButton.className = 'control-button stand-button';
    actionGroup.appendChild(this.standButton);

    this.doubleButton = document.createElement('md-outlined-button');
    this.doubleButton.textContent = 'Double Down';
    this.doubleButton.className = 'control-button double-button';
    actionGroup.appendChild(this.doubleButton);

    container.appendChild(actionGroup);

    // Game management group
    const gameGroup = document.createElement('div');
    gameGroup.className = 'control-group game-buttons';

    this.newGameButton = document.createElement('md-text-button');
    this.newGameButton.textContent = 'New Game';
    this.newGameButton.className = 'control-button new-game-button';
    gameGroup.appendChild(this.newGameButton);

    container.appendChild(gameGroup);

    return container;
  }

  /**
   * Attaches event listeners to buttons
   */
  private attachEventListeners(): void {
    this.hitButton.addEventListener('click', () => {
      if (this.enabled && this.onHit) {
        this.onHit();
      }
    });

    this.standButton.addEventListener('click', () => {
      if (this.enabled && this.onStand) {
        this.onStand();
      }
    });

    this.doubleButton.addEventListener('click', () => {
      if (this.enabled && this.onDouble) {
        this.onDouble();
      }
    });

    this.newGameButton.addEventListener('click', () => {
      if (this.onNewGame) {
        this.onNewGame();
      }
    });
  }

  /**
   * Enables or disables the action buttons
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;

    if (enabled) {
      this.hitButton.removeAttribute('disabled');
      this.standButton.removeAttribute('disabled');
      this.doubleButton.removeAttribute('disabled');
    } else {
      this.hitButton.setAttribute('disabled', '');
      this.standButton.setAttribute('disabled', '');
      this.doubleButton.setAttribute('disabled', '');
    }
  }

  /**
   * Enables or disables the double down button specifically
   */
  setDoubleEnabled(enabled: boolean): void {
    if (enabled) {
      this.doubleButton.removeAttribute('disabled');
    } else {
      this.doubleButton.setAttribute('disabled', '');
    }
  }

  /**
   * Shows the action buttons (during play)
   */
  showActionButtons(): void {
    const actionGroup = this.element.querySelector('.action-buttons') as HTMLElement;
    if (actionGroup) {
      actionGroup.style.display = 'flex';
    }
  }

  /**
   * Hides the action buttons (game over)
   */
  hideActionButtons(): void {
    const actionGroup = this.element.querySelector('.action-buttons') as HTMLElement;
    if (actionGroup) {
      actionGroup.style.display = 'none';
    }
  }

  /**
   * Gets the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }
}
