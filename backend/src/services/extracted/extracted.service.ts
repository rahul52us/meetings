import { Request, Response } from "express";
import {
  createExtracted,
  getExtracted,
} from "../../repository/extracted.repository";
import axios from "axios";
import fs from "fs";
import path from "path";
import * as dotenv from 'dotenv';
dotenv.config();

export async function saveExtractedService(req: Request, res: Response) {
  try {
    const data = req.body;
    await createExtracted(data);
    return res.status(200).json({
      status: "success",
      message: "Extracted Data Saved Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Error Saving the extracted data" });
  }
}

export async function getExtractedService(req: Request, res: Response) {
  try {
    const id = (req.query.id as string) || "";
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Extracted data to be fetched id not provided",
      });
    }
    const extracted = await getExtracted(id);
    return res.status(200).send(extracted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Error Getting the extracted data" });
  }
}

export async function ExtractDataService(req: Request, res: Response) {
  try {
    let { file, type } = req.body;
    if (!file || !type) {
      return res.status(400).json({ status: "error", message: "File or Type missing" });
    }

    file = file.replace(/\s+/g, '');

    let schema = {};
    let schemaPath: string;

    switch (type) {
      case "aadhaar":
        schemaPath = path.join(__dirname, "schema", "aadhaar.schema.json");
        break;
      case "visiting":
        schemaPath = path.join(__dirname, "schema", "visiting.schema.json");
        break;
      default:
        return res.status(400).json({ status: "error", message: "Invalid document type" });
    }

    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    schema = JSON.parse(schemaContent);

    const input = {
      file: file,
      settings: {
        pages: "1-500",
        dpi: 200,
        ocr: {
          extract: true,
          multilingual: false,
          fields: {
            extract: true,
            filter: false,
            model: "engine3",
          },
          table: {
            extract: false,
            include: false,
            validate: true,
            json: true,
          },
          paragraphs: {
            json: false,
          },
          localization: {
            translate: false,
            language: "english",
            model: "engine1",
          },
        },
        barcode: {
          extract: false,
        },
        signature: {
          extract: false,
          crop: true,
        },
      },
      schema: schema,
      version: "3.0.0",
      key: "",
    };

    const response = await axios.post(
      `${process.env.SEQUEL_DOC_API_URL}?code=${process.env.SEQUEL_DOC_API_KEY}`,
      input,
      {
        timeout: 120000,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (response.status !== 200) {
      console.error(response?.data);
      return res.status(400).json({ status: "error", message: "Error extracting data" });
    }

    return res.status(200).json({ data: response.data, status: "success" });
  } catch (error: any) {
    console.error(error?.response?.data || error?.message || error);
    return res.status(500).json({ status: "error", message: "Error while processing document" });
  }
}
