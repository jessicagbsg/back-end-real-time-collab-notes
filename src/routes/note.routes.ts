import { Router } from "express";
import { NoteController } from "../controllers/note.controller";
import { NoteRepository } from "../database/repositories/note.repository";
import { NoteService } from "../services/note.service";
import { authorized } from "../middlewares/auth.middleware";

const noteRepository = new NoteRepository();
const noteService = new NoteService({ noteRepository });
const noteController = new NoteController({ noteService });

const noteRouter = Router();

noteRouter.post("/create", authorized, noteController.create);
noteRouter.post("/", authorized, noteController.findAllByOwner);

export { noteRouter };
