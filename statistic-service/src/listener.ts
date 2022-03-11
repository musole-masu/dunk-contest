import nats, { Message } from "node-nats-streaming";
import { MongoClient } from "mongodb";

const start = async () => {
  const stan = nats.connect("dunk-contest", "321", {
    url: "http://nats-service:4222",
  });

  stan.on("connect", () => {
    console.log(
      "STATISTIC SERVICE IS CONNECTED TO NATS STREAMING SERVER \nWAITING FOR EVENTS ..."
    );

    stan.on("close", () => {
      console.log("Nats connection closed!");
      process.exit();
    });

    const options = stan
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setDurableName("Dunk-Shot-Queue-Group");

    const subscription = stan.subscribe(
      "Dunk-Shot",
      "Dunk-Shot-Queue-Group",
      options
    );

    subscription.on("message", async (msg: Message) => {
      const parsedData = JSON.parse(msg.getData().toString("utf-8"));
      console.log("EVENT RECEIVED WITH THE DATA BELOW :");
      console.table(parsedData);

      const mongoClient = await MongoClient.connect(
        "mongodb://stats-mongo-service:27017/statistic-service"
      );

      const db = mongoClient.db();
      const dunkCollection = db.collection("dunks");
      await dunkCollection.insertOne(parsedData);

      const dunkStatistic = await dunkCollection
        .aggregate([
          {
            $group: {
              _id: "$PLAYER_NAME",
              TOTAL_DUNK: { $count: {} },
              TOTAL_POINT: { $sum: "$DUNK_POINT" },
            },
          },
          { $sort: { TOTAL_POINT: -1 } },
        ])
        .toArray();

      console.log("\x1b[36m%s\x1b[0m", "DUNK CONTEST STATISTIC :");
      console.table(dunkStatistic);
      mongoClient.close();

      msg.ack();
    });
  });
};

start();
