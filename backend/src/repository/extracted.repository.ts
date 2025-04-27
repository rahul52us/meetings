import mongoose, { Document, Model, Schema } from "mongoose";
import Extracted, { IExtracted } from "../repository/schemas/extracted.schema";


export async function createExtracted(data: IExtracted) {
    try {
        const extracted: any =await Extracted.create(new Extracted(data));
        return extracted;
    } catch (err) {
        return new Error(err);
    }
}

export async function getExtracted(id: string) {
    return Extracted.findById(id).exec();
}