import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

// Event payloads
export class TreasuryCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly balance: number
  ) {}
}

export class TreasuryUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly changes: Partial<{
      name: string;
      balance: number;
    }>
  ) {}
}

export class TreasuryDeletedEvent {
  constructor(public readonly id: string) {}
}

export class TreasuryFundsTransferredEvent {
  constructor(
    public readonly fromTreasuryId: string,
    public readonly toTreasuryId: string,
    public readonly amount: number
  ) {}
}

/**
 * Helper service to emit events
 */
@Injectable()
export class TreasuryEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitCreated(event: TreasuryCreatedEvent): void {
    this.eventEmitter.emit('treasury.created', event);
  }

  emitUpdated(event: TreasuryUpdatedEvent): void {
    this.eventEmitter.emit('treasury.updated', event);
  }

  emitDeleted(event: TreasuryDeletedEvent): void {
    this.eventEmitter.emit('treasury.deleted', event);
  }
}
