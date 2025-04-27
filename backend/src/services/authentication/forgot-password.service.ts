import { Request, Response, NextFunction } from 'express';

import { findUser, getUserByIdAndJoinUserToken } from '../../repository/user.repository';
import generateRandomKey from '../../helpers/genarateRandomkey';
import { createToken, updateUserTokenById } from '../../repository/user_tokens.repository';
import sendMail from '../../libs/mail';
import compileEmailTemplate from '../../helpers/compile-email-template';
import { SEND_MAIL_TYPE } from '../../constants/send-mail-type.constant';

export async function forgotPasswordUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { email } = req.body;
    const user = await findUser({ email });
    if (!user || !user._id) {
      return res.status(300).json({ status:'error', message: "User doesn't exist" })
    }

    let session = await getUserByIdAndJoinUserToken(user._id, SEND_MAIL_TYPE.FORGOT_PASSWORD);

    const tokenGenerated = await generateRandomKey();
    const token = `${tokenGenerated}-${user.id}`;
    if (!session) {
      await createToken(user._id, token, SEND_MAIL_TYPE.FORGOT_PASSWORD);
      session = {
        name: user.name,
        email: user.username,
      };
    } else {
      await updateUserTokenById(session._id!, token);
    }

    const template = await compileEmailTemplate({
      fileName: 'forgotPassword.mjml',
      data: {
        name: user.name,
        url: `${process.env.FRONTEND_URL}/auth/reset-password?&token=${token}`,
      },
    });

    await sendMail(email, 'Reset Password from Console', template);
    return res.status(200).json({  status: 'success', message: 'Reset password mail sent successfully' })
  } catch (error) {
    throw error;
  }
}
