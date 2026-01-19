/**
 * Represents a logged custom event
 */
export interface LoggedEvent {
  /** Unique identifier for the log entry */
  id: string;
  /** Timestamp when the event was logged */
  timestamp: Date;
  /** Type of the custom event (e.g., 'themechange', 'cardstylechange') */
  type: string;
  /** Additional event details */
  detail: unknown;
}

/**
 * EventLogger - Singleton class for logging all custom events dispatched by the application
 * 
 * This class captures and stores custom events such as theme changes and card style changes,
 * providing methods to retrieve, filter, and clear the event log.
 * 
 * @example
 * ```typescript
 * const logger = EventLogger.getInstance();
 * 
 * // Log an event manually
 * logger.logEvent('themechange', { theme: 'modern' });
 * 
 * // Get all logged events
 * const allEvents = logger.getEvents();
 * 
 * // Get events of a specific type
 * const themeEvents = logger.getEventsByType('themechange');
 * 
 * // Clear all logs
 * logger.clearLogs();
 * ```
 */
export class EventLogger {
  private static instance: EventLogger;
  private events: LoggedEvent[] = [];
  private maxLogSize = 1000; // Maximum number of events to keep in memory
  private eventListeners: Map<string, (event: CustomEvent) => void> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
    this.initializeEventListeners();
  }

  /**
   * Gets the singleton instance of EventLogger
   */
  static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger();
    }
    return EventLogger.instance;
  }

  /**
   * Initializes event listeners for known custom events
   * This automatically logs events when they're dispatched
   */
  private initializeEventListeners(): void {
    // Listen for theme change events
    const themeChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      this.logEvent('themechange', customEvent.detail);
    };
    window.addEventListener('themechange', themeChangeListener);
    this.eventListeners.set('themechange', themeChangeListener as (event: CustomEvent) => void);

    // Listen for card style change events
    const cardStyleChangeListener = (event: Event) => {
      const customEvent = event as CustomEvent;
      this.logEvent('cardstylechange', customEvent.detail);
    };
    window.addEventListener('cardstylechange', cardStyleChangeListener);
    this.eventListeners.set('cardstylechange', cardStyleChangeListener as (event: CustomEvent) => void);
  }

  /**
   * Logs a custom event
   * @param type - The type of the event
   * @param detail - Additional event details
   */
  logEvent(type: string, detail?: unknown): void {
    const loggedEvent: LoggedEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      detail: detail ?? null,
    };

    this.events.push(loggedEvent);

    // Maintain max log size by removing oldest events
    if (this.events.length > this.maxLogSize) {
      this.events.shift();
    }

    // Log to console in development mode
    if (import.meta.env.DEV) {
      console.log(`[EventLogger] ${type}:`, detail);
    }
  }

  /**
   * Gets all logged events
   * @returns Array of all logged events
   */
  getEvents(): LoggedEvent[] {
    return [...this.events]; // Return a copy to prevent external modifications
  }

  /**
   * Gets events filtered by type
   * @param type - The event type to filter by
   * @returns Array of events matching the specified type
   */
  getEventsByType(type: string): LoggedEvent[] {
    return this.events.filter(event => event.type === type);
  }

  /**
   * Gets events within a date range
   * @param startDate - Start date for the filter
   * @param endDate - End date for the filter
   * @returns Array of events within the specified date range
   */
  getEventsByDateRange(startDate: Date, endDate: Date): LoggedEvent[] {
    return this.events.filter(
      event => event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  /**
   * Gets the most recent events
   * @param count - Number of recent events to retrieve
   * @returns Array of the most recent events
   */
  getRecentEvents(count: number): LoggedEvent[] {
    return this.events.slice(-count);
  }

  /**
   * Clears all logged events
   */
  clearLogs(): void {
    this.events = [];
    if (import.meta.env.DEV) {
      console.log('[EventLogger] All logs cleared');
    }
  }

  /**
   * Gets the total number of logged events
   * @returns The count of logged events
   */
  getEventCount(): number {
    return this.events.length;
  }

  /**
   * Gets the count of events by type
   * @returns Object with event types as keys and counts as values
   */
  getEventCountByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.events.forEach(event => {
      counts[event.type] = (counts[event.type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Sets the maximum number of events to keep in memory
   * @param size - Maximum log size
   */
  setMaxLogSize(size: number): void {
    this.maxLogSize = size;
    // Trim existing logs if needed
    if (this.events.length > this.maxLogSize) {
      this.events = this.events.slice(-this.maxLogSize);
    }
  }

  /**
   * Gets the maximum log size
   */
  getMaxLogSize(): number {
    return this.maxLogSize;
  }

  /**
   * Generates a unique ID for a log entry
   * Uses crypto.randomUUID() when available, falls back to timestamp + random string
   */
  private generateId(): string {
    // Use crypto.randomUUID() if available (modern browsers and Node.js)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for older environments
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Cleanup method to remove event listeners
   * Call this when the logger is no longer needed
   */
  destroy(): void {
    this.eventListeners.forEach((listener, type) => {
      window.removeEventListener(type, listener as EventListener);
    });
    this.eventListeners.clear();
    this.events = [];
  }
}
