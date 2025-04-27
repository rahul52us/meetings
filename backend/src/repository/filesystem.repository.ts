import mongoose, { connection, mongo } from "mongoose";
import { Readable } from "stream";

import fileSystemSchema from "../repository/schemas/fileSystem.schema";
const { GridFSBucket } = mongo;

export async function uploadFile(file: string, name: string, type: string) {
  return new Promise((resolve, reject) => {
    try {
      const connection = mongoose.connection;
      const bucket = new GridFSBucket(connection.db);

      const base64Data = file.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      const uploadStream = bucket.openUploadStream(name, {
        metadata: { contentType: type },
      });

      readableStream.pipe(uploadStream);

      uploadStream.on("finish", () => {
        const fileId = uploadStream.id;
        fileSystemSchema
          .create({
            fileId: fileId,
          })
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            reject("File metadata saving failed");
          });
      });

      uploadStream.on("error", (error) => {
        reject("Error uploading file: " + error.message);
      });
    } catch (err) {
      reject("Error uploading the file: " + err.message);
    }
  });
}

export async function getFile(id: string) {
  return new Promise((resolve, reject) => {
    try {
      const connection = mongoose.connection;
      const bucket = new GridFSBucket(connection.db);
      const downloadStream = bucket.openDownloadStream(
        new mongoose.Types.ObjectId(id)
      );

      const chunks: Buffer[] = [];
      let fileSize = 0;

      downloadStream.on("data", (chunk) => {
        chunks.push(chunk);
        fileSize += chunk.length;
      });

      downloadStream.on("error", (error) => {
        reject("An error occured while fetching file");
      });

      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks, fileSize);

        // Use the `buffer` variable as needed, e.g., save it to a file or process it further
        // For example, you can assign it to a variable:
        const downloadData = buffer;
        const array = new Uint8Array(downloadData);
        resolve(`[${array}]`);
      });
    } catch (err) {
      reject("Error Getting the file");
    }
  });
}

export async function getFileData(id: string) {
  return new Promise((resolve, reject) => {
    try {
      const connection = mongoose.connection;
      const bucket = new GridFSBucket(connection.db);
      const downloadStream = bucket.openDownloadStream(
        new mongoose.Types.ObjectId(id)
      );

      const chunks: Buffer[] = [];
      let fileSize = 0;

      // Fetch the file's metadata from fs.files
      connection.db
        .collection("fs.files")
        .findOne({ _id: new mongoose.Types.ObjectId(id) })
        .then((fileInfo) => {
          if (!fileInfo) {
            return reject("File not found");
          }

          // Extract metadata
          const { filename, length, metadata } = fileInfo;
          const contentType = metadata?.contentType || "unknown"; // Accessing contentType from metadata

          downloadStream.on("data", (chunk) => {
            chunks.push(chunk);
            fileSize += chunk.length;
          });

          downloadStream.on("error", () => {
            reject("An error occurred while fetching the file");
          });

          downloadStream.on("end", () => {
            const buffer = Buffer.concat(chunks, fileSize);

            // Encode the buffer to Base64
            const base64Data = buffer.toString("base64");
            const base64WithPrefix = `data:${contentType};base64,${base64Data}`;

            // Return an object containing file metadata and data
            resolve({
              fileId: id,
              name: filename,
              type: contentType,
              fileSize: length,
              file: base64WithPrefix,
            });
          });
        })
        .catch(() => {
          reject("Error fetching file metadata");
        });
    } catch (err) {
      reject("Error Getting the file");
    }
  });
}
