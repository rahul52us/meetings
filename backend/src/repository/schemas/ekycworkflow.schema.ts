import mongoose, { Schema, Document } from "mongoose";

interface IEkycworkflow extends Document {
    name: string;
    document?: string;
    sample?: string;
    company?: string;
    user: string;
    identifier?: string;
    fields: string;
    master: string;
    steps?: object[];
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}

const EkycWorkflowSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    identifier: {
        type: String,
        trim: true,
        required: [true, "Identifier is required"],
    },
    description: {
        type: String,
        trim: true,
    },
    sample: {
        type: String,
        trim: true,
    },
    fields: {
        type: String,
        trim: true,
    },
    master: {
        type: String,
        trim: true,
    },
    steps: {
        type: [Object],
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    deletedAt: {
        type: Date
    },
    company: {
        type: mongoose.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Organisation'
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Account'
    },
});
export default mongoose.model<IEkycworkflow>('Ekycworkflow', EkycWorkflowSchema);


