import { Router } from "express";
import rankController from "../controller/rankController.js";

const rankRouter = Router();

rankRouter.post("/", rankController.rankCafes);
export default rankRouter;
