import { PDFModel } from "./schemas/allpdfs.schema";

export async function createPDF(values:any) {
  const pdf = new PDFModel(values);
  await pdf.save();
  return { status: 'success', data: pdf };
}

export async function getAllPDFs(company: string, value: string | RegExp, sort: string, page: string, limit: string) {
  const query = { company, title: new RegExp(value, 'i') };
  const options = {
    sort: sort ? { [sort]: 1 } : {},
    page: parseInt(page, 10),
    limit: parseInt(limit, 10) || 10,
  };

//   const result = await PDFModel.paginate(query, options);
//   return { status: 'success', data: result };
}

export async function getPDF(id:any) {
  const pdf = await PDFModel.findById(id);
  return pdf ? { status: 'success', data: pdf } : { status: 'error', data: null };
}

export async function deletePDF(id:any) {
  await PDFModel.findByIdAndDelete(id);
  return { status: 'success' };
}

export async function updatePDF(id: any, updates:any) {
  const pdf = await PDFModel.findByIdAndUpdate(id, updates, { new: true });
  return pdf ? { status: 'success', data: pdf } : { status: 'error', data: null };
}
