import mongoose, { Schema, Document } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

interface IAccount extends Document {
  name?: string;
  username: string;
  company?: string;
  moNumber: string;
  role?: String;
  permission?: any;
  filter?: boolean;
  is_active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  setPassword(password: string, cb: (err: any, user: this) => void): void;
}

const AccountSchema: Schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, "Email address is required"],
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  permission: {
    type: Array,
    default: [],
  },
  moNumber: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v: string) {
        return /^\d{10,15}$/.test(v);
      },
      message: function (props: { value: string }) {
        return `${props.value} is not a valid phone number!`;
      },
    },
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
  deletedAt: {
    type: Date,
  },
});

AccountSchema.plugin(passportLocalMongoose);

export default mongoose.model<IAccount>("Account", AccountSchema);
