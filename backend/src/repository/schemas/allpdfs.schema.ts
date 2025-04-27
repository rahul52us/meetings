import { Schema, model, Document } from 'mongoose';

interface PDF extends Document {
  title: string;
  content: string;
  createdBy: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

const pdfSchema = new Schema<PDF>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: String, required: true },
  company: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PDFModel = model<PDF>('PDF', pdfSchema);
