import { NoteRepository } from "../database/repositories/note.repository";
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  type CreateNoteDTO,
  type CreatedNoteResponse,
  type DeletedNoteResponse,
  type FindNoteResponse,
  type UpdateNoteDTO,
  type UpdatedNoteResponse,
} from "../database/models/notes";
import { UserRepository } from "../database/repositories/user.repository";
import { ZodError } from "zod";

type NoteServiceDependencies = {
  noteRepository: NoteRepository;
  userRepository: UserRepository;
};

export interface INoteService {
  create(data: CreateNoteDTO): Promise<CreatedNoteResponse>;
  findById(id: string, userId: string): Promise<FindNoteResponse>;
  findByRoom(room: string, userId: string): Promise<FindNoteResponse>;
  findAllByOwner(ownerId: string): Promise<FindNoteResponse[]>;
  update(id: string, data: UpdateNoteDTO): Promise<UpdatedNoteResponse>;
  delete(id: string, userId: string): Promise<DeletedNoteResponse>;
}

export class NoteService implements INoteService {
  private readonly noteRepository: NoteRepository;
  private readonly userRepository: UserRepository;

  constructor({ noteRepository, userRepository }: NoteServiceDependencies) {
    this.noteRepository = noteRepository;
    this.userRepository = userRepository;

    this.create = this.create.bind(this);
    this.findById = this.findById.bind(this);
    this.findByRoom = this.findByRoom.bind(this);
    this.findAllByOwner = this.findAllByOwner.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.validateAccessToGetOrUpdateNote = this.validateAccessToGetOrUpdateNote.bind(this);
  }

  async create(data: CreateNoteDTO) {
    const user = await this.userRepository.findById(data.ownerId);
    if (!user) throw new Error("User not found");

    await this.validateCreateNoteData(data);

    const createdNote = await this.noteRepository.create(data);
    return {
      title: createdNote.title,
      room: createdNote.room,
      content: createdNote.content,
      ownerId: createdNote.ownerId,
      members: createdNote.members,
      createdAt: createdNote.createdAt,
    };
  }

  async findById(id: string, userId: string) {
    const note = await this.noteRepository.findById(id);
    if (!note) return null;

    await this.validateAccessToGetOrUpdateNote(userId, note.id);

    return {
      id: note.id,
      room: note.room,
      title: note.title,
      content: note.content,
      ownerId: note.ownerId,
      members: note.members,
      createdAt: note.createdAt,
    };
  }

  async findAllByOwner(ownerId: string) {
    const notes = await this.noteRepository.findAllByOwner(ownerId);
    if (!notes.length) return [];
    return notes.map((note) => ({
      id: note.id,
      room: note.room,
      title: note.title,
      content: note.content,
      ownerId: note.ownerId,
      members: note.members,
      createdAt: note.createdAt,
    }));
  }

  async findByRoom(room: string, userId: string) {
    const note = await this.noteRepository.findByRoom(room);
    if (!note) return null;

    // await this.validateAccessToGetOrUpdateNote(userId, note.id);

    return {
      id: note.id,
      room: note.room,
      title: note.title,
      content: note.content,
      ownerId: note.ownerId,
      members: note.members,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async update(id: string, data: UpdateNoteDTO) {
    await this.validateUpdateNoteData(data);
    const updatedNote = await this.noteRepository.update(id, data);
    return { id, updated: updatedNote };
  }

  async delete(id: string, userId: string) {
    // await this.validateAccessToGetOrUpdateNote(userId, id);

    const deletedNote = await this.noteRepository.delete(id);
    return { id, deleted: deletedNote };
  }

  private async validateAccessToGetOrUpdateNote(userId: string, noteId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const note = await this.noteRepository.findById(noteId);
    if (!note) throw new Error("Note not found");

    if (note.ownerId !== userId && !note.members.includes(userId)) {
      throw new Error("Unauthorized");
    }
  }

  private async validateCreateNoteData(data: CreateNoteDTO) {
    try {
      CreateNoteSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Invalid data: ${error.message}`);
      }
      throw new Error("Invalid data");
    }
  }

  private async validateUpdateNoteData(data: UpdateNoteDTO) {
    try {
      UpdateNoteSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Invalid data: ${error.message}`);
      }
      throw new Error("Invalid data");
    }
  }
}
