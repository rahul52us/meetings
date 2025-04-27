import { Request, NextFunction } from "express";
import grantaccess from "./grantaccess.json";
import fs from "fs";
interface GrantAccess {
    [key: string]: {
        [key: string]: string;
    }
}
const grant: GrantAccess = grantaccess

interface UserRequest extends Request {
    user?: {
        permission: string[],
        role: "string",
    }
}
export function grantAccess(action: string, object: string) {
    return async (req: UserRequest, res: any, next: NextFunction,) => {
        // const grantaccess = JSON.parse(fs.readFileSync('grantaccess.json', 'utf-8'))
        const { user } = req;

        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        let access = grant[object][action];
        if (!access) {
            return res.status(401).json({ status: "error", message: "route not found" });
        }
        const { role, permission } = user;
        let allowed: boolean;
        try {
            allowed = (permission.filter((value: string) => value.includes(access)).length > 0)
            if (allowed === true) {
                return next();
            }
            else {
                if (!user) {
                    return res.status(401).json({ status: "error", message: "unauthorized access user not found" });
                } else {
                    return res.status(401).json({ status: "error", message: "unauthorized access for roles & permission" });
                }
            };
        } catch (error) {

        }

    }

}






