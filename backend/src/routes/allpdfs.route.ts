import { Router } from "express";
import { createPDFService, deletePDFService, getAllPDFsService, updatePDFService } from "../services/allpdfs.service";


const router = Router();

router.post("/", createPDFService);
router.get("/", getAllPDFsService);
router.put("/:id", updatePDFService);
router.delete("/:id", deletePDFService);

export default router;
