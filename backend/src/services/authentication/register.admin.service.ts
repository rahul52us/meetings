import { Request, Response, NextFunction } from 'express';

import { registerUser } from './register.service';

interface UserRequest extends Request {
  user?: {
    company?: string;
  }
}

export async function registerAdmin(req: any, res: Response, next: NextFunction): Promise<Response> {
  try {
    return registerUser(req, res, next);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}




