export const maskAadhaar = (aadhar: string) =>
    aadhar ? `XXXX-XXXX-${aadhar.slice(-4)}` : "NA";
