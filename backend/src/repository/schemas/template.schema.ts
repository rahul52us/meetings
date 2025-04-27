import mongoose, { Schema, Document } from 'mongoose';

export interface IField extends Document {
    validator: string;
    min?: number;
    max?: number;
    name: string;
}

export interface IData extends Document {
    text: string[];
    keyvalue: string[];
    table: string[];
}

export interface ITemplate extends Document {
    name: string;
    domain?: string;
    engine: string;
    sample: string;
    identifier: string;
    comments: string;
    fields: IField[];
    company?: string;
    user?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export const DataSchema: Schema = new mongoose.Schema({
    text: {
        type: [String],
        default: [],
    },
    keyvalue: {
        type: [String],
        default: [],
    },
    table: {
        type: [String],
        default: [],
    },
});

export const FieldSchema: Schema = new mongoose.Schema({
    validator: {
        type: String,
        trim: true,
        required: [true, 'Field validator is required.'],
    },
    min: {
        type: Number,
    },
    max: {
        type: Number,
    },
    name: {
        type: String,
        trim: true,
        required: [true, 'Field name is required.'],
    },
});

export const TemplateSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Name is required.'],
    },
    domain: {
        type: mongoose.Types.ObjectId,
        ref: 'Domain',
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Organisation',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'User is not logged in'],
        ref: 'Account',
    },
    engine: {
        type: String,
        enum: ["engine1", "engine2", "engine3"],
    },
    identifier: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Identifier is required.'],
    },
    sample: {
        type: String,
        required: [true, 'Sample_pdf is required.'],
        validate: {
            validator: function (value: any) {
                return typeof value === 'string' || Buffer.isBuffer(value);
            },
            message: 'Sample_pdf must be a string URL or a buffer.',
        },
    },
    comments: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Identifier is required.'],
    },
    data: {
        type: DataSchema,
        default: {
            text: [],
            keyvalue: [],
            table: [],
        },
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
    },
});

export default mongoose.model<ITemplate>('Template', TemplateSchema);