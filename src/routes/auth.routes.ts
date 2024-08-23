import { Router } from "express";
import { AuthenticationController } from "../controllers/auth.controller";
import { AuthenticationService } from "../services/auth.service";
import { UserRepository } from "../database/repositories/user.repository";

const userRepository = new UserRepository();
const authenticationService = new AuthenticationService({ userRepository });
const authenticationController = new AuthenticationController({ authenticationService });

const authenticationRouter = Router();

authenticationRouter.post("/register", authenticationController.register);
authenticationRouter.post("/login", authenticationController.login);
authenticationRouter.get("/", authenticationController.validateUser);

export { authenticationRouter };
