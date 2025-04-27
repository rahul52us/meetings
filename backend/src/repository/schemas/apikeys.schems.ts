import mongoose, { Schema, Document, Date } from "mongoose";

interface IApiKey extends Document {
    key: string;
    user?: string;
    company?: string;
    created_At?: Date;
    updated_At?: Date;
    deleted_At?: Date;
}

const ApiKeySchema: Schema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Account'
    },
    company: {
        type: mongoose.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Organisation'
    },
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
        default: Date.now,
    },
});

export default mongoose.model<IApiKey>("ApiKey", ApiKeySchema);
