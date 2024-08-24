import crypto from "crypto";
import { CreateNoteDTO, NoteModel, UpdateNoteDTO } from "../models/notes";

export interface INoteRepository {
  create(data: CreateNoteDTO): Promise<any>;
  findById(id: string): Promise<any>;
  findByRoom(id: string): Promise<any>;
  findAllByOwner(id: string): Promise<any>;
  update(id: string, data: UpdateNoteDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export class NoteRepository implements INoteRepository {
  constructor() {
    this.create = this.create.bind(this);
    this.findById = this.findById.bind(this);
    this.findByRoom = this.findByRoom.bind(this);
    this.findAllByOwner = this.findAllByOwner.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(data: CreateNoteDTO) {
    const createdNote = await NoteModel.create({
      ...data,
      room: crypto.randomBytes(16).toString("hex"),
    });
    return createdNote.toObject();
  }

  async findById(id: string) {
    return NoteModel.findById(id, { deletedAt: null });
  }

  async findByRoom(room: string) {
    return NoteModel.findOne({ room, deletedAt: null });
  }

  async findAllByOwner(ownerId: string) {
    return NoteModel.find({ ownerId, deletedAt: null });
  }

  async update(id: string, data: UpdateNoteDTO) {
    const updatedNote = await NoteModel.findByIdAndUpdate(id, { ...data, updatedAt: new Date() });
    return updatedNote !== null;
  }

  async delete(id: string) {
    const deletedNote = await NoteModel.findByIdAndUpdate(id, { deletedAt: new Date() });
    return deletedNote !== null;
  }
}
