import { Router } from "express";
import { authenticationRouter } from "./auth.routes";
import { noteRouter } from "./note.routes";

const appRoutes = Router();

appRoutes.use("/auth", authenticationRouter);
appRoutes.use("/notes", noteRouter);

export { appRoutes };
