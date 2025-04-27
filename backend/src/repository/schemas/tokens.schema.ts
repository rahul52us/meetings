import mongoose, { Schema, Document } from "mongoose";

interface ISession extends Document {
    userId: Schema.Types.ObjectId;
    type: string;
    created_at: Date;
};

const TokensSchema: Schema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String
    },
    created_at:{
        type: Date,
        default: Date.now
    }
    
})

export default mongoose.model<ISession>('Token', TokensSchema)