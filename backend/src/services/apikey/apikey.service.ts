import { Request, Response } from 'express';
import { createApiKey, deleteApikey, findApiKey, getApiKey, updateApiKey } from '../../repository/apikeys.repository';

interface UserRequest extends Request {
    user?: {
        company?: string;
        _id?: string;
    }
}

type ApiKeyData = {
    name: string;
    document?: string;
    type?: string;
    status: string;
    domain?: string;
    company?: string;
    user?: string;
    requestor?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;

}
type FindEKYC = {
    _id?: string;
    name?: string;
    document?: string;
    type?: string;
}

//adding ApiKey to document
export async function createApiKeyService(req: UserRequest, res: Response) {
    try {
        const data = req.body;
        const orgId = req.user.company
        const userId = req.user._id;
        if (!orgId) {
            throw new Error('User not logged in, please login');
        }
        if (!data) {
            return res.status(400).send({ message: 'No data provided for Apikey' });
        }
        data['company'] = orgId;
        data['user'] = userId;
        data["created_At"] = new Date();
        const apikey = await createApiKey(data);
        console.log(apikey);
        return res.status(200).json({ status: 'success', message: 'ApiKey is created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }

}

export async function updateApiKeyService(req: Request, res: Response): Promise<object | null> {
    try {
        const id = req.params.id;
        const updates = req.body;

        //*check if the kyc exists
        const ekyc = await findApiKey(id.toString());
        if (!ekyc) {
            return res.status(404).json({ status: 'error', message: `ApiKey not found.` });
        }
        // *Update the ekyc
        updates["updatedAt"] = new Date();
        const updatedApiKey = await updateApiKey(id, updates);
        console.log(updatedApiKey);
        return res.status(200).json({ status: 'success', message: 'ApiKey updated successfully' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error });
    }
}

export async function getAllApiKeySerivce(req: UserRequest, res: Response) {
    try {
        let { company } = req.user;
        let value = req.query.value as string || '';
        const ekycsWorkflow = await getApiKey();

        return res.status(200).send(ekycsWorkflow);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', message: error });
    }
}

//* ekyc delete services
export async function deleteApiKeyService(req: UserRequest, res: Response) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const ekyc = await findApiKey(id);
        if (!ekyc) {
            return res.status(404).json({ message: "ApiKey not found" });
        }

        await deleteApikey(id);

        return res
            .status(200)
            .json({ status: "success", message: "ApiKey is deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

