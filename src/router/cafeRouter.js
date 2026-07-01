import { Router } from "express";
import CafeController from "../controller/cafeController.js";

const cafeRoutes = Router();

cafeRoutes.get("/", CafeController.getCafes);
cafeRoutes.get("/:nama_cafe", CafeController.getDetailCafe);

export default cafeRoutes;
