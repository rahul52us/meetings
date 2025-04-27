import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
  user: {
    role: string,
    email: string
  }
}