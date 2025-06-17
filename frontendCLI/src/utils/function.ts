export const maskAadhaar = (aadhar?: string): string => {
    if (!aadhar || typeof aadhar !== "string" || aadhar?.length < 4) {
      return "NA";
    }
    return `XXXX-XXXX-${aadhar.slice(-4)}`;
  };
  export function replaceLabelValueObjects(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => replaceLabelValueObjects(item));
    } else if (obj !== null && typeof obj === 'object') {
      // Check if it's exactly a { label, value } object
      const keys = Object.keys(obj);
      if (
        keys.length === 2 &&
        keys.includes('label') &&
        keys.includes('value') &&
        typeof obj.label === 'string'
      ) {
        return obj.value;
      }

      // Otherwise, recursively process the object
      const newObj: Record<string, any> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          newObj[key] = replaceLabelValueObjects(obj[key]);
        }
      }
      return newObj;
    }

    return obj; // Return primitive value as-is
  }