import { Router, Request, Response } from "express";
import { MongoClient } from "mongodb";

interface Players {
  NAME: string;
  HEIGHT: number;
  WEIGHT: number;
  EXPERIENCE: number;
}

const registerPlayerRouter = Router();
registerPlayerRouter.post(
  "/dunk-contest/register",
  async (req: Request, res: Response) => {
    const player: Players = {
      NAME: req.body.name,
      HEIGHT: req.body.height,
      WEIGHT: req.body.weight,
      EXPERIENCE: req.body.experience,
    };

    const mongoClient = await MongoClient.connect(
      "mongodb://dunk-mongo-service:27017/dunk-service"
    );

    const db = mongoClient.db();
    const playerCollection = db.collection("players");
    await playerCollection.insertOne(player);

    console.log("\x1b[36m%s\x1b[0m", "PLAYER REGISTERED WITH SUCCESS");
    const newPlayer = await playerCollection.findOne({
      NAME: req.body.name,
    });
    console.table(newPlayer);
    res.send({});

    mongoClient.close();
  }
);

export { registerPlayerRouter };
