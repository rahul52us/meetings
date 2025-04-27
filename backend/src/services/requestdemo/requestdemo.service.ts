import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_DEFAULT_TO_EMAIL,
} from "../../utils/env";

export async function createRequestDemoService(req: any, res: any) {
  try {
    const { firstName, lastName, productName, companyName, emailId, phone } =
      req.body;
    // console.log(req.body);

    await sendMail({
      firstName,
      lastName,
      productName,
      companyName,
      emailId,
      phone,
    });

    return res
      .status(200)
      .json({ status: "success", message: "Demo Requested successfully" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      status: "error",
      message:
        "Requested demo couldn't be created, some error occurred. Please contact support.",
    });
  }
}

let config: object = {
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, //ssl
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
};

const mailTransport = nodemailer.createTransport(config);

async function sendMail(data: any): Promise<boolean> {
  try {
    // console.log(data);
    // "info" <info@sequelstring.com>
    // "Laya Yesodharan" <laya.yesodharan@sequelstring.com>
    await mailTransport.sendMail({
      from: SMTP_DEFAULT_TO_EMAIL,
      to: "info@sequelstring.com",
      cc: "mrityunjay.kumar@sequelstring.com",
      subject: "Demo Request",
      text: `First Name: ${data.firstName}\nLast Name: ${data.lastName}\nProduct Name: ${data.productName}\nCompany Name: ${data.companyName}\nEmail ID: ${data.emailId}\nMobile No.: ${data.phone}\n\nKind Regards,\n${data.firstName}`,
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
