import { Request, Response } from "express";
import {
  createPDF,
  getAllPDFs,
  getPDF,
  deletePDF,
  updatePDF,
} from "../repository/allpdfs.repository";
import { createLogServiceBackend } from "./logs/log.service";

interface UserRequest extends Request {
  user?: {
    company?: string;
    _id?: string;
    role?: string;
  };
}

export async function createPDFService(req: UserRequest, res: Response) {
  try {
    let { values } = req?.body;
    values["createdBy"] = req?.user?._id;
    values["company"] = req?.user?.company;

    if (!req?.user?._id || !req?.user?.company) {
      await createLogServiceBackend(
        req,
        200,
        "User not logged in or missing company ID",
        "PDF"
      );
      return res.status(400).json({
        status: "error",
        message: "User not logged in or missing company ID",
      });
    }

    const result = await createPDF(values);
    return res.status(200).send(result);
  } catch (error) {
    throw error;
  }
}

export async function getAllPDFsService(req: UserRequest, res: Response) {
  try {
    const { company } = req.user;
    const sort = (req.query.sort as string) || null;
    const page = (req.query.page as string) || "1";
    const limit = (req.query.limit as string) || null;
    const value = (req.query.value as string) || "";

    const result = await getAllPDFs(company, value, sort, page, limit);
    await createLogServiceBackend(
      req,
      400,
      "Get all PDFs executed successfully",
      "PDF"
    );
    return res.status(200).send(result);
  } catch (error: any) {
    res.status(500).send({ message: error, status: "error" });
  }
}

export async function updatePDFService(req: UserRequest, res: Response) {
  try {
    const id = req.params.id;
    const updates = req.body.values.values;
    const pdf = await getPDF(id);
    if (pdf.status === "error") {
      await createLogServiceBackend(
        req,
        200,
        "PDF not found",
        "PDF"
      );
      return res.status(404).json({
        status: "error",
        message: `PDF not found.`,
      });
    }

    updates["updatedAt"] = new Date();

    const result = await updatePDF(id, updates);
    await createLogServiceBackend(
      req,
      200,
      "PDF updated successfully",
      "PDF"
    );
    return res.status(200).send(result);
  } catch (error) {
    await createLogServiceBackend(
      req,
      200,
      "Failed to update the PDF",
      "PDF"
    );
    return res.status(500).json({
      status: "error",
      message: error,
    });
  }
}

export async function deletePDFService(req: UserRequest, res: Response) {
  try {
    const { id } = req.params;
    const pdf = await getPDF(id);
    if (pdf.status === "error") {
      await createLogServiceBackend(
        req,
        200,
        "PDF not found",
        "PDF"
      );
      return res.status(404).json({
        status: "error",
        message: "PDF not found",
      });
    }

    await deletePDF(id);
    await createLogServiceBackend(
      req,
      400,
      "PDF deleted successfully",
      "PDF"
    );

    return res.status(200).json({
      status: "success",
      message: `PDF has been deleted.`,
    });
  } catch (error) {
    await createLogServiceBackend(
      req,
      200,
      "Failed to delete the PDF",
      "PDF"
    );
    return res.status(500).json({
      status: "error",
      message: error,
    });
  }
}
