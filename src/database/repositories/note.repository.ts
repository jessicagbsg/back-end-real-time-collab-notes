import { CreateNoteDTO, NoteModel } from "../models/notes";

export interface INoteRepository {
  create(data: CreateNoteDTO): Promise<any>;
}

export class NoteRepository implements INoteRepository {
  constructor() {
    this.create = this.create.bind(this);
  }

  async create(data: CreateNoteDTO) {
    const createdNote = await NoteModel.create(data);
    return createdNote.toObject();
  }
}
