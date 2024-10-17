import { Router } from "express";
import { callSpinWheel, getLastTime, getTotalPoints } from "../controllers";

const spinRouter = Router();

spinRouter.get("/", callSpinWheel);
spinRouter.get("/lastSpin", getLastTime);
spinRouter.get("/totalPoints", getTotalPoints);

export { spinRouter };
