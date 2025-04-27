import mongoose, { Schema, Document, Date } from "mongoose";

export interface IExtracted extends Document {
    created_At?: Date;
    updated_At?: Date;
    deleted_At?: Date;
    fileId?: string;
    data: object;
}

const extractedSchema = new Schema({
    created_At: {
        type: Date,
        default: Date.now,
    },
    updated_At: {
        type: Date,
        default: Date.now,
    },
    deleted_At: {
        type: Date,
    },
    fileId: {
        type: mongoose.Types.ObjectId,
        ref: "fs.files"
    },
    data: {
        type: Object,
        required: true
    }
})

export default mongoose.model<IExtracted>("extracted", extractedSchema);