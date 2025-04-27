import { NextFunction, Request, Response } from 'express';

import dayjs from 'dayjs';
import { findUser } from '../../repository/user.repository';
import sendMail from '../../libs/mail';
import compileEmailTemplate from '../../helpers/compile-email-template';

import { changePasswordValidation } from '../../validations/authenticate.validation';

interface UserRequest extends Request {
  user: {
    _id: string;
    name: string;
    username: string;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  }
}
export async function changePasswordUser(req: UserRequest, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { currentPassword, newPassword, confirmPassword, id } = req.body;
    if (!req.user) {
      return res.status(400).json({ status:'error', message: "User not logged in" })
    }

    const validateResult = changePasswordValidation({ password: newPassword });
    if (Array.isArray(validateResult) && validateResult.length) {
      return res.status(400).json({ status:'error', message: (validateResult.map((it) => it.message).join(',')) })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status:'error', message: "New Password doesn't match confirm password" })
    }

    let user;
    if(!id){
      user = req.user;
      const updatePassword = await user.changePassword(currentPassword, newPassword);
    }else{
      user = await findUser({ id });
      await user.setPassword(newPassword, (err: any, user: any) => {
        if (err) {
          return res.status(300).json({ status:'error', message: 'Your password has not been updated' })
        }
        user.save();
      });
    }

    const template = await compileEmailTemplate({
      fileName: 'changePassword.mjml',
      data: {
        name: user.username,
        date: dayjs().format('dddd, MMMM D, YYYY h:mm A'),
      },
    });

    await sendMail(user.username!, 'Password changed from Avionics', template);
    return res.status(200).send({  status: 'success', message: 'Password changed successfully' })
  } catch (error) {
    return res.status(400).json({ error: error });
  }
}
