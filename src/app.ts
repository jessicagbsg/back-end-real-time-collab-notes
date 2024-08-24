import express from "express";
import { appRoutes } from "./routes";
import setupMiddlewares from "./middlewares/middlewares";

const app = express();
setupMiddlewares(app);

app.use("/api", appRoutes);

export { app };
