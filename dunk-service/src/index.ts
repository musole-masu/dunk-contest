import express, { Request, Response } from "express";
import { natsConnector } from "./nats-connector";
import { EventPublisher } from "./event-publisher";

const app = express();
app.use(express.json());

interface Players {
  NAME: string;
  HEIGHT: number;
  WEIGHT: number;
  EXPERIENCE: number;
}

let players: Players[] = [];

app.post("/dunk-contest/register", (req: Request, res: Response) => {
  const player: Players = {
    NAME: req.body.name,
    HEIGHT: req.body.height,
    WEIGHT: req.body.weight,
    EXPERIENCE: req.body.experience,
  };

  players.push(player);
  console.log("\x1b[36m%s\x1b[0m", "REGISTERED PLAYERS: ");
  console.table(players);
  res.send({});
});

app.post(
  "/dunk-contest/attempt/:playerName",
  async (req: Request, res: Response) => {
    const player = players.find(
      ({ NAME }) => NAME === req.params.playerName
    ) as Players;

    const dunkPoint: number =
      (player.HEIGHT * player.WEIGHT * player.EXPERIENCE * Math.random()) / 100;

    await new EventPublisher(natsConnector.client).publishEvent("Dunk-Shot", {
      PLAYER_NAME: player.NAME,
      DUNK_POINT: dunkPoint,
    });
    res.send({});
  }
);

const start = async () => {
  try {
    await natsConnector.connect(
      "dunk-contest",
      "123",
      "http://localhost:4222",
      "Dunk Service"
    );

    natsConnector.client.on("close", () => {
      process.exit();
    });
  } catch (error) {
    console.error(error);
  }
  app.listen(4001, () => {
    console.log("Dunk Service listening on 4001");
  });
};

start();
