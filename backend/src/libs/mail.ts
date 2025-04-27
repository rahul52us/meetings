import nodemailer from 'nodemailer'
import Sentry from '@sentry/node';

import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_DEFAULT_TO_EMAIL } from '../utils/env';

let config:object = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // Set to true for SSL, false for TLS
  // secure: true, //ssl
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
}

const mailTransport = nodemailer.createTransport(config);

export default async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    mailTransport.sendMail({
      from: SMTP_DEFAULT_TO_EMAIL,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    Sentry.captureException(error);
    return true;
  }
}
