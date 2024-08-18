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
});

export type CreateUserDTO = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type CreatedUserResponse = {
  id: string;
  email: string;
  token: string;
};

export const UserModel = mongoose.model("user", UserSchema);
