import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFolder extends Document {
  user:mongoose.Schema.Types.ObjectId,
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  parentId: Types.ObjectId | null;
  totalPages?:Number;
  deletedAt?:Date;
  folderId:string;
}

const folderSchema = new Schema<IFolder>({
  user : {
    type : Schema.Types.ObjectId,
    ref : 'account'
  },
  name: {
    type: String,
    required: true,
  },
  totalPages : {
    type : Number,
    default : 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  deletedAt : {
    type : Date
  },
  folderId:{
    type:String
  }
});


export const Folder = mongoose.model<IFolder>("Folder", folderSchema);


