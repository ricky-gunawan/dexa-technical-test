import { randomUUID } from 'node:crypto';
import { Injectable, Logger, MessageEvent, OnModuleInit } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { Observable, Subject } from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { MessageBrokerService } from '../message-broker/message-broker.service';

const channel = 'user.updated';

export interface UserUpdatedEvent {
  id: string;
  type: 'user.updated';
  userId: string;
  changes: Record<string, unknown>;
  createdAt: string;
}

@Injectable()
export class UserUpdateEventsService implements OnModuleInit {
  private readonly logger = new Logger(UserUpdateEventsService.name);
  private readonly updates = new Subject<MessageEvent>();

  constructor(
    private readonly database: DatabaseService,
    private readonly messageBroker: MessageBrokerService,
  ) {}

  async onModuleInit() {
    await this.messageBroker.subscribe(channel, (message) => this.consume(message));
  }

  publish(userId: string, changes: Record<string, unknown>) {
    const event: UserUpdatedEvent = {
      id: randomUUID(),
      type: 'user.updated',
      userId,
      changes,
      createdAt: new Date().toISOString(),
    };
    return this.messageBroker.publish(channel, JSON.stringify(event));
  }

  stream(): Observable<MessageEvent> {
    return this.updates.asObservable();
  }

  private async consume(message: string) {
    try {
      const event = JSON.parse(message) as UserUpdatedEvent;
      if (
        event.type !== channel ||
        !isUUID(event.id) ||
        !isUUID(event.userId) ||
        typeof event.changes !== 'object' ||
        event.changes === null ||
        Array.isArray(event.changes) ||
        Number.isNaN(Date.parse(event.createdAt))
      ) {
        throw new Error('Invalid user update event');
      }

      await this.database.query(
        `INSERT INTO log (id, user_id, changes, created_at)
         VALUES ($1, $2, $3::jsonb, $4) ON CONFLICT (id) DO NOTHING`,
        [event.id, event.userId, JSON.stringify(event.changes), event.createdAt],
      );
      this.updates.next({ type: event.type, data: event });
    } catch (error) {
      this.logger.error('Failed to consume user update event', error);
    }
  }
}
