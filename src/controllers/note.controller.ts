import { Request, Response } from "express";
import type { INoteService } from "../services/note.service";
import { AuthenticatedUserResponse } from "../database/models/users";

type noteControllerDependencies = {
  noteService: INoteService;
};

export interface INoteController {
  create(req: Request, res: Response): Promise<void>;
  findAllByOwner(req: Request, res: Response): Promise<void>;
  findByRoomId(req: Request, res: Response): Promise<void>;
}

export class NoteController implements INoteController {
  private readonly noteService: INoteService;

  constructor({ noteService }: noteControllerDependencies) {
    this.noteService = noteService;

    this.create = this.create.bind(this);
    this.findAllByOwner = this.findAllByOwner.bind(this);
    this.findByRoomId = this.findByRoomId.bind(this);
  }

  async create(req: Request, res: Response) {
    try {
      const data = req.body.note;
      const createdNote = await this.noteService.create(data);
      res.status(201).json(createdNote);
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }

  async findByRoomId(req: Request, res: Response) {
    try {
      const user = req.body.user as AuthenticatedUserResponse;
      const roomId = req.params.roomId;
      const note = await this.noteService.findByRoom(roomId, user.id);
      res.status(200).json(note);
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }

  async findAllByOwner(req: Request, res: Response) {
    try {
      const user = req.body.user as AuthenticatedUserResponse;
      const notes = await this.noteService.findAllByOwner(user.id);
      res.status(200).json(notes);
    } catch (error) {
      res.status(409).json({ message: error.message });
    }
  }
}
