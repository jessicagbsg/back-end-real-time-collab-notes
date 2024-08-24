import { Router } from "express";
import { authenticationRouter } from "./auth.routes";
import { noteRouter } from "./note.routes";
import { authorized } from "../middlewares/auth.middleware";

const appRoutes = Router();

appRoutes.use("/auth", authenticationRouter);
appRoutes.use("/notes", authorized, noteRouter);

export { appRoutes };
