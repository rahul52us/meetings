import mongoose, { Schema, Document } from "mongoose";

interface IEkyc extends Document {
    name: string;
    identifier: string;
    workflow: string;
    video?: Blob;
    videoText?: string;
    otp?: string;
    otpVerified?: boolean;
    geotag?: object;
    steps?: object[];
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    company?: string;
    user?: string;
}

const EkycSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Name is required'],
    },
    identifier: {
        type: String,
        trim: true,
        required: [true, 'Identifier is required'],
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
    workflow: {
        type: mongoose.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Ekycworkflow'
    },
    video: {
        type: Buffer,
    },
    videoText: {
        type: String,
    },
    otp: {
        type: String,
    },
    otpVerified: {
        type: Boolean,
    },
    geotag: {
        type: Object
    },
    steps: {
        type: [Object]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    },
    deletedAt: {
        type: Date
    }
});

export default mongoose.model<IEkyc>('Ekyc', EkycSchema);


