import { Stan } from "node-nats-streaming";

interface Event {
  subject: string;
  data: any;
}

export class EventPublisher<T extends Event> {
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publishEvent(subject: T["subject"], data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log(`Event ${subject} published!`);
        resolve();
      });
    });
  }
}
