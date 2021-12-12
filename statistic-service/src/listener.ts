import { Message } from "node-nats-streaming";
import { natsConnector } from "./nats-connector";

interface DunkShotData {
  PLAYER_NAME: string;
  DUNK_POINT: number;
}
let dunkShot: DunkShotData[] = [];

const parseMessage = (msg: Message) => {
  const data = msg.getData();
  return typeof data === "string"
    ? JSON.parse(data)
    : JSON.parse(data.toString("utf-8"));
};

const start = async () => {
  try {
    await natsConnector.connect(
      "dunk-contest",
      "321",
      "http://localhost:4222",
      "Statistic Service"
    );

    natsConnector.client.on("close", () => {
      process.exit();
    });

    const options = natsConnector.client
      .subscriptionOptions()
      .setStartWithLastReceived()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setDurableName("Dunk-Shot-Group");

    const subscription = natsConnector.client.subscribe(
      "Dunk-Shot",
      "Dunk-Shot-Queue-Group",
      options
    );

    subscription.on("message", (msg: Message) => {
      console.log("Message received : Dunk-Shot");
      const parsedData = parseMessage(msg);
      console.log("Event Received with the data below :");
      console.table(parsedData);
      dunkShot.push(parsedData);

      console.log(JSON.stringify(dunkShot));
      msg.ack();
    });
  } catch (error) {
    console.error(error);
  }
};

start();
