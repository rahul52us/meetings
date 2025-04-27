import { NextFunction, Request, Response } from 'express';
import dayjs from 'dayjs';
import {
  findToken,
  changeTokenStatus
} from '../../repository/user_tokens.repository';
import { activeUser, findUser } from '../../repository/user.repository';

import { SEND_MAIL_TYPE } from '../../constants/send-mail-type.constant';

import sendMail from '../../libs/mail';
import compileEmailTemplate from '../../helpers/compile-email-template';

function isValidDate(createdAt: string): boolean {
  return dayjs(createdAt).add(15, 'minute').diff(dayjs()) > 0;
}

export type VerifyTokenRequest = Request & {
  query: {
    token: string;
  };
};

export async function verifyEmail(req: VerifyTokenRequest, res: Response, next: NextFunction):Promise<Response> {
  try {
    let user : any = null
    const authToken:string = req.query.token;
    const token = await findToken(authToken);
    if (!token || token.type !== SEND_MAIL_TYPE.VERIFY_EMAIL) {
      return res.status(300).json({  status: 'error', message: 'Invalid token' })
    }

    if (token) {
      user = await findUser({id: token.user_id});
      if(!user) {
        return res.status(300).json({  status: 'error', message: 'User not found' })
      }
      req.user = user
      req.body.type = token.type
    }

    // if (!isValidDate(token.created_at)) {
    //   user = await findUser({id: token.user_id});
    //   if(!user) {
    //     return res.status(300).json({  status: 'error', message: 'User not found' })
    //   }
    //   req.user = user
    //   req.body.type = token.type
    //   return resendEmailAction(req, res, next);
    // }

    const template = await compileEmailTemplate({
      fileName: 'verifySuccessEmail.mjml',
      data: {
        name : user?.username,
        url: `${process.env.FRONTEND_URL}/login`,
      },
    });


    await Promise.all([changeTokenStatus(token.id, token.type, false), activeUser(token.user_id),
      sendMail(user?.username, 'Email Verify Successfully', template),
    ]);

    return res.status(200).json({  status: 'success', message: 'Email has been verified successfully' })
  } catch (error) {
    return res.status(400).json({  status: 'error', message: error })
  }
}


