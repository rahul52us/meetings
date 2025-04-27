import mongoose from "mongoose";
import Ekyc from "./schemas/ekyc.schema";

type EkycProfile = {
  name: string;
  domain: string;
  requestor: string;
  user?: string;
  status: string;
  sample: string;
  updatedAt?: string;
};

type FindEKYC = {
  id?: string;
  name?: string;
  document?: string;
  type?: string;
};
/**
 * Create an eKYC document
 * @param {EkycProfile} ekycData
 * @returns {Promise<string|Error>} The ID of the created eKYC document or an error object
 */
export async function createEkyc(
  ekycData: EkycProfile
): Promise<mongoose.Types.ObjectId | Error> {
  try {
    const ekyc = await Ekyc.create({ ...ekycData });
    const ekycId = ekyc.id.toString();
    return ekycId;
  } catch (error) {
    return new Error(error);
  }
}

/**
 * Update an eKYC document by ID
 * @param {string} id The ID of the eKYC document to update
 * @param {EkycProfile} data The updated eKYC data
 * @returns {Promise<object>} The updated eKYC document
 */
export async function updateEkyc(
  id: string,
  data: EkycProfile
): Promise<object | null> {
  try {
    const ekyc = await Ekyc.findByIdAndUpdate(id, data);
    console.log(ekyc);
    return ekyc;
  } catch (error) {
    return new Error(error);
  }
}

export async function getAllEkyc(
  searchValue: string,
  company: string,
  sort: string | null = "1",
  page: string | null = "1",
  limit: string | null = "10",
) {
  try {
    const pipeline = [
      // The first stage of the aggregation pipeline is a $match stage, which filters the documents based on certain conditions.
      {
        $match: {
          // The 'name' field should match the given searchValue using a case-insensitive regex.
          name: { $regex: searchValue, $options: "i" },
          // The 'deletedAt' field should either not exist or should be set to false, meaning the document is not deleted.
          deletedAt: { $exists: false },
          // The 'company' field should match the given company parameter.
          company: company,
        },
      },
    ];
    // Use the pipeline to perform the aggregation on the Ekycworkflow collection and return the result.

    if (limit && page) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push(
          // { $sort: { [sort]: 1 } } as any,
          { $skip: skip } as any,
          { $limit: parseInt(limit) } as any
        );
      }

      const [ekycData, totalCount] = await Promise.all([
        Ekyc.aggregate(pipeline),
        Ekyc.countDocuments({
          deletedAt: { $exists: false },
        }),
      ]);
  
      let totalPages = 1;
      if (limit) {
        totalPages = Math.ceil(totalCount / parseInt(limit));
      }
  
      return {
        data: ekycData,
        totalPages,
      };
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
}

/**
 * Find an eKYC document by ID or document number
 * @param {findEkyc} {id?: string, document?: string}
 * @returns {Promise<object>} The eKYC document
 */
export async function findEKYC({
  id,
  name,
  document,
  type,
}: FindEKYC): Promise<object | null> {
  let search = {};
  if (id) search = { _id: new mongoose.Types.ObjectId(id) };
  if (name) search = { name: name };
  if (document) search = { document: document };
  if (type) search = { type: type };
  const ekyc = await Ekyc.findOne(search);
  return ekyc;
}

export async function getkyc(id: string) {
  try {
    const ekycs = await Ekyc.findById(id);
    return ekycs;
  } catch (error) {
    return new Error(error);
  }
}
//* delete ekyc
export async function deleteEkycById(id: string): Promise<any> {
  try {
    const ekycs = await Ekyc.updateOne(
      { _id: id },
      { $set: { deletedAt: new Date() } }
    );
    return ekycs;
  } catch (error) {
    return new Error(error);
  }
}

/**
 * Get an eKYC document by ID
 * @param {string} id The ID of the eKYC document to retrieve
 * @returns {Promise<object>} The retrieved eKYC document
 */
export async function getEkycById(id: string): Promise<object> {
  try {
    const ekyc = await Ekyc.findById(id);
    if (!ekyc) {
      throw new Error("eKYC document not found");
    }
    return ekyc;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve eKYC document");
  }
}
