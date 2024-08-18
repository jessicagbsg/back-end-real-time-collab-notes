import { Request, Response } from "express";
import { IAuthenticationService } from "../services/auth.service";

import type { CreateUserDTO } from "../database/models/users";

type AuthenticationControllerDependencies = {
  authenticationService: IAuthenticationService;
};

export interface IAuthenticationController {
  register(req: Request, res: Response): Promise<void>;
  login(data: any): Promise<any>;
}

export class AuthenticationController implements IAuthenticationController {
  private readonly authenticationService: IAuthenticationService;

  constructor({ authenticationService }: AuthenticationControllerDependencies) {
    this.authenticationService = authenticationService;
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register(req: Request, res: Response) {
    const data: CreateUserDTO = req.body;
    if (!this.isEmailValid(data.email)) throw new Error("Invalid email");
    const createdUser = await this.authenticationService.register(data);
    if (!createdUser) throw new Error("Something went wrong when trying to create user");
    res.status(201).json(createdUser);
  }

  async login(data: any) {
    return await this.authenticationService.login(data);
  }

  private isEmailValid(email?: string): boolean {
    if (typeof email !== "string") return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
