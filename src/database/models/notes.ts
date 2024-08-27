import mongoose from "mongoose";
import { z } from "zod";

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  ownerId: {
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
  ownerId: string;
  title?: string;
  content?: string;
  members?: string[];
};

export const CreateNoteSchema = z.object({
  ownerId: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  members: z.array(z.string()).optional(),
});

export type UpdateNoteDTO = Omit<CreateNoteDTO, "ownerId"> & {
  updatedAt: Date;
};

export const UpdateNoteSchema = z.object({
  updatedAt: z.date(),
  title: z.string().optional(),
  content: z.string().optional(),
  members: z.array(z.string()).optional(),
});

export type CreatedNoteResponse = {
  room: string;
  title?: string;
  content?: string;
  ownerId: string;
  members?: string[];
  createdAt: Date;
};

export type FindNoteResponse = {
  id: string;
  room: string;
  title: string | null;
  content: string | null;
  ownerId: string;
  members: string[] | null;
  createdAt: Date;
  updatedAt?: Date;
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
