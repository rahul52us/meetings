// import mongoose, { Schema, Document } from "mongoose";
import fs from 'fs'
// export interface IFile extends Document {
//     name: string;
//     type?: string;
//     size?: string;
//     company?: string;
//     data?: Buffer; // Define data property
//     base64Data?: string;
//     binaryData?: string;
//     createdAt?: string;
//     updatedAt?: string;
//     deletedAt?: string;
// }
// /*

// In this schema, we have the following fields:

// name: the name of the file
// type: the MIME type of the file
// size: the size of the file in bytes
// binaryData: the binary data of the file, stored as a Buffer
// base64Data: the base64-encoded data of the file, stored as a String

// */
// const FileSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     type: {
//         type: String,
//         required: false
//     },
//     data: {
//         type: Buffer,
//     },
//     size: {
//         type: Number,
//     },
//     binaryData: {
//         type: Buffer,
//         required: false
//     },
//     base64Data: {
//         type: String,
//         required: false
//     },
//     createdAt: {
//         type: Date,
//     },
//     updatedAt: {
//         type: Date,
//     },
//     deletedAt: {
//         type: Date,
//     }
// },
//     {
//         timestamps: true
//     });
// // virtual property to get base64 encoded data
// FileSchema.virtual('base64').get(function () {
//     return this.base64Data || this.data.toString('base64');
// });

// // middleware to set base64 encoded data after save
// FileSchema.pre('save', function (next) {
//     if (!this.base64Data && this.data) {
//         this.base64Data = this.data.toString('base64');
//     }
//     next();
// });

// // static method to create new file document
// FileSchema.statics.createFile = function (filename, contentType, data, callback) {
//     const File = this;
//     const file = new File({ filename, contentType, data });
//     file.save(callback);
// };

// // instance method to get file data as buffer
// FileSchema.methods.getData = function (callback: (arg0: any, arg1: Buffer) => void) {
//     if (this.data) {
//         callback(null, this.data);
//     } else if (this.base64Data) {
//         const data = Buffer.from(this.base64Data, 'base64');
//         callback(null, data);
//     } else {
//         fs.readFile(this.filename, callback);
//     }
// };

// // module.exports = mongoose.model('File', FileSchema);
// export default mongoose.model<IFile>('File', FileSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
    name: string;
    mimetype: string;
    data?: Buffer; // Define data property
    binaryData?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
    status?:string;


    // Add other fields as needed
}

const fileSchema = new Schema<IFile>({
    name: { type: String, required: true },
    data: { type: Buffer, required: true },
    mimetype: { type: String, required: true },
    status: { type: String, default: 'pending' },

    // Define other fields as needed
});
fileSchema.methods.getData = function (callback: (error: any, data: Buffer) => void) {
    if (this.data) {
        callback(null, this.data);
    } else if (this.base64Data) {
        const data = Buffer.from(this.base64Data, 'base64');
        callback(null, data);
    } else {
        fs.readFile(this.filename, (error: any, data: Buffer) => {
            if (error) {
                callback(error, null);
            } else {
                callback(null, data);
            }
        });
    }
};



export default mongoose.model<IFile>('File', fileSchema);;

