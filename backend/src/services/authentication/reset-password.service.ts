import dayjs from 'dayjs';
import { NextFunction, Request, Response } from 'express';
import { findUser } from '../../repository/user.repository';
import { findToken, removeUserToken } from '../../repository/user_tokens.repository';
import { changePasswordValidation } from '../../validations/authenticate.validation';
import { resendEmailAction } from './resend-email.service';

export async function resetPasswordUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { token, password, confirmPassword } = req.body;

    const validateResult = changePasswordValidation({ password });
    if (Array.isArray(validateResult) && validateResult.length) {
      return res.status(300).json({ message: (validateResult.map((it) => it.message).join(',')) })
    }

    if (password !== confirmPassword) {
      return res.status(300).json({ status: 'error', message: 'Password and Confirm password do not match' })
    }
    const session = await findToken(token);
    const user = await findUser({ id: session.user_id });

    if (!user) {
      return res.status(300).json({ status: 'error', message: 'User not found' })
    }

    req.user = user
    req.body.type = token.type

    if (!session || !session._id) {
      return resendEmailAction(req, res, next);
    }

    if (dayjs(session.updated_at).add(15, 'm').diff(dayjs()) < 0) {
      return resendEmailAction(req, res, next);
    }

    await user.setPassword(password, (err: any, user: any) => {
      if (err) {
        return res.status(300).json({ status: 'error', message: 'Your password has not been updated' })
      }
      user.save();
      removeUserToken(session._id);
      return res.status(200).json({ status: 'success', message: 'Your password has been updated' })
    });

  } catch (error) {
    return res.status(400).json({ status: 'error', message: error })
  }
}
