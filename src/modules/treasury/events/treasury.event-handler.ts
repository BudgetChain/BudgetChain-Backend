import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import {
  TreasuryCreatedEvent,
  TreasuryUpdatedEvent,
  TreasuryDeletedEvent,
} from './treasury.events';

@Injectable()
export class TreasuryEventHandler {
  @OnEvent('treasury.created')
  handleCreatedEvent(payload: TreasuryCreatedEvent) {
    console.log('Treasury Created:', payload.id, payload.name);
    // Trigger sync, notification, analytics
  }

  @OnEvent('treasury.updated')
  handleUpdatedEvent(payload: TreasuryUpdatedEvent) {
    console.log('Treasury Updated:', payload.id, payload.changes);
    // Log changes or notify stakeholders
  }

  @OnEvent('treasury.deleted')
  handleDeletedEvent(payload: TreasuryDeletedEvent) {
    console.log('Treasury Deleted:', payload.id);
    // Clean up resources or log deletion
  }
}
