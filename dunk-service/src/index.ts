import express from "express";
import { registerPlayerRouter } from "./routes/registerPlayerRoutes";
import { attemptDunkRouter } from "./routes/attemptDunkRoutes";
import { natsConnector } from "./nats-connector";

const app = express();
app.use(express.json());

app.use(registerPlayerRouter);
app.use(attemptDunkRouter);

const start = async () => {
  try {
    await natsConnector.connectToNats(
      "dunk-contest",
      "123",
      "http://nats-service:4222"
    );

    natsConnector.client.on("close", () => {
      process.exit();
    });
  } catch (error) {
    console.error(error);
  }
  app.listen(4001, () => {
    console.log("\x1b[36m%s\x1b[0m", "DUNK SERVICE LISTENING ON 4001");
  });
};

start();
