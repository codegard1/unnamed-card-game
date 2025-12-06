import '@material/web/checkbox/checkbox.js';
import '@material/web/button/filled-button.js';

/**
 * Player selection component for choosing active players
 */
export class PlayerSelector {
  private element: HTMLElement;
  private playerListEl!: HTMLElement;
  private startButton!: HTMLElement;
  private players: Map<string, { name: string; isNPC: boolean; selected: boolean }> = new Map();

  // Event callbacks
  public onStartGame?: (selectedPlayerIds: string[]) => void;
  public onAddPlayer?: (name: string) => void;

  constructor() {
    this.element = this.createElement();
    this.attachEventListeners();
  }

  /**
   * Creates the selector element
   */
  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'player-selector';

    // Header
    const header = document.createElement('h2');
    header.className = 'selector-header';
    header.textContent = 'Select Players';
    container.appendChild(header);

    // Player list
    this.playerListEl = document.createElement('div');
    this.playerListEl.className = 'player-list';
    container.appendChild(this.playerListEl);

    // Add player section
    const addPlayerSection = document.createElement('div');
    addPlayerSection.className = 'add-player-section';

    const addInput = document.createElement('md-outlined-text-field');
    addInput.setAttribute('label', 'New Player Name');
    addInput.setAttribute('placeholder', 'Enter name...');
    addInput.className = 'add-player-input';
    addPlayerSection.appendChild(addInput);

    const addButton = document.createElement('md-text-button');
    addButton.textContent = 'Add Player';
    addButton.className = 'add-player-button';
    addButton.addEventListener('click', () => {
      const input = addInput as any;
      const name = input.value?.trim();
      if (name && this.onAddPlayer) {
        this.onAddPlayer(name);
        input.value = '';
      }
    });
    addPlayerSection.appendChild(addButton);

    container.appendChild(addPlayerSection);

    // Start button
    this.startButton = document.createElement('md-filled-button');
    this.startButton.textContent = 'Start Game';
    this.startButton.className = 'start-game-button';
    container.appendChild(this.startButton);

    return container;
  }

  /**
   * Attaches event listeners
   */
  private attachEventListeners(): void {
    this.startButton.addEventListener('click', () => {
      const selected = this.getSelectedPlayerIds();
      if (selected.length >= 1 && this.onStartGame) {
        this.onStartGame(selected);
      }
    });
  }

  /**
   * Sets the available players
   */
  setPlayers(players: Array<{ id: string; name: string; isNPC: boolean }>): void {
    this.players.clear();
    players.forEach(p => {
      this.players.set(p.id, {
        name: p.name,
        isNPC: p.isNPC,
        selected: !p.isNPC || p.id === 'dealer', // Select humans and dealer by default
      });
    });
    this.renderPlayerList();
  }

  /**
   * Adds a player to the list
   */
  addPlayer(id: string, name: string, isNPC: boolean = false): void {
    this.players.set(id, { name, isNPC, selected: true });
    this.renderPlayerList();
  }

  /**
   * Renders the player list
   */
  private renderPlayerList(): void {
    this.playerListEl.innerHTML = '';

    this.players.forEach((player, id) => {
      const item = document.createElement('div');
      item.className = 'player-item';
      if (player.isNPC) {
        item.classList.add('npc');
      }

      const checkbox = document.createElement('md-checkbox');
      checkbox.id = `player-${id}`;
      if (player.selected) {
        checkbox.setAttribute('checked', '');
      }
      // Dealer is always required
      if (id === 'dealer') {
        checkbox.setAttribute('disabled', '');
        checkbox.setAttribute('checked', '');
      }
      checkbox.addEventListener('change', () => {
        const isChecked = checkbox.hasAttribute('checked');
        const playerData = this.players.get(id);
        if (playerData) {
          playerData.selected = isChecked;
        }
        this.updateStartButton();
      });
      item.appendChild(checkbox);

      const label = document.createElement('label');
      label.setAttribute('for', `player-${id}`);
      label.textContent = player.name;
      if (player.isNPC) {
        label.textContent += ' (NPC)';
      }
      item.appendChild(label);

      this.playerListEl.appendChild(item);
    });

    this.updateStartButton();
  }

  /**
   * Updates the start button state
   */
  private updateStartButton(): void {
    const selected = this.getSelectedPlayerIds();
    // Need at least one human player and the dealer
    const hasHuman = selected.some(id => {
      const p = this.players.get(id);
      return p && !p.isNPC;
    });
    const hasDealer = selected.includes('dealer');

    if (hasHuman && hasDealer) {
      this.startButton.removeAttribute('disabled');
    } else {
      this.startButton.setAttribute('disabled', '');
    }
  }

  /**
   * Gets the selected player IDs
   */
  getSelectedPlayerIds(): string[] {
    const selected: string[] = [];
    this.players.forEach((player, id) => {
      if (player.selected) {
        selected.push(id);
      }
    });
    return selected;
  }

  /**
   * Shows or hides the selector
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
