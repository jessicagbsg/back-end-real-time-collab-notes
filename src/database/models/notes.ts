import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  owner_id: {
    type: String,
  },
  members: {
    type: [String],
  },
  room: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

export type CreateNoteDTO = {
  owner_id: string;
  title?: string;
  content?: string;
  members?: string[];
};

export type UpdateNoteDTO = Omit<CreateNoteDTO, "owner_id">;

export type CreatedNoteResponse = {
  room: string;
  title?: string;
  content?: string;
  owner_id: string;
  members?: string[];
  createdAt: Date;
};

export type FindNoteResponse = {
  id: string;
  room: string;
  title: string | null;
  content: string | null;
  owner_id: string;
  members: string[] | null;
  createdAt: Date;
};

export type UpdatedNoteResponse = {
  id: string;
  updated: boolean;
};

export type DeletedNoteResponse = {
  id: string;
  deleted: boolean;
};

export const NoteModel = mongoose.model("note", NoteSchema);
