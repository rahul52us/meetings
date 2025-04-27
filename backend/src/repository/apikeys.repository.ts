import Apikey from './schemas/apikeys.schems';
import mongoose from 'mongoose';

type ApiKeyData = {
    company?: string;
    user?: string;
    key: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
};
type ApikeyQuery = {
    user?: string;
    company?: string;
};

/**
 * Create a new apikey in the database
 * @param {ApiKeyData} data
 * @returns {Promise<string>} inserted document _id
 */
export async function createApiKey(data: ApiKeyData): Promise<any> {
    try {
        const apikey = new Apikey(data);
        const result = await apikey.save();
        return result._id;
    } catch (error) {
        return new Error(error);
    }
}

/**
 * Retrieve all notifications for a user by their user id
 * @param {string} userId
 * @param {boolean} read - optional flag to filter by read/unread status
 * @returns {Promise<NotificationData[]>} array of notification objects
 */
export async function getApiKey(): Promise<any> {
    try {
        const pipeline = [
            {
                $match: {
                    // id: 'pipeline',
                    deletedAt: { $exists: false }
                }
            }
        ];
        return Apikey.aggregate(pipeline)
            .exec()
            .then((result) => {
                return result;
            }).catch((err) => { return err });
    }
    catch (error) {
        console.log(error);
        return new Error("Error while getting unread notification");
    }
}



/**
 * Find a single notification in mongodb in Notification collection
 * @param {string} id
 */
export async function findApiKey(id: string): Promise<any> {
    try {
        const apikey = await Apikey.findById(id);
        return apikey;
    } catch (error) {
        return new Error(error);
    }
}

/**
// * Update a notification by its _id
// * @param {string} id - the _id of the notification to update
// * @param {NotificationUpdateData} updateData - the new data to update the notification with
// * @returns {Promise<void>}
*/
export async function updateApiKey(id: string, updateData: ApiKeyData): Promise<any> {
    try {
        await Apikey.updateOne({ _id: id }, updateData);
    } catch (error) {
        return new Error(error);
    }
}

export async function deleteApikey(id: string): Promise<any> {
    try {
        const apikey = await Apikey.updateOne({ _id: id }, { $set: { deletedAt: new Date() } });
        return apikey;
    } catch (error) {
        return new Error(error);
    }
}


