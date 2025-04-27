import { Request, Response } from "express";
import mongoose, { mongo } from "mongoose";
import fs from 'fs';
const { GridFSBucket } = mongo;
import { uploadFile, getFile } from "../../repository/filesystem.repository"

// export const uploadFileWithGridFS = async (req: Request, res: Response) => {
//   try {
//     let { file, name, type } = req.body
//     if (typeof (file) === 'string') {
//       file = JSON.parse(file)
//     }

//     if (!file || !name || !type) {
//       console.log(name, type, file)
//       return res.status(400).json({ error: "No file uploaded." });
//     }

//     // const { originalname, mimetype, buffer } = req.file;
//     const connection = mongoose.connection;
//     const bucket = new GridFSBucket(connection.db);

//     const readableStream = new Readable();
//     file = new Uint8Array(file)
//     readableStream.push(file);
//     readableStream.push(null);

//     const uploadStream = bucket.openUploadStream(name, {
//       metadata: { contentType: type },
//     });

//     readableStream.pipe(uploadStream);

//     uploadStream.on("finish", () => {
//       const fileId = uploadStream.id; // Retrieve the fileId
//       fileSystemSchema
//         .create({
//           fileId: fileId,
//         })
//         .then((data) => {
//           res.json({
//             message: "File uploaded successfully.",
//             data: data,
//             success: true,
//           });
//         })
//         .catch((err) => {
//           res
//             .status(400)
//             .send({ message: "file upload failed", success: false });
//         });
//     });

//     uploadStream.on("error", (error) => {
//       console.error("Error uploading file", error);
//       res.status(500).json({ error: "An error occurred during file upload" });
//     });

//     /* uploadf.single("file")(req, res, async (err) => {

//     }); */
//   } catch (error) {
//     console.error("Error uploading file", error);
//     res.status(500).json({ error: "An error occurred during file upload" });
//   }
// };

export async function uploadFileService(req: Request, res: Response) {
  try {
    let { file, name, type } = req.body
    if (typeof (file) === 'string') {
      file = JSON.parse(file)
    }

    if (!file || !name || !type) {
      return res.status(400).json({ status: "error", message: "No file uploaded." });
    }
    const fileUpload = await uploadFile(file, name, type)
    return res.status(200).json({ status: "success", message: "file uploaded successfully" })
  } catch (error) {
    return res.status(500).json({ status: 'error', message: "error uploading the file" })
  }
}

export async function getFileService(req: Request, res: Response) {
  try {

    console.log('the query are', req.query.id)
    const fileId = req.query.id as string;

    if (!fileId) {
      return res.status(400).json({ status: "error", message: "No id provided for the file to be fetched." });
    }
    const file = await getFile(fileId)
    return res.status(200).send(file)
  } catch (error) {
    return res.status(500).json({ status: 'error', message: "error uploading the file" })
  }
}

// export const getFileFromGridFS = async (req: Request, res: Response) => {
//   try {
//     const fileId = req.query.id as string; // Assuming the file ID is passed as a parameter

//     const connection = mongoose.connection;
//     const bucket = new GridFSBucket(connection.db);
//     const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

//     const chunks: Buffer[] = [];
//     let fileSize = 0;

//     downloadStream.on("data", (chunk) => {
//       chunks.push(chunk);
//       fileSize += chunk.length;
//     });

//     downloadStream.on("error", (error) => {
//       console.error("Error downloading file", error);
//       res.status(500).json({ error: "An error occurred during file download" });
//     });

//     downloadStream.on("end", () => {
//       const buffer = Buffer.concat(chunks, fileSize);

//       // Use the `buffer` variable as needed, e.g., save it to a file or process it further
//       // For example, you can assign it to a variable:
//       const downloadData = buffer;
//       const array = new Uint8Array(downloadData)
//       res.status(200).send(`[${array}]`); // Send a response indicating download completion
//     });

//   } catch (error) {
//     console.error("Error downloading file", error);
//     return res.status(500).json({ error: "An error occured while fetching file" });
//   }
// };


export const downloadFiles = (req: Request, res: Response) => {
  const fileId = req.params.fileId;

  const bucket = new GridFSBucket(mongoose.connection.db);

  const downloadStream = bucket.openDownloadStream(new mongo.ObjectId(fileId));

  downloadStream.on('file', (file) => {
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': file.length,
      'Content-Disposition': `attachment; filename="${file.filename}"`,
    });

    downloadStream.pipe(res);
  });

  downloadStream.on('error', (error) => {
    console.error('Error downloading file', error);
    res.status(500).json({ error: 'An error occurred while downloading the file' });
  });
};



export const downloadFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId;
    const connection = mongoose.connection;
    const bucket = new GridFSBucket(connection.db);

    const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
    const writeStream = fs.createWriteStream('./outputFile');

    downloadStream.pipe(writeStream);

    writeStream.on('finish', () => {
      res.json({ message: 'File downloaded successfully.' });
    });

    writeStream.on('error', (error) => {
      console.error('Error downloading file', error);
      res.status(500).json({ error: 'An error occurred during file download' });
    });
  } catch (error) {
    console.error('Error downloading file', error);
    res.status(500).json({ error: 'An error occurred during file download' });
  }
};
