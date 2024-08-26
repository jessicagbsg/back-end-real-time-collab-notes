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
    try {
      const token =
        socket.handshake.auth?.token || socket.handshake.headers.access_token?.toString();
      if (!token) {
        console.error("Token missing");
        return next(new Error("Authentication error"));
      }

      const user = authenticationService.getUserFromToken(token);
      if (!user) {
        console.error("Invalid token or user not found");
        return next(new Error("Authentication error"));
      }

      socket.data.user = user;
      next();
    } catch (err) {
      console.error("Error during authentication", err);
      next(new Error("Authentication error"));
    }
  });

  nsp.on("connection", (socket) => {
    console.log("New client connected");
    const userRooms = new Map<string, Set<string>>();

    socket.on("join-room", async ({ room }) => {
      const user =
        socket.data.user ||
        (await authenticationService.getUserFromToken(
          socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
        ));
      if (!user) return;

      const note = await noteService.findByRoom(room, user.id);
      if (!note) return socket.emit("error", "Room not found");

      const previousRooms = userRooms.get(user.id) || new Set();
      previousRooms.forEach((prevRoom) => {
        if (prevRoom !== room) {
          socket.leave(prevRoom);
          nsp.to(prevRoom).emit("leave-room", {
            user: user.id,
            message: `${capitalize(user.firstName)} ${capitalize(
              user.lastName
            )} left collaboration`,
          });
        }
      });

      userRooms.set(user.id, new Set([room]));

      if (note.ownerId !== user.id && !note.members.includes(user.id)) {
        note.members.push(user.id);
        await noteService.update(note.id, { members: note.members });
      }

      socket.join(room);
      nsp.to(room).emit("join-room", {
        user: user.id,
        message: `${capitalize(user.firstName)} ${capitalize(user.lastName)} joined collaboration`,
      });
    });

    socket.on("leave-room", async ({ room }) => {
      const user =
        socket.data.user ||
        (await authenticationService.getUserFromToken(
          socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
        ));
      if (!user) return;

      const note = await noteService.findByRoom(room, user.id);
      if (!note) return socket.emit("error", "Room not found");

      const userRoomList = userRooms.get(user.id);
      if (userRoomList) {
        userRoomList.delete(room);
        userRooms.set(user.id, userRoomList);
      }

      socket.leave(room);
      nsp.to(room).emit("leave-room", {
        user: user.id,
        message: `${capitalize(user.firstName)} ${capitalize(user.lastName)} left collaboration`,
      });
    });

    socket.on(
      "edit-note",
      async ({ room, title, content, members }: UpdateNoteDTO & { room: string }) => {
        const user =
          socket.data.user ||
          (await authenticationService.getUserFromToken(
            socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
          ));
        if (!user) return;

        const note = await noteService.findByRoom(room, user.id);
        if (!note) return socket.emit("error", "Not able to find note");

        if (note.ownerId !== user.id && !note.members.includes(user.id))
          return socket.emit("error", "Not authorized");

        await noteService.update(note.id, { title, content, members });

        socket.join(room);
        nsp.to(room).emit("edit-note", {
          title,
          content,
          members,
          updatedAt: Date.now(),
        });
      }
    );

    socket.on("delete-note", async ({ room }) => {
      const user =
        socket.data.user ||
        (await authenticationService.getUserFromToken(
          socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
        ));
      if (!user) return;

      const note = await noteService.findByRoom(room, user.id);
      if (!note) return socket.emit("error", "Not able to find note");

      if (note.ownerId !== user.id && !note.members.includes(user.id))
        return socket.emit("error", "Not authorized");

      const deleted = await noteService.delete(note.id, user.id);

      nsp.to(room).emit("delete-note", deleted);
      socket.leave(room);
      socket.disconnect();
    });

    socket.on("disconnect", async () => {
      const user =
        socket.data.user ||
        (await authenticationService.getUserFromToken(
          socket.handshake.auth.token || socket.handshake.headers.access_token?.toString()
        ));
      if (!user) return;
      userRooms.delete(user.id);
      console.log("Client disconnected");
    });
  });
};
