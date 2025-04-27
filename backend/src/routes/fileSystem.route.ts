import express from 'express'
import { uploadFileService, getFileService, downloadFile } from '../services/fileSystem/fileSystem.service'


const FileUpload = express()

// route.post('/upload-file',uploadFileWithMulter)


FileUpload.post('/upload', uploadFileService)

FileUpload.get('/getfile', getFileService)

FileUpload.get('/downloadfile/:fileId', downloadFile);


export default FileUpload