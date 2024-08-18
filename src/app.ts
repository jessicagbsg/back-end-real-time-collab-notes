import express, { Router } from "express";
import { appRoutes } from "./routes";
import setupMiddlewares from "./config/middlewares";

const app = express();
setupMiddlewares(app);

app.use(appRoutes);

export { app };
