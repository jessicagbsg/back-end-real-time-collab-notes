import http from "http";
import { Server } from "socket.io";
import { UserRepository } from "./database/repositories/user.repository";
import { AuthenticationService } from "./services/auth.service";

const userRepository = new UserRepository();
const authenticationService = new AuthenticationService({ userRepository });

export const setUpSocket = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const nsp = io.of("/notes");

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.access_token?.toString();
    console.log({ token });
    if (!token) return next(new Error("Authentication error"));
    const user = authenticationService.getUserFromToken(token);
    if (!user) return next(new Error("Authentication error"));
    return next();
  });

  nsp.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("edit", (content) => {
      console.log("editing content", content);
      nsp.emit("updateContent", content);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
