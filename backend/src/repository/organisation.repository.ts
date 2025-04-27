import Organisation from "./schemas/organisation.schema";
import mongoose from "mongoose";

type OrgProfile = {
  name: string;
  domain: string;
  type?: string;
  gstin?: string;
  pan?: string;
  license: object;
};

type findOrg = {
  id?: string;
  domain?: string;
  pan?: string;
  gstin?: string;
};

/**
 * Find organisation in MongoDB in Organisation collection
 * @param {findOrg} params - Search parameters
 * @returns {Promise<object | null>} - Found organisation or null
 */
export async function findOrg(params: findOrg): Promise<object | null> {
  const { id, domain, pan, gstin } = params;
  const search: any = {};

  if (id) search._id = new mongoose.Types.ObjectId(id);
  if (domain) search.domain = domain;
  if (pan) search.pan = pan;
  if (gstin) search.gstin = gstin;
 

  const org = await Organisation.findOne(search).exec();
  return org;
}

/**
 * Create organisation in MongoDB in Organisation collection
 * @param {OrgProfile} orgData - Organisation data
 * @returns {Promise<string | Error>} - ID of the created organisation or an error
 */
export async function createOrg(orgData: OrgProfile): Promise<string | Error> {
  try {
    const org = new Organisation({ ...orgData });
    await org.save();
    return org._id.toString();
  } catch (error) {
    return new Error(error.message);
  }
}

/**
 * Update organisation profile in MongoDB in Organisation collection
 * @param {string} id - Organisation ID
 * @param {OrgProfile} data - Organisation data to update
 * @returns {Promise<object | Error>} - Updated organisation or an error
 */
export async function updateOrg(
  id: string,
  data: OrgProfile
): Promise<object | Error> {
  try {
    const org = await Organisation.findByIdAndUpdate(id, data, {
      new: true,
    }).exec();
    if (!org) {
      return new Error("Organisation not found");
    }
    return org;
  } catch (error) {
    return new Error(error.message);
  }
}
