import nats, { Stan } from "node-nats-streaming";

class NatsConnector {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS Client before connecting!");
    }
    return this._client;
  }

  connectToNats(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on("connect", () => {
        console.log(`DUNK SERVICE IS CONNECTED TO NATS STREAMING SERVER`);
        resolve();
      });
      this.client.on("error", (err) => {
        reject(err);
      });
    });
  }
}

export const natsConnector = new NatsConnector();
