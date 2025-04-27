import { Request, Response, NextFunction } from "express";
import { findUser, createUser } from "../../repository/user.repository";
import { createToken } from "../../repository/user_tokens.repository";
import { registerValidation } from "../../validations/authenticate.validation";
import sendMail from "../../libs/mail";
import { SEND_MAIL_TYPE } from "../../constants/send-mail-type.constant";
import compileEmailTemplate from "../../helpers/compile-email-template";
import generateRandomKey from "../../helpers/genarateRandomkey";

interface UserRequest extends Request {
  user?: {
    company?: string;
  };
}

export async function registerUser(
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<Response> {
  const { username, password, moNumber, companyName, name, role, permission, company } =
    req.body;
  console.log("req.body", req.body)
  try {
    const validateResult = registerValidation({ email : username, password });
    if (Array.isArray(validateResult) && validateResult.length) {
      return res
        .status(300)
        .json({
          status: "error",
          message: validateResult.map((it) => it.message).join(","),
        });
    }
    var user = await findUser({ email : username });
    if (user) {
      return res
        .status(300)
        .json({ status: "error", message: "Email address has been used" });
    }

    var user_monumber = await findUser({ moNumber });

    if (user_monumber) {
      return res
        .status(300)
        .json({
          status: "error",
          message:
            "Mobile number has already been Used by Existing User,Try again with Another Mobile Number",
        });
    }

    if (user && !user.is_active) {
      return res
        .status(300)
        .json({ status: "error", message: "Your account is not yet verified" });
    }

    const userData = {
      email : username,
      password,
      moNumber,
      companyName,
      name,
      role,
      permission,
      company,
    };

    let newUserId = await createUser(userData);

    if (typeof newUserId === "string") {
      const tokenVerifyEmail = await generateRandomKey();
      const template = await compileEmailTemplate({
        fileName: "verifyEmail.mjml",
        data: {
          name: username,
          url: `${process.env.FRONTEND_URL}/verify-email?token=${tokenVerifyEmail}`,
        },
      });

      await Promise.all([
        sendMail(
          process.env.RECIEVER_VERFICATION_MAIL,
          "Confirm your email address",
          template
        ),
        createToken(newUserId, tokenVerifyEmail, SEND_MAIL_TYPE.VERIFY_EMAIL),
      ]);
      // const token = await sign({ email, name });
      // console.log(token);
      return res
        .status(200)
        .send({ status: "success", message: "User registration successful" });
    } else {
      return res.status(400).json({ error: newUserId });
    }
    /* res.status(200).json({message:'User registration successful'}) */
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error });
  }
}
