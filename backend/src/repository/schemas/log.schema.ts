import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
    message: string;
    type: string;
    logtype: string;
    created_At: Date;
    company?: string;
    user?: string;
    statuscode?: number;
}

export
    const LogSchema: Schema = new mongoose.Schema(
        {
            statuscode: {
                type: Number,
            },
            message: {
                type: String,
            },
            type: {
                type: String,
                value: String,
                required: [true, 'type is required'],
                enum: ['log', 'error', 'warning', 'info', 'success'],
            },
            logtype: {
                type: String,
                required: [true, 'Logtype is required'],
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
            created_At: {
                type: Date,
                default: Date.now,
            }
        }
    );

export default mongoose.model<ILog>('Log', LogSchema);
