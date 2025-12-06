import '@material/web/textfield/outlined-text-field.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/text-button.js';

/**
 * Betting panel for placing bets in blackjack
 */
export class BettingPanel {
  private element: HTMLElement;
  private betInput!: HTMLInputElement;
  private currentBetDisplay!: HTMLElement;
  private bankDisplay!: HTMLElement;
  private potDisplay!: HTMLElement;
  private betButton!: HTMLElement;
  private quickBetButtons: HTMLElement[] = [];

  // Event callback
  public onBet?: (amount: number) => void;

  private minimumBet: number = 10;
  private currentBank: number = 1000;

  constructor() {
    this.element = this.createElement();
    this.attachEventListeners();
  }

  /**
   * Creates the betting panel element
   */
  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'betting-panel';

    // Stats display
    const statsRow = document.createElement('div');
    statsRow.className = 'betting-stats';

    this.bankDisplay = document.createElement('div');
    this.bankDisplay.className = 'stat bank-display';
    this.bankDisplay.innerHTML = '<span class="stat-label">Bank:</span> <span class="stat-value">$1000</span>';
    statsRow.appendChild(this.bankDisplay);

    this.potDisplay = document.createElement('div');
    this.potDisplay.className = 'stat pot-display';
    this.potDisplay.innerHTML = '<span class="stat-label">Pot:</span> <span class="stat-value">$0</span>';
    statsRow.appendChild(this.potDisplay);

    this.currentBetDisplay = document.createElement('div');
    this.currentBetDisplay.className = 'stat current-bet-display';
    this.currentBetDisplay.innerHTML = '<span class="stat-label">Your Bet:</span> <span class="stat-value">$0</span>';
    statsRow.appendChild(this.currentBetDisplay);

    container.appendChild(statsRow);

    // Bet input row
    const inputRow = document.createElement('div');
    inputRow.className = 'betting-input-row';

    const textField = document.createElement('md-outlined-text-field');
    textField.setAttribute('label', 'Bet Amount');
    textField.setAttribute('type', 'number');
    textField.setAttribute('min', String(this.minimumBet));
    textField.setAttribute('value', String(this.minimumBet));
    textField.className = 'bet-input';
    this.betInput = textField as unknown as HTMLInputElement;
    inputRow.appendChild(textField);

    this.betButton = document.createElement('md-filled-button');
    this.betButton.textContent = 'Place Bet';
    this.betButton.className = 'bet-button';
    inputRow.appendChild(this.betButton);

    container.appendChild(inputRow);

    // Quick bet buttons
    const quickBetRow = document.createElement('div');
    quickBetRow.className = 'quick-bet-row';

    const quickBetAmounts = [10, 25, 50, 100];
    quickBetAmounts.forEach(amount => {
      const btn = document.createElement('md-text-button');
      btn.textContent = `$${amount}`;
      btn.className = 'quick-bet-button';
      btn.setAttribute('data-amount', String(amount));
      this.quickBetButtons.push(btn);
      quickBetRow.appendChild(btn);
    });

    // All-in button
    const allInBtn = document.createElement('md-text-button');
    allInBtn.textContent = 'All In';
    allInBtn.className = 'quick-bet-button all-in';
    allInBtn.setAttribute('data-amount', 'all');
    this.quickBetButtons.push(allInBtn);
    quickBetRow.appendChild(allInBtn);

    container.appendChild(quickBetRow);

    return container;
  }

  /**
   * Attaches event listeners
   */
  private attachEventListeners(): void {
    this.betButton.addEventListener('click', () => {
      this.placeBet();
    });

    this.quickBetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = btn.getAttribute('data-amount');
        if (amount === 'all') {
          this.setBetAmount(this.currentBank);
        } else {
          this.setBetAmount(parseInt(amount!, 10));
        }
        this.placeBet();
      });
    });
  }

  /**
   * Places the current bet
   */
  private placeBet(): void {
    const amount = this.getBetAmount();
    if (amount >= this.minimumBet && amount <= this.currentBank && this.onBet) {
      this.onBet(amount);
    }
  }

  /**
   * Gets the current bet amount from input
   */
  getBetAmount(): number {
    // Material Web text field stores value differently
    const value = (this.betInput as any).value || this.betInput.getAttribute('value');
    return parseInt(value, 10) || this.minimumBet;
  }

  /**
   * Sets the bet amount in the input
   */
  setBetAmount(amount: number): void {
    const clampedAmount = Math.min(Math.max(amount, this.minimumBet), this.currentBank);
    (this.betInput as any).value = String(clampedAmount);
    this.betInput.setAttribute('value', String(clampedAmount));
  }

  /**
   * Updates the bank display
   */
  setBank(amount: number): void {
    this.currentBank = amount;
    const valueEl = this.bankDisplay.querySelector('.stat-value');
    if (valueEl) {
      valueEl.textContent = `$${amount}`;
    }
    // Update max bet
    this.betInput.setAttribute('max', String(amount));
  }

  /**
   * Updates the pot display
   */
  setPot(amount: number): void {
    const valueEl = this.potDisplay.querySelector('.stat-value');
    if (valueEl) {
      valueEl.textContent = `$${amount}`;
    }
  }

  /**
   * Updates the current bet display
   */
  setCurrentBet(amount: number): void {
    const valueEl = this.currentBetDisplay.querySelector('.stat-value');
    if (valueEl) {
      valueEl.textContent = `$${amount}`;
    }
  }

  /**
   * Sets the minimum bet
   */
  setMinimumBet(amount: number): void {
    this.minimumBet = amount;
    this.betInput.setAttribute('min', String(amount));
    if (this.getBetAmount() < amount) {
      this.setBetAmount(amount);
    }
  }

  /**
   * Enables or disables betting
   */
  setEnabled(enabled: boolean): void {
    if (enabled) {
      this.betButton.removeAttribute('disabled');
      this.betInput.removeAttribute('disabled');
      this.quickBetButtons.forEach(btn => btn.removeAttribute('disabled'));
    } else {
      this.betButton.setAttribute('disabled', '');
      this.betInput.setAttribute('disabled', '');
      this.quickBetButtons.forEach(btn => btn.setAttribute('disabled', ''));
    }
  }

  /**
   * Shows or hides the panel
   */
  setVisible(visible: boolean): void {
    this.element.style.display = visible ? 'block' : 'none';
  }

  /**
   * Gets the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }
}
