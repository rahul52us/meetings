import { Request, Response, NextFunction } from 'express';
import ApiKey from '../../repository/schemas/apikeys.schems';
import Account from '../../repository/schemas/accounts.schema';

interface UserRequest extends Request {
    user?: {
        _id: string;
    }
}

export const checkApiKey = async (req: UserRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { key } = req.params;
        const apiKeyData = await ApiKey.findOne({ key }).exec();
        if (apiKeyData && apiKeyData.key === key) {
            const user = await Account.findOne({ _id: apiKeyData.user });
            req.user = user;
            return next();
        }
        else {
            res.status(404).json({ message: 'API key not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to check API key' });
    }
};
