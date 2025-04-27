// // import fs from 'fs';
// // import path from 'path';
// // import { IFile } from '~/repository/schemas/filestorage.schema';
// // const multer = require('multer')
// // const Express = require('express')


// // const upload = multer({ dest: "uploads/" });

// // const FILE_STORAGE_PATH = path.join(__dirname, '..', 'storage');

// // export function saveFile(file: Express.Multer.File): string {
// //     const fileId = generateFileId();
// //     const filePath = path.join(FILE_STORAGE_PATH, fileId);

// //     // Create the storage folder if it doesn't exist
// //     if (!fs.existsSync(FILE_STORAGE_PATH)) {
// //         fs.mkdirSync(FILE_STORAGE_PATH);
// //     }

// //     // Save the file to disk
// //     fs.writeFileSync(filePath, file.buffer);

// //     return fileId;
// // }

// // export function getFileUrl(fileId: string): string {
// //     return `/files/${fileId}`;
// // }
// // //
// // function generateFileId(): string {
// //     // Generate a unique ID for the file name
// //     const timestamp = Date.now().toString(36);
// //     const random = Math.random().toString(36).slice(2);
// //     return timestamp + random;
// // }


// // export function getdata(callback: (error: any, data: Buffer) => void) {
// //     if (this.data) {
// //         callback(null, this.data);
// //     } else if (this.base64Data) {
// //         const data = Buffer.from(this.base64Data, 'base64');
// //         callback(null, data);
// //     } else {
// //         fs.readFile(this.filename, (error, data) => {
// //             if (error) {
// //                 callback(error, null);
// //             } else {
// //                 callback(null, data);
// //             }
// //         });
// //     }
// // };



// const fs = require('fs');
// const path = require('path');
// const db = require('./your-database-module'); // Replace with your actual database module
// const
// // Assuming you have received the buffer from the frontend
// const fileBuffer = req.body.fileBuffer; // Replace req.body.fileBuffer with the actual variable holding the buffer

// // Generate a unique file name or use any other naming convention as per your requirement
// const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// // Define the file path where you want to save the file
// const filePath = path.join(__dirname, 'uploads', fileName); // Replace 'uploads' with your desired directory

// // Write the buffer to the file using fs.writeFileSync
// fs.writeFileSync(filePath, fileBuffer);

// // Save the file path or other relevant information to the database
// db.saveFilePath(filePath); // Replace db.saveFilePath with the actual method to save the file path in your database
