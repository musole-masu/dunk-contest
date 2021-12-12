import nats, { Stan } from "node-nats-streaming";

class NatsConnector {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS Client before connecting!");
    }
    return this._client;
  }

  connect(
    clusterId: string,
    clientId: string,
    url: string,
    applicationName: string
  ) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on("connect", () => {
        console.log(`${applicationName} is connected to NATS Streaming Server`);
        resolve();
      });
      this.client.on("error", (err) => {
        reject(err);
      });
    });
  }
}

export const natsConnector = new NatsConnector();
