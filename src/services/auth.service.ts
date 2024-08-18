import bcrypt from "bcrypt";
import { CreatedUserResponse, CreateUserDTO } from "../database/models/users";
import { UserRepository } from "../database/repositories/user.repository";
import { createUserToken } from "../helpers/authentication/token";

type AuthenticationServiceDependencies = {
  userRepository: UserRepository;
};

export interface IAuthenticationService {
  register(data: CreateUserDTO): Promise<CreatedUserResponse>;
  login(data: any): Promise<any>;
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

  async login(data: any) {
    // TODO: Implement this method
    return data;
  }
}
