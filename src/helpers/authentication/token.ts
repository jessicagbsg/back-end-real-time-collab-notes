import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { AuthenticatedUserResponse } from "../../database/models/users";

dotenv.config();

export function createUserToken(id: string, payload?: object): string {
  return jwt.sign({ id, ...payload }, process.env.TOKEN_KEY, {
    expiresIn: 3 * 24 * 60 * 60,
  });
}

export function decodeToken(token: string) {
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  if (typeof decoded === "string") throw new Error("Invalid token");
  return decoded;
}
