import http from "http";
import { Server } from "socket.io";
import { UserRepository } from "./database/repositories/user.repository";
import { AuthenticationService } from "./services/auth.service";
import { NoteService } from "./services/note.service";
import { NoteRepository } from "./database/repositories/note.repository";
import { CreateNoteDTO, UpdateNoteDTO } from "./database/models/notes";

const userRepository = new UserRepository();
const authenticationService = new AuthenticationService({ userRepository });
const noteRepository = new NoteRepository();
const noteService = new NoteService({ noteRepository });

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

    socket.on("create-note", async (content: CreateNoteDTO) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return console.log("Unauthorized");
      content.owner_id = user.id;
      const note = await noteService.create(content);

      nsp.emit("created-note", note);
    });

    socket.on("edit-note", async (content: UpdateNoteDTO & { id: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return nsp.emit("edited-note", "Not able to find user");

      const note = await noteService.findById(content.id);
      if (!note) return nsp.emit("edited-note", "Not able to find note");

      if (note.owner_id !== user.id && note.members.every((m) => m !== user.id))
        return nsp.emit("edited-note", "Unauthorized");

      const updated = await noteService.update(content.id, {
        title: content.title,
        content: content.content,
        owner_id: user.id,
        members: content.members,
      });

      nsp.emit("edited-note", updated);
    });

    socket.on("delete-note", async (content) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return nsp.emit("deleted-note", "Unauthorized");

      const note = await noteService.findById(content.id);
      if (!note) return nsp.emit("deleted-note", "Unauthorized");

      if (note.owner_id !== user.id && note.members.every((m) => m !== user.id))
        return nsp.emit("deleted-note", "Unauthorized");

      const deleted = await noteService.delete(content.id);
      nsp.emit("deleted-note", deleted);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
