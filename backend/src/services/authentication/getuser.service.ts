import { NextFunction, Request, Response } from "express";
import { getallusers, getPermissions, getUserAccountDetails, getUserData } from "../../repository/user.repository";

interface UserRequest extends Request {
  user?: {
    _id?: string;
    company?: string;
  };
}

export async function getalluser(
  req: UserRequest,
  res: Response
): Promise<Response> {
  try {
    const dt = await getUserData()
    res.status(200).send({success : true , data : dt})
  } catch (error) {
    return res.status(400).json({ message: "Unable to get users" });
  }
}

export async function getUserAccountService(
  req: UserRequest,
  res: Response
): Promise<Response> {
  try {
    const result = await Promise.all([
      getUserAccountDetails(req.user?._id),
    ]);
    return res
      .status(200)
      .send({ ...result[0]});
  } catch (err) {
    return res.status(400).json({ message: err?.message });
  }
}

export async function getPermissionsService(
  req: UserRequest,
  res: Response
): Promise<Response> {
  try {
    let { _id } = req.user;
    let users = await getPermissions(_id);
    return res.status(200).send(users);
  } catch (error) {
    return res.status(400).json({ message: "Unable to get user" });
  }
}
