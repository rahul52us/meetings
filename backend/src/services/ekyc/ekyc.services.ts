import { createEkyc, updateEkyc, getEkycById, deleteEkycById, getAllEkyc } from '../../repository/ekyc.repository';
import { Request, Response } from 'express';

interface UserRequest extends Request {
    user?: {
        company?: string;
        _id?: string;
        type?: string;
    }
}

type EKYCProfile = {
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



//adding ekyc to document
export async function createEkycService(req: UserRequest, res: Response) {
    try {
        const data = req.body;
        const orgId = req.user.company
        const userId = req.user._id;
        if (!orgId) {
            throw new Error('User not logged in, please login');
        }
        if (!data) {
            return res.status(400).send({ message: 'No data provided for EkycsWorkflow' });
        }
        data['company'] = orgId;
        data['user'] = userId;
        const ekyc = await createEkyc(data);

        return res.status(200).json({ status: 'success', message: 'Ekyc is created successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }

}

export async function updateEkycService(req: Request, res: Response): Promise<object | null> {
    try {
        const id = req.params.id;
        const updates = req.body;

        //*check if the kyc exists
        const ekyc = await getEkycById(id.toString());
        if (!ekyc) {
            return res.status(404).json({ status: 'error', message: `Ekyc not found.` });
        }
        // *Update the ekyc
        updates["updatedAt"] = new Date();
        const updatedEkycs = await updateEkyc(id, updates);
        console.log(updatedEkycs);
        return res.status(200).json({ status: 'success', message: 'Ekyc updated successfully' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: error });
    }
}

export async function getAllEkycSerivce(req: UserRequest, res: Response) {
    try {
        let { company } = req.user;
        let value = req.query.value as string || '';
        let sort = req.query.sort as string || null;
        let limit = req.query.limit as string || '10';
        let page = req.query.page as string || '1';
        const ekycsWorkflow: any = await getAllEkyc(value, company, sort, limit, page);

        return res.status(200).send(ekycsWorkflow);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 'error', message: error });
    }
}


//* ekyc delete services
export async function deleteEkycService(req: UserRequest, res: Response) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "ID is required" });
        }

        const ekyc = await getEkycById(id);
        if (!ekyc) {
            return res.status(404).json({ message: "Ekyc not found" });
        }

        await deleteEkycById(id);

        return res
            .status(200)
            .json({ status: "success", message: "Ekyc is deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
}

