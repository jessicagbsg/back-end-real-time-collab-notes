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
      if (!user) return;

      content.owner_id = user.id;
      const note = await noteService.create(content);

      socket.join(note.room);
      nsp.to(note.room).emit("created-note", note);
    });

    socket.on("join-room", async (content: { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room);
      if (!note) return nsp.to(note.room).emit("join-room", "Room not found");

      if (note.owner_id !== user.id && !note.members.includes(user.id)) {
        note.members.push(user.id);
        await noteService.update(note.id, { members: note.members });
      }

      socket.join(content.room);
      nsp.to(note.room).emit("join-room", "Joined room successfully");
    });

    socket.on("edit-note", async (content: UpdateNoteDTO & { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room);
      if (!note) return nsp.to(note.room).emit("edited-note", "Not able to find note");

      if (note.owner_id !== user.id && note.members.every((m) => m !== user.id))
        return nsp.to(note.room).emit("edited-note", "Unauthorized");

      const updated = await noteService.update(note.id, {
        title: content.title,
        content: content.content,
        members: content.members,
      });

      socket.join(note.room);
      nsp.to(note.room).emit("edited-note", updated);
    });

    socket.on("delete-note", async (content: { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room);
      if (!note) return nsp.to(note.room).emit("deleted-note", "Unauthorized");

      if (note.owner_id !== user.id && note.members.every((m) => m !== user.id))
        return nsp.to(note.room).emit("deleted-note", "Unauthorized");

      const deleted = await noteService.delete(note.id);

      socket.join(note.room);
      nsp.to(note.room).emit("deleted-note", deleted);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
