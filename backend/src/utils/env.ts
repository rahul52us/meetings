import dotenv from 'dotenv';

dotenv.config()

export const MONGODB_URI = process.env["MONGODB_URI"];

if (!MONGODB_URI) {
    console.log("No mongo connection string. Set MONGODB_URI environment variable.");
    process.exit(1);
}

export const FRONTEND_URL = process.env["FRONTEND_URL"];
if(!FRONTEND_URL) {
    console.log("No frontend url string. Set FRONTEND_URL environment variable.");
    process.exit(1);
}

export const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET) {
    console.log("No JWT secret string. Set JWT_SECRET environment variable.");
    process.exit(1);
}

export const JWT_ISSUER = process.env["JWT_ISSUER"];

if (!JWT_ISSUER) {
    console.log("No JWT secret string. Set JWT_ISSUER environment variable.");
    process.exit(1);
}

export const JWT_SUBJECT = process.env["JWT_SUBJECT"];

if (!JWT_SUBJECT) {
    console.log("No JWT secret string. Set JWT_SUBJECT environment variable.");
    process.exit(1);
}

export const JWT_AUDIENCE = process.env["JWT_AUDIENCE"];

if (!JWT_AUDIENCE) {
    console.log("No JWT secret string. Set JWT_AUDIENCE environment variable.");
    process.exit(1);
}

export const JWT_EXPIRESIN = process.env["JWT_EXPIRESIN"];

if (!JWT_EXPIRESIN) {
    console.log("No JWT secret string. Set JWT_EXPIRESIN environment variable.");
    process.exit(1);
}

export const JWT_ALGORITHM = process.env["JWT_ALGORITHM"];

if (!JWT_ALGORITHM) {
    console.log("No JWT secret string. Set JWT_ALGORITHM environment variable.");
    process.exit(1);
}

export const SMTP_HOST = process.env["SMTP_HOST"];

if (!SMTP_HOST) {
    console.log("No SMTP_HOST string. Set SMTP_HOST environment variable.");
    process.exit(1);
}

export const SMTP_PORT = process.env["SMTP_PORT"];

if (!SMTP_PORT) {
    console.log("No SMTP_PORT string. Set SMTP_PORT environment variable.");
    process.exit(1);
}

export const SMTP_USER = process.env["SMTP_USER"];

if (!SMTP_USER) {
    console.log("No SMTP_USER string. Set SMTP_USER environment variable.");
    process.exit(1);
}

export const SMTP_PASS = process.env["SMTP_PASS"];

if (!SMTP_PASS) {
    console.log("No SMTP_PASS string. Set SMTP_PASS environment variable.");
    process.exit(1);
}

export const SMTP_DEFAULT_TO_EMAIL = process.env["SMTP_DEFAULT_TO_EMAIL"];

if (!SMTP_PASS) {
    console.log("No SMTP_DEFAULT_TO_EMAIL string. Set SMTP_DEFAULT_TO_EMAIL environment variable.");
    process.exit(1);
}

export const WORKFLOW_URL = process.env["WORKFLOW_URL"];

if (!WORKFLOW_URL) {
    console.log("No WORKFLOW_URL string. Set WORKFLOW_URL environment variable.");
    process.exit(1);
}