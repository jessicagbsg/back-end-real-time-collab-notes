import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

export type CreateUserDTO = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UserLoginDTO = {
  email: string;
  password: string;
};

export type AuthenticatedUserResponse = {
  id: string;
  email: string;
  token: string;
};

export const UserModel = mongoose.model("user", UserSchema);
