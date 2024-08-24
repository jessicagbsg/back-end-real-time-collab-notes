import { Router } from "express";
import { NoteController } from "../controllers/note.controller";
import { NoteRepository } from "../database/repositories/note.repository";
import { NoteService } from "../services/note.service";
import { UserRepository } from "../database/repositories/user.repository";

const noteRepository = new NoteRepository();
const userRepository = new UserRepository();
const noteService = new NoteService({ noteRepository, userRepository });
const noteController = new NoteController({ noteService });

const noteRouter = Router();

noteRouter.post("/create", noteController.create);
noteRouter.get("/", noteController.findAllByOwner);
noteRouter.get("/:roomId", noteController.findByRoomId);

export { noteRouter };
