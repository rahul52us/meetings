import mongoose, { Schema, Document, Date } from "mongoose";

export interface IPdfData {
  page: string;
  indexing: any;
  comment: string;
}

export interface IPdf extends Document {
  user?: any;
  created_At?: Date;
  updated_At?: Date;
  approved_At?: Date;
  files?: any;
  deletedAt?: Date;
  fileId?: mongoose.Types.ObjectId;
  fileName?: string;
  data: IPdfData[];
  folderId: mongoose.Types.ObjectId;
  indexing: any;
  pages?: String;
  comment?: String;
  pdf_Id?: string;
  extractedData?: mongoose.Schema.Types.Mixed;
  flowDates?: any;
  isExtracted?: boolean;
  status?: String;
  workflowInfo?: any;
  approval: boolean;
  workflowStatus: any;
}

const pdfdata = new Schema<IPdfData>({
  page: {
    type: String,
    required: true,
  },
  indexing: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
  },
});

// const workFlowDataschema = new Schema({
//   level: {
//     type: String,
//   },
//   status: {
//     type: String,
//   },
//   comment: {
//     type: String,
//   },
//   type: {
//     type: String
//   }
// },{_id : false})

const extractedSchema = new Schema<IPdf>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Accounts",
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
  folderId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Folder'
  },
  updated_At: {
    type: Date,
  },
  deletedAt: {
    type: Date,
  },
  pages: {
    type: String,
  },
  files: [
    {
      file: {
        type: mongoose.Types.ObjectId,
        ref: "fs.files",
      },
    },
  ],
  comment: {
    type: String,
  },
  pdf_Id: {
    type: String,
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    default: "pending",
  }
});

export default mongoose.model<IPdf>("PdfDetail", extractedSchema);
