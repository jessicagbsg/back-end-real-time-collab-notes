import { Request, Response } from "express";
import { AuthenticationService } from "../services/auth.service";
import { UserRepository } from "../database/repositories/user.repository";

const userRepository = new UserRepository();
const authenticationService = new AuthenticationService({ userRepository });

export const authorized = async (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("Access token is required");
    const user = await authenticationService.getUserFromToken(token);
    if (!user) throw new Error("Invalid authentication credentials");
    req.body.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
