import { CreateUserDTO, UserModel } from "../models/users";

export interface IUserRepository {
  createUser(data: CreateUserDTO): Promise<any>;
  findByEmail(email: string): Promise<any>;
  findById(id: string): Promise<any>;
}

export class UserRepository implements IUserRepository {
  constructor() {
    this.createUser = this.createUser.bind(this);
    this.findByEmail = this.findByEmail.bind(this);
    this.findById = this.findById.bind(this);
  }

  async createUser(data: CreateUserDTO) {
    return await UserModel.create(data);
  }

  async findByEmail(email: string) {
    return await UserModel.findOne({ email });
  }

  async findById(id: string) {
    return await UserModel.findById(id);
  }
}
