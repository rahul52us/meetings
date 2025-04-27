import Log, { ILog } from '../repository/schemas/log.schema';

export type LogsProfile = {
    _id?: string;
    message: string;
    logtype: string;
    statuscode?: number;
    type: string;
    created_At?: string;
    company?: string;
    user?: string;
}

//  Create a log
export async function createLog(LogsProfile: LogsProfile): Promise<any> {
    try {
        const newLog = await Log.create(new Log(LogsProfile));
        return newLog;
    } catch (error) {
        return error
    }
}

// function for getting all logs
export async function getLogs(searchValue: string, company: string, userId: string) {
    try {
        const pipeline = [
            {
                '$match': {
                    'deletedAt': { '$exists': false },
                    'company': company,
                    'user': userId,
                }
            }
        ]
        return Log.aggregate(pipeline)
            .exec()
            .then((result) => {
                return result;
            }).catch((err) => { return err });
    } catch (error) {
        return new Error(error);
    }
}
