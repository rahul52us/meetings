import mongoose, { Schema, Document } from "mongoose";

interface IFolder extends Document {
  name: string;
  folderKey: string;
  createdAt?: Date;
}
const folderSchema = new Schema<IFolder>({
  name: {
    type: String,
    required: true,
  },
  folderKey: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define model for Folder
const Folder = mongoose.model<IFolder>("Folder", folderSchema);



