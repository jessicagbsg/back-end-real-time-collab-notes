import { CreateUserDTO, UserModel } from "../models/users";

export interface IUserRepository {
  createUser(data: CreateUserDTO): Promise<any>;
  findUserByEmail(email: string): Promise<any>;
  findUserById(id: string): Promise<any>;
}

export class UserRepository implements IUserRepository {
  constructor() {
    this.createUser = this.createUser.bind(this);
    this.findUserByEmail = this.findUserByEmail.bind(this);
    this.findUserById = this.findUserById.bind(this);
  }

  async createUser(data: CreateUserDTO) {
    // TODO: Implement this method
    return await UserModel.create(data);
  }

  async findUserByEmail(email: string) {
    // TODO: Implement this method
    return await UserModel.findOne({ email });
  }

  async findUserById(id: string) {
    // TODO: Implement this method
    return await UserModel.findById(id);
  }
}
