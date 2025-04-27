import mongoose, { Schema, Document } from "mongoose";

interface IOrganisation extends Document {
    name: string;
    type?: string;
};

const OrganisationSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Name is required'],
    },
    type: {
        type: String
    },
    
});

export default mongoose.model<IOrganisation>('Organisation', OrganisationSchema);
