// import { saveFile, getFileUrl } from '~/repository/filestorage.repository';
// import { IFile } from '~/repository/schemas/filestorage.schema';
// import express, { Request, Response } from 'express';
// import multer from 'multer';
// import FileSchema from '~/repository/schemas/filestorage.schema'

// interface UserRequest extends Request {
//     company?: string;
//     _id?: string;
// }



// export async function uploadFileService(req: Request, res: Response) {
//     try {
//         const files = req.files as Express.Multer.File[];
//         const uploadedFiles: IFile[] = [];

//         for (const file of files) {
//             const fileId = saveFile(file);
//             const filePath = getFileUrl(fileId);

//             const newFile = new FileSchema({
//                 name: file.originalname,
//                 type: file.mimetype,
//                 data: file.buffer
//             });
//             await newFile.save();
//             uploadedFiles.push(newFile);
//         }
//         res.status(201).json(uploadedFiles);

//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// }

// // export async function getFileService(req: UserRequest, res: Response) {
// //     const { fileId } = req.params;

// //     try {
// //         const file = await FileSchema.findById(fileId);
// //         if (!file) {
// //             return res.status(404).json({ message: 'File not found' });
// //         }

// //         res.set('Content-Disposition', `attachment; filename=${file.name}`);
// //         file.getData((error: any, data: Buffer) => {
// //             if (error) {
// //                 console.error(error);
// //                 res.status(500).json({ message: error.message });
// //             } else {
// //                 res.send(data);
// //             }
// //         });
// //     } catch (error) {
// //         console.error(error);
// //         res.status(500).json({ message: error.message });
// //     }
// // }


