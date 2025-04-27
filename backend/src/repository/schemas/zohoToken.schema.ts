import mongoose, { Schema, Document } from 'mongoose';

interface IZohoToken extends Document {
  user_id: string;  // The user or organization this token belongs to
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  created_at: Date;
  updated_at: Date;
}

const ZohoTokenSchema = new Schema<IZohoToken>({
  access_token: { type: String },
  refresh_token: { type: String },
  expires_in: { type: Number },
  scope: { type: String },
  token_type: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const ZohoToken = mongoose.model<IZohoToken>('ZohoToken', ZohoTokenSchema);

export default ZohoToken;
