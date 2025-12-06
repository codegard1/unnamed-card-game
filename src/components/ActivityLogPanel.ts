import type { ActivityLogEntry } from '../settings/SettingsManager';

/**
 * Displays a scrollable activity log of game events
 */
export class ActivityLogPanel {
  private element: HTMLElement;
  private logContainer!: HTMLElement;
  private entries: ActivityLogEntry[] = [];
  private maxDisplayed: number = 100;
  private autoScroll: boolean = true;

  constructor() {
    this.element = this.createElement();
    this.setupActivityListener();
  }

  /**
   * Creates the activity log panel element
   */
  private createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'activity-log-panel';

    // Header with controls
    const header = document.createElement('div');
    header.className = 'activity-log-header';

    const title = document.createElement('h3');
    title.textContent = 'Activity Log';
    header.appendChild(title);

    const clearButton = document.createElement('button');
    clearButton.className = 'clear-log-button';
    clearButton.textContent = 'Clear';
    clearButton.addEventListener('click', () => this.clear());
    header.appendChild(clearButton);

    container.appendChild(header);

    // Log entries container
    this.logContainer = document.createElement('div');
    this.logContainer.className = 'activity-log-entries';
    container.appendChild(this.logContainer);

    return container;
  }

  /**
   * Sets up listener for real-time activity log events
   */
  private setupActivityListener(): void {
    window.addEventListener('activitylog', (event: Event) => {
      const customEvent = event as CustomEvent<ActivityLogEntry>;
      this.addEntry(customEvent.detail);
    });
  }

  /**
   * Adds an entry to the log
   */
  addEntry(entry: ActivityLogEntry): void {
    this.entries.push(entry);

    // Trim old entries
    if (this.entries.length > this.maxDisplayed) {
      this.entries = this.entries.slice(-this.maxDisplayed);
      this.render();
    } else {
      this.appendEntryElement(entry);
    }

    // Auto-scroll to bottom
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Appends a single entry element (for performance)
   */
  private appendEntryElement(entry: ActivityLogEntry): void {
    const entryEl = this.createEntryElement(entry);
    this.logContainer.appendChild(entryEl);
  }

  /**
   * Creates a DOM element for a log entry
   */
  private createEntryElement(entry: ActivityLogEntry): HTMLElement {
    const entryEl = document.createElement('div');
    entryEl.className = 'log-entry';

    const timestamp = document.createElement('span');
    timestamp.className = 'log-timestamp';
    timestamp.textContent = this.formatTimestamp(entry.timestamp);
    entryEl.appendChild(timestamp);

    const message = document.createElement('span');
    message.className = 'log-message';
    message.textContent = entry.message;
    entryEl.appendChild(message);

    if (entry.playerId) {
      entryEl.setAttribute('data-player-id', entry.playerId);
    }

    return entryEl;
  }

  /**
   * Formats a timestamp for display
   */
  private formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Renders all entries
   */
  private render(): void {
    this.logContainer.innerHTML = '';
    this.entries.forEach(entry => {
      this.appendEntryElement(entry);
    });
  }

  /**
   * Sets the log entries (e.g., from persistence)
   */
  setEntries(entries: ActivityLogEntry[]): void {
    this.entries = entries.slice(-this.maxDisplayed);
    this.render();
    this.scrollToBottom();
  }

  /**
   * Clears the log
   */
  clear(): void {
    this.entries = [];
    this.logContainer.innerHTML = '';
  }

  /**
   * Scrolls to the bottom of the log
   */
  scrollToBottom(): void {
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
  }

  /**
   * Sets whether auto-scroll is enabled
   */
  setAutoScroll(enabled: boolean): void {
    this.autoScroll = enabled;
  }

  /**
   * Sets the maximum number of displayed entries
   */
  setMaxDisplayed(max: number): void {
    this.maxDisplayed = max;
    if (this.entries.length > max) {
      this.entries = this.entries.slice(-max);
      this.render();
    }
  }

  /**
   * Shows or hides the panel
   */
  setVisible(visible: boolean): void {
    this.element.style.display = visible ? 'flex' : 'none';
  }

  /**
   * Gets the DOM element
   */
  getElement(): HTMLElement {
    return this.element;
  }
}
