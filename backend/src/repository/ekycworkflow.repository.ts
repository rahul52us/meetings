import mongoose from "mongoose";
import Ekycworkflow from "./schemas/ekycworkflow.schema";

type EkycworkflowProfile = {
  _id?: string;
  name: string;
  description?: string;
  sample?: string;
  identifier?: string;
  fields: string;
  master: string;
  steps?: object[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
};

type FindEKYC = {
  id?: string;
  name?: string;
  description?: string;
  type?: string;
};
/**
 * Create an eKYC document
 * @param {EkycWorkflowProfile} ekycData
 * @returns {Promise<string|Error>} The ID of the created eKYC document or an error object
 */
export async function createEkycWorkflow(
  ekycData: EkycworkflowProfile
): Promise<mongoose.Types.ObjectId | Error> {
  try {
    const ekyc = await Ekycworkflow.create({ ...ekycData });
    const ekycId = ekyc.id.toString();
    return ekycId;
  } catch (error) {
    return new Error(error);
  }
}
/**
 * Update an eKYC document by ID
 * @param {string} id The ID of the eKYC document to update
 * @param {EkycworkflowProfile} data The updated eKYC data
 * @returns {Promise<object>} The updated eKYC document
 */
export async function updateEKYCWorkflow(
  id: string,
  data: EkycworkflowProfile
): Promise<object | null> {
  try {
    const ekyc = await Ekycworkflow.findByIdAndUpdate(id, data);
    return ekyc;
  } catch (error) {
    return new Error(error);
  }
}

/**
 * Find an eKYC document by ID or document number
 * @param {FindEKYC} {id?: string, document?: string}
 * @returns {Promise<object>} The eKYC document
 */
export async function findEKYC({
  id,
  name,
  description,
  type,
}: FindEKYC): Promise<object | null> {
  let search = {};
  if (id) search = { _id: new mongoose.Types.ObjectId(id) };
  if (name) search = { name: name };
  if (document) search = { document: document };
  if (type) search = { type: type };
  const ekyc = await Ekycworkflow.findOne(search);
  return ekyc;
}

/**
 * View an eKYC document by ID
 * @param {string} id The ID of the eKYC document to retrieve
 * @returns {Promise<object>} The eKYC document
 */
export async function viewEkyc(id: string): Promise<object> {
  try {
    const ekyc = await Ekycworkflow.findById(id);
    return ekyc;
  } catch (error) {
    return new Error(error);
  }
}

// /**
//  * Get all eKYC profiles from MongoDB in Ekyc collection
//  * @returns {Promise<object[]>} - Returns an array of all eKYC profiles
//  */
// export async function getAllEkycWorkflow(): Promise<object[]> {
//     const ekycs = await Ekycworkflow.find();
//     return ekycs;
// }
export async function getAllEkycWorkflow(
  searchValue: string,
  company: string,
  userId: string,
  sort: string | null = "1",
  page: string | null = "1",
  limit: string | null = "10",
  
) {
  
  try {
    console.log(page);
   
    const pipeline = [
      {
        $match: {
          name: { $regex: searchValue, $options: "i" }, //, '$options': 'i'
          deletedAt: { $exists: false }, //{ '$exists': false },
          company: company,
          user: userId,
        },
      },
    ];
    if (limit && page) {
        const skip = (parseInt(page) - 1) * parseInt(limit);
        pipeline.push(
          // { $sort: { [sort]: 1 } } as any,
          { $skip: skip } as any,
          { $limit: parseInt(limit) } as any
        );
      }

      const [kycData, totalCount] = await Promise.all([
        Ekycworkflow.aggregate(pipeline),
        Ekycworkflow.countDocuments({
          deletedAt: { $exists: false },
        }),
      ]);
  
      let totalPages = 1;
      if (limit) {
        totalPages = Math.ceil(totalCount / parseInt(limit));
      }
  
      return {
        data: kycData,
        totalPages,
      };
  
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
}
export async function getAllEkycWorkflows(
  searchValue: string,
  company: string,
  user: string,
  role: string
) {
  try {
    let idSearch: object = { user: user };
    if (role === "admin") {
      idSearch = { company: company };
    }
    const pipeline = [
      {
        $match: {
          name: { $regex: searchValue, $options: "i" }, //, '$options': 'i'
          deletedAt: { $exists: false }, //{ '$exists': false },
          ...idSearch,
          // 'user': userId
        },
      },
    ];
    return Ekycworkflow.aggregate(pipeline)
      .exec()
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
}

/**
 * Get eKYC profile by ID from MongoDB in Ekyc collection
 * @param {string} id - eKYC profile ID
 * @returns {Promise<object|null>} - Returns eKYC profile object if found, otherwise null
 */
export async function getEkycWorkflow(id: string): Promise<object | null> {
  try {
    const ekyc = await Ekycworkflow.findById({ _id: id });
    return ekyc;
  } catch (error) {
    console.log(error);
    return new Error(error);
  }
}

//* delete ekyc
export async function deleteEkycWorkflow(id: string): Promise<any> {
  try {
    const ekycsworkflow = await Ekycworkflow.updateOne(
      { _id: id },
      { $set: { deletedAt: new Date() } }
    );
    return ekycsworkflow;
  } catch (error) {
    return new Error(error);
  }
}
