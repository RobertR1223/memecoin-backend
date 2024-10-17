import "dotenv/config";
import express, { Request, Response } from "express";
import { spinRouter } from "./routes";
import cors from "cors";
import SnowflakeConnectionManager from "./lib/snowflake";

const app = express();
const port = 5000;
export const db = new SnowflakeConnectionManager();

app.set("trust proxy", 1); // Trust first proxy
app.use(
  cors({
    origin: ["http://localhost:3000", "https://getluckydog.ai"], // Allow only your frontend URL
    methods: ["GET", "HEAD", "POST"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/spin", spinRouter);
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ data: "Server is running" });
});
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({ data: "$LUCKY meme coin backend" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
