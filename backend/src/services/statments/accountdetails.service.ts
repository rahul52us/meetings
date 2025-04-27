// import { createAccount, getAccount } from "~/repository/accountdetails.repository";
import { Request, Response } from 'express';


export async function createAccountService(req: Request, res: Response) {
    try {
        const data = req.body;
        const statement = await createAccount(data);
        return res.status(200).json({ status: 'success', message: 'Statement created successfully' });
    } catch (err) {
        throw new Error(`Error creating statement: ${err.message}`);
    }
}

export async function getAccountService(req: Request, res: Response) {
    try {
        let value = req.query.value as string || '';
        let sort = req.query.sort as string || null;
        let min = req.query.min as string || null;
        let limit = req.query.max as string || null;
        const details: any = await getAccount(value, sort, min, limit);
        return res.status(200).send(details);
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error });
    }
};
function createAccount(data: any) {
    throw new Error('Function not implemented.');
}

function getAccount(value: string, sort: string, min: string, limit: string): any {
    throw new Error('Function not implemented.');
}

