import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { MessageBrokerService, MessageHandler } from './message-broker.service';

@Injectable()
export class RedisMessageBrokerService extends MessageBrokerService implements OnModuleInit, OnModuleDestroy {
  private readonly client: RedisClientType;
  private readonly subscriber: RedisClientType;

  constructor(config: ConfigService) {
    super();
    this.client = createClient({ url: config.get('REDIS_URL', 'redis://localhost:6379') });
    this.subscriber = this.client.duplicate();
  }

  async onModuleInit() {
    await Promise.all([this.client.connect(), this.subscriber.connect()]);
  }

  async publish(topic: string, message: string) {
    await this.client.publish(topic, message);
  }

  async subscribe(topic: string, handler: MessageHandler) {
    await this.subscriber.subscribe(topic, handler);
  }

  async health() {
    return (await this.client.ping()).toLowerCase();
  }

  async onModuleDestroy() {
    await Promise.all([this.client.close(), this.subscriber.close()]);
  }
}
