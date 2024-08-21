import { NoteRepository } from "../database/repositories/note.repository";
import type {
  CreateNoteDTO,
  CreatedNoteResponse,
  DeletedNoteResponse,
  FindNoteResponse,
  UpdateNoteDTO,
  UpdatedNoteResponse,
} from "../database/models/notes";

type NoteServiceDependencies = {
  noteRepository: NoteRepository;
};

export interface INoteService {
  create(data: CreateNoteDTO): Promise<CreatedNoteResponse>;
  findById(id: string): Promise<FindNoteResponse>;
  update(id: string, data: UpdateNoteDTO): Promise<UpdatedNoteResponse>;
  delete(id: string): Promise<DeletedNoteResponse>;
}

export class NoteService implements INoteService {
  private readonly noteRepository: NoteRepository;

  constructor({ noteRepository }: NoteServiceDependencies) {
    this.noteRepository = noteRepository;

    this.create = this.create.bind(this);
    this.findById = this.findById.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(data: CreateNoteDTO) {
    const createdNote = await this.noteRepository.create(data);
    return {
      title: createdNote.title,
      room: createdNote.room,
      content: createdNote.content,
      owner_id: createdNote.owner_id,
      members: createdNote.members,
      createdAt: createdNote.createdAt,
    };
  }

  async findById(id: string) {
    const note = await this.noteRepository.findById(id);
    if (!note) return null;
    return {
      id: note.id,
      room: note.room,
      title: note.title,
      content: note.content,
      owner_id: note.owner_id,
      members: note.members,
      createdAt: note.createdAt,
    };
  }

  async findByRoom(room: string) {
    return this.noteRepository.findByRoom(room);
  }

  async update(id: string, data: UpdateNoteDTO) {
    const updatedNote = await this.noteRepository.update(id, data);
    return { id, updated: updatedNote };
  }

  async delete(id: string) {
    const deletedNote = await this.noteRepository.delete(id);
    return { id, deleted: deletedNote };
  }
}
