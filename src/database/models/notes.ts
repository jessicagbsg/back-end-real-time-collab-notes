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

export type UpdateNoteDTO = {
  owner_id: string;
  title?: string;
  content?: string;
  members?: string[];
};

export type CreatedNoteResponse = {
  title?: string;
  content?: string;
  owner_id: string;
  members?: string[];
  createdAt: Date;
};

export const NoteModel = mongoose.model("note", NoteSchema);
