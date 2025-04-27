import Log from '../repository/schemas/log.schema';

export const addLogger = async (message: any) => {
    try {
        const log = new Log({ message });
        await log.save();
        console.log('Log saved successfully:', message);
    } catch (err) {
        console.error('Error saving log:', err);
    }
};
