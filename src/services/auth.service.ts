import bcrypt from "bcrypt";
import { UserRepository } from "../database/repositories/user.repository";
import { createUserToken, decodeToken } from "../helpers/authentication/token";
import {
  CreateUserSchema,
  type AuthenticatedUserResponse,
  type CreateUserDTO,
  type UserLoginDTO,
} from "../database/models/users";
import { z, ZodError } from "zod";

type AuthenticationServiceDependencies = {
  userRepository: UserRepository;
};

export interface IAuthenticationService {
  register(data: CreateUserDTO): Promise<AuthenticatedUserResponse>;
  login(data: UserLoginDTO): Promise<AuthenticatedUserResponse>;
  getUserFromToken(token: string): Promise<Omit<AuthenticatedUserResponse, "token">>;
}

export class AuthenticationService implements IAuthenticationService {
  private readonly userRepository: UserRepository;

  constructor({ userRepository }: AuthenticationServiceDependencies) {
    this.userRepository = userRepository;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register(data: CreateUserDTO) {
    const { email, password } = data;
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) throw new Error("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    data.password = hashedPassword;

    await this.validateUser(data);

    const createdUser = await this.userRepository.createUser(data);
    if (!createdUser) throw new Error("Something went wrong when trying to create user");

    const token = createUserToken(createdUser.id, {
      email: createdUser.email,
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      token,
    };
  }

  async login(data: UserLoginDTO) {
    const { email, password } = data;
    const existingUser = await this.userRepository.findByEmail(email);
    if (!existingUser) throw new Error("User not found");

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) throw new Error("Invalid password");

    const token = createUserToken(existingUser.id, {
      email: existingUser.email,
    });

    return {
      id: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      token,
    };
  }

  async getUserFromToken(token: string) {
    if (!token || this.invalidToken(token)) return;
    const { id } = decodeToken(token);
    if (!id) throw new Error("Invalid token");
    const user = await this.userRepository.findById(id);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  private invalidToken(token: string) {
    try {
      decodeToken(token);
      return false;
    } catch (error) {
      return true;
    }
  }

  private async validateUser(data: CreateUserDTO) {
    try {
      CreateUserSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Invalid data: ${error.message}`);
      }
      throw new Error("Invalid data");
    }
  }
}
