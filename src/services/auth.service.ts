import bcrypt from "bcrypt";
import { UserRepository } from "../database/repositories/user.repository";
import { createUserToken, decodeToken } from "../helpers/authentication/token";
import type {
  AuthenticatedUserResponse,
  CreateUserDTO,
  UserLoginDTO,
} from "../database/models/users";

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
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) throw new Error("User already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    data.password = hashedPassword;

    const createdUser = await this.userRepository.createUser(data);
    if (!createdUser) throw new Error("Something went wrong when trying to create user");

    const token = createUserToken(createdUser.id, {
      email: createdUser.email,
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      token,
    };
  }

  async login(data: UserLoginDTO) {
    const { email, password } = data;
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (!existingUser) throw new Error("User not found");

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) throw new Error("Invalid password");

    const token = createUserToken(existingUser.id, {
      email: existingUser.email,
    });

    return {
      id: existingUser.id,
      email: existingUser.email,
      token,
    };
  }

  async getUserFromToken(token: string) {
    const { id } = decodeToken(token);
    const user = await this.userRepository.findUserById(id);
    return {
      id: user.id,
      email: user.email,
    };
  }
}
