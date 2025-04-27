import express from "express";
import { authenticateJWT } from "../controllers/auth.controller";
import {
  getPdfDetailService,
  updatePdfDetailService,
  createPdfDetailService,
  getAllFolderService,
  createFolderService,
  deleteFolderService,
  deleteFileService,
  getTotalPdfService,
  getPdfDetailByIdService,
  getPdfCreationChartService,
  getExtractedPdfDetailsService,
  updatePdfStatusService,
  updateWorkflowStatusService,
  updatePdfDetailExtractedDataService,
} from "../services/pdfdetails.service";

const Pdfdetails = express.Router();

Pdfdetails.get("/", getAllFolderService);

Pdfdetails.post("/folder/create", authenticateJWT, createFolderService);

Pdfdetails.get("/folder/get",authenticateJWT, getAllFolderService);

Pdfdetails.get("/get", authenticateJWT, getPdfDetailService);

Pdfdetails.get("/get/ExtractedFiles", authenticateJWT, getExtractedPdfDetailsService);

Pdfdetails.post("/save", authenticateJWT, updatePdfDetailService);

Pdfdetails.post("/create", authenticateJWT, createPdfDetailService);

Pdfdetails.put('/updateExtracedData/:id',authenticateJWT,updatePdfDetailExtractedDataService)

Pdfdetails.put("/update/:id", authenticateJWT, updatePdfDetailService);

Pdfdetails.post("/updateStatus", authenticateJWT, updatePdfStatusService);

Pdfdetails.post("/updateWorkflow", authenticateJWT, updateWorkflowStatusService);

Pdfdetails.get("/getById", authenticateJWT, getPdfDetailByIdService);

Pdfdetails.delete("/:id", authenticateJWT, deleteFolderService);

Pdfdetails.delete("/file/:id", authenticateJWT, deleteFileService);

Pdfdetails.get("/totalPdf", authenticateJWT, getTotalPdfService);

Pdfdetails.get(
  "/pdfCreationChart",
  authenticateJWT,
  getPdfCreationChartService
);

export default Pdfdetails;
