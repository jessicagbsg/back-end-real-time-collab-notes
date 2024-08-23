import { Request, Response } from "express";
import { IAuthenticationService } from "../services/auth.service";

import type { CreateUserDTO, UserLoginDTO } from "../database/models/users";

type AuthenticationControllerDependencies = {
  authenticationService: IAuthenticationService;
};

export interface IAuthenticationController {
  register(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  validateUser(req: Request, res: Response): Promise<void>;
}

export class AuthenticationController implements IAuthenticationController {
  private readonly authenticationService: IAuthenticationService;

  constructor({ authenticationService }: AuthenticationControllerDependencies) {
    this.authenticationService = authenticationService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.validateUser = this.validateUser.bind(this);
  }

  async register(req: Request, res: Response) {
    try {
      const data: CreateUserDTO = req.body;
      if (!this.isEmailValid(data.email)) throw new Error("Invalid email");
      const createdUser = await this.authenticationService.register(data);
      res.status(201).json(createdUser);
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: UserLoginDTO = req.body;
      const login = await this.authenticationService.login(data);
      res.status(200).json(login);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async validateUser(req: Request, res: Response) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const user = await this.authenticationService.getUserFromToken(token);
      res.status(200).json(user);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  private isEmailValid(email?: string): boolean {
    if (typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
