import { NoteRepository } from "../database/repositories/note.repository";
import type { CreateNoteDTO, CreatedNoteResponse } from "../database/models/notes";

type NoteServiceDependencies = {
  noteRepository: NoteRepository;
};

export interface INoteService {
  create(data: CreateNoteDTO): Promise<CreatedNoteResponse>;
}

export class NoteService implements INoteService {
  private readonly noteRepository: NoteRepository;

  constructor({ noteRepository }: NoteServiceDependencies) {
    this.noteRepository = noteRepository;

    this.create = this.create.bind(this);
  }

  async create(data: CreatedNoteResponse) {
    const createdNote = await this.noteRepository.create(data);
    return {
      title: createdNote.title,
      content: createdNote.content,
      owner_id: createdNote.owner_id,
      members: createdNote.members,
      createdAt: createdNote.createdAt,
    };
  }
}
