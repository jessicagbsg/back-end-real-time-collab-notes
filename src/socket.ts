import http from "http";
import { Server } from "socket.io";
import { UserRepository } from "./database/repositories/user.repository";
import { AuthenticationService } from "./services/auth.service";
import { NoteService } from "./services/note.service";
import { NoteRepository } from "./database/repositories/note.repository";
import { UpdateNoteDTO } from "./database/models/notes";
import { capitalize } from "lodash";

const userRepository = new UserRepository();
const authenticationService = new AuthenticationService({ userRepository });
const noteRepository = new NoteRepository();
const noteService = new NoteService({ noteRepository, userRepository });

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

  const nsp = io.of("/api/note");

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.access_token?.toString();
    if (!token) return "Authentication error";
    const user = authenticationService.getUserFromToken(token);
    if (!user) return "Authentication error";
    return next();
  });

  nsp.on("connection", (socket) => {
    console.log("New client connected");

    const userRooms = new Map();

    socket.on("join-room", async (content: { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room, user.id);
      if (!note) return nsp.to(note.room).emit("join-room", "Room not found");

      const previousRooms = userRooms.get(user.id) || [];
      for (const prevRoom of previousRooms) {
        if (prevRoom !== content.room) {
          socket.leave(prevRoom);
          nsp.to(prevRoom).emit("leave-room", {
            user: user.id,
            message: `${capitalize(user.firstName)} ${capitalize(
              user.lastName
            )} left collaboration`,
          });
        }
      }

      userRooms.set(user.id, [content.room]);

      if (note.ownerId !== user.id && !note.members.includes(user.id)) {
        note.members.push(user.id);
        await noteService.update(note.id, { members: note.members });
      }

      socket.join(content.room);
      nsp.to(content.room).emit("join-room", {
        user: user.id,
        message: `${capitalize(user.firstName)} ${capitalize(user.lastName)} joined collaboration`,
      });
    });

    socket.on("leave-room", async (content: { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room, user.id);
      if (!note) return nsp.to(content.room).emit("leave-room", "Room not found");

      const userRoomList = userRooms.get(user.id) || [];
      const updatedRoomList = userRoomList.filter((room: string) => room !== content.room);
      userRooms.set(user.id, updatedRoomList);

      socket.leave(content.room);
      nsp.to(content.room).emit("leave-room", {
        user: user.id,
        message: `${capitalize(user.firstName)} ${capitalize(user.lastName)} left collaboration`,
      });
    });

    socket.on("edit-note", async (content: UpdateNoteDTO & { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room, user.id);
      if (!note) return nsp.to(content.room).emit("edit-note", "Not able to find note");

      const updated = await noteService.update(note.id, {
        title: content.title,
        content: content.content,
        members: content.members,
      });

      socket.join(content.room);
      nsp.to(content.room).emit("edit-note", updated);
      nsp.to(content.room).emit("edit-note", {
        title: content.title,
        content: content.content,
        members: content.members,
        updatedAt: Date.now(),
      });
    });

    socket.on("delete-note", async (content: { room: string }) => {
      const user = await authenticationService.getUserFromToken(
        socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
      );
      if (!user) return;

      const note = await noteService.findByRoom(content.room, user.id);
      if (!note) return nsp.to(note.room).emit("deleted-note", "Not able to find note");

      const deleted = await noteService.delete(note.id, user.id);

      socket.join(note.room);
      nsp.to(note.room).emit("deleted-note", deleted);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
