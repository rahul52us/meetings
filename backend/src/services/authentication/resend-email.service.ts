import { NextFunction, Request, Response } from 'express';

import {
    changeTokenStatus,
    createToken,
} from '../../repository/user_tokens.repository';

import { normalizeEmail } from '../../helpers/string.helper';

import type { UserProfile } from '../../repository/user.repository';

import generateRandomKey from '../../helpers/genarateRandomkey';
import compileEmailTemplate from '../../helpers/compile-email-template';
import sendMail from '../../libs/mail';
import { SEND_MAIL_TYPE } from '../../constants/send-mail-type.constant';

export async function resendEmailAction(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
        const type = req.body.type;
        const user = req.user as UserProfile;

        let template;
        let subject;
        const token = await generateRandomKey();
        switch (type) {
            case SEND_MAIL_TYPE.VERIFY_EMAIL:
                if (user.is_active) {
                    throw { status: 'error', message: 'Account is already verified' }
                }
                subject = 'Token has expired, new email to confirm your email address has been sent';
                template = await compileEmailTemplate({
                    fileName: 'verifyEmail.mjml',
                    data: {
                        name: user.name,
                        url: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
                    },
                });
                break;

            case SEND_MAIL_TYPE.FORGOT_PASSWORD:
                subject = 'Token has expired, new email to reset password has been sent';
                template = await compileEmailTemplate({
                    fileName: 'forgotPassword.mjml',
                    data: {
                        name: user.name,
                        url: `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`,
                    },
                });
                break;

            default:
                subject = 'Token has expired, new email to confirm your email address has been sent';
                template = await compileEmailTemplate({
                    fileName: 'verifyEmail.mjml',
                    data: {
                        name: user.name,
                        url: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
                    },
                });
                break;
        }

        await changeTokenStatus(null, type, false);
        await Promise.all([createToken(user._id, token, type), sendMail(normalizeEmail(user.email), subject, template)]);

        return res.status(300).json({  status: 'error', message: 'Email has been resended' })
    } catch (error) {
        return res.status(400).json({  status: 'error', message: error });
    }
}