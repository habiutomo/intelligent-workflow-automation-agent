import { EventEmitter } from "events";

export type EventCallback = (data: Record<string, unknown>) => void;

export class EventBus {
  private emitter: EventEmitter;
  private history: Array<{ event: string; data: Record<string, unknown>; timestamp: Date }> = [];
  private maxHistory: number;

  constructor(maxHistory: number = 1000) {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
    this.maxHistory = maxHistory;
  }

  on(event: string, callback: EventCallback): void {
    this.emitter.on(event, callback);
  }

  off(event: string, callback: EventCallback): void {
    this.emitter.off(event, callback);
  }

  emit(event: string, data: Record<string, unknown> = {}): void {
    const entry = { event, data, timestamp: new Date() };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.emitter.emit(event, data);
  }

  once(event: string, callback: EventCallback): void {
    this.emitter.once(event, callback);
  }

  getHistory(event?: string, limit: number = 50): typeof this.history {
    const filtered = event
      ? this.history.filter((h) => h.event === event)
      : this.history;
    return filtered.slice(-limit);
  }

  clearHistory(): void {
    this.history = [];
  }

  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }
}

export const globalEventBus = new EventBus();
