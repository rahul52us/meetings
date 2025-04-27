import axios from "axios";

export function findValueByKey(obj: any, key: string): any {
    for (let k in obj) {
        if (typeof obj[k] === 'object' && obj[k] !== null) {
            let result = findValueByKey(obj[k], key);
            if (result) {
                return result;
            }
        } else if (k.replace(' ','').toLowerCase() === key.replace(' ','').toLowerCase()) {
            return obj[k];
        }
    }
    return null;
}

export const sendTriggerRequest = async (url: string, payload: any, token: string) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        const response = await axios.post(url, payload,  { headers: headers });
        return {
            status : 'success',
            data : response.data
        }
    } catch (error) {
        return {
            status : 'error',
            data : error?.message
        }
    }
}