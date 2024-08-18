import { Router } from "express";
import { authenticationRouter } from "./auth.routes";
const appRoutes = Router();

appRoutes.use("/auth", authenticationRouter);

export { appRoutes };
