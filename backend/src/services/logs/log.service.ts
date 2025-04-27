import { createLog, getLogs } from "../../repository/log.repository";
import { Request, Response } from 'express';
interface UserRequest extends Request {
    user?: {
        company?: string;
        _id?: string;
    }
}

interface LogData {
    statuscode: number,
    message: string,
    type: string,
    created_At: string,
    company?: string,
    user?: string,
    logtype: string,
}

export async function createLogServiceBackend(req: UserRequest, statuscode: number, message: string, logtype: string) {
    try {
        let orgId, userId
        if (req.user) {
            orgId = req.user?.company
            userId = req.user?._id
        }
        let type;
        if (statuscode >= 200 && statuscode < 300) {
            type = 'info'
        } else if (statuscode >= 300 && statuscode < 400) {
            type = 'warning'
        } else if (statuscode >= 400) {
            type = 'error'
        }
        let logdata: any = {
            type: type,
            message: message,
            company: orgId,
            user: userId,
            logtype: logtype,
            statuscode: statuscode
        }
        // console.log(logdata);
        await createLog(logdata)
    } catch (err) {
        console.log(err)
    }
}
//     Creating a function that is calling create job for creating a new job
export async function createLogService(req: UserRequest, res: Response) {
    try {
        const data = req.body;
        const orgId = req.user.company
        const userID = req.user._id;
        if (!orgId) {
            throw new Error('User not logged in, please login');
        }
        data['company'] = orgId;
        data['user'] = userID;
        const log = await createLog(data);
        return res.status(200).json({ status: 'success', message: 'Log created successfully' });
    } catch (error) {
        console.log(error);
        return error;
    }
}

//     getting all the detils
export async function getLogService(req: UserRequest, res: Response) {
    try {
        let { company, _id } = req.user;
        let value = req.query.value as string || '';
        const log = await getLogs(value, company, _id);
        return res.status(200).send(log);
    }
    catch (error) {
        return res.status(500).json({ status: 'error', message: error });
    }
};
