export type MessageHandler = (message: string) => void | Promise<void>;

export abstract class MessageBrokerService {
  abstract publish(topic: string, message: string): Promise<void>;
  abstract subscribe(topic: string, handler: MessageHandler): Promise<void>;
  abstract health(): Promise<string>;
}
