import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./src/config/db.js";
import cafeRoutes from "./src/router/cafeRouter.js";
import rankRouter from "./src/router/rankRouter.js";
import errorHandler from "./src/middleware/error.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/cafes", cafeRoutes);
app.use("/api/rank", rankRouter);

app.use(errorHandler);

db.authenticate()
  .then(() => {
    console.log("Terhubung dengan database");
    app.listen(PORT, () => {
      console.log(`Server berjalan di ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("error nih", err.message);
  });
