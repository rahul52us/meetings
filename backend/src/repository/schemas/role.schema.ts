import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
    name: string;
    permissions: string[];
    company?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    template?: string;
    data: any;
}

const RoleSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Role name is required.'],
    },
    permissions: {
        type: [String],
        required: [true, 'Role permissions are required.'],
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Organisation',
    },
    template: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
    },
    deletedAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    }
});

export default mongoose.model<IRole>('Role', RoleSchema);
