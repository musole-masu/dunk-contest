import { Router, Request, Response } from "express";
import { MongoClient } from "mongodb";
import { natsConnector } from "./../nats-connector";
import { EventPublisher } from "./../event-publisher";

const attemptDunkRouter = Router();
attemptDunkRouter.post(
  "/dunk-contest/attempt/:playerName",
  async (req: Request, res: Response) => {
    const mongoClient = await MongoClient.connect(
      "mongodb://dunk-mongo-service:27017/dunk-service"
    );

    const db = mongoClient.db();
    const playerCollection = db.collection("players");

    const playerFound = await playerCollection.findOne({
      NAME: req.params.playerName,
    });

    const dunkPoint: number =
      (playerFound?.HEIGHT *
        playerFound?.WEIGHT *
        playerFound?.EXPERIENCE *
        Math.random()) /
      100;

    await new EventPublisher(natsConnector.client).publishEvent("Dunk-Shot", {
      PLAYER_NAME: playerFound?.NAME,
      DUNK_POINT: dunkPoint,
    });
    res.send({});

    mongoClient.close();
  }
);

export { attemptDunkRouter };
