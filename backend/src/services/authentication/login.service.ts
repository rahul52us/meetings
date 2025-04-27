import { NextFunction, Request, Response } from 'express';
import { deleteUserById, findUser, findUserProps, getUser, updateUser } from '../../repository/user.repository';
import { loginValidation } from '../../validations/authenticate.validation';
import passport from 'passport';
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from "../../utils/env";
import { clearCookie, COOKIE_NAME } from '../../utils/cookie';

interface UserRequest extends Request {
  user?: {
    company?: string;
    id?: string;
  }
}

/**
 * Login user with email and password
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
export async function loginUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const { username, password } = req.body;
  const email = username
  const validateResult = loginValidation({ email, password });

  if (Array.isArray(validateResult) && validateResult.length) {
    clearCookie(res, COOKIE_NAME.TOKEN);
    return res.status(300).json({ status: 'error', message: (validateResult.map((it) => it.message).join(',')) })
  }
  const user = await findUser({ email });

  if (!user) {
    clearCookie(res, COOKIE_NAME.TOKEN);
    return res.status(300).json({ status: 'error', message: 'Invalid email or password' })
  }
  if (!user.is_active) {
    clearCookie(res, COOKIE_NAME.TOKEN);
    return res.status(300).json({ status: 'error', message: 'Your account is not yet verified' })
  }

  passport.authenticate('local', function (err: Error, user: any, info: any) {
    if (err) return next(err)
    if (!user) {
      clearCookie(res, COOKIE_NAME.TOKEN);
      return res.status(401).json({ status: 'error', message: 'unauthorized' })
    } else {
      const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '3d' })
      res.status(200).send({ status: 'success', token: token })
    }
  })(req, res, next);
}

export async function isLoggedIn(req: Request, res: Response, next: NextFunction) {
  console.log("user", req)
  if (req.user) {
    console.log("user", req.user)
    return res.status(200).send(true)
  }
  //if (req.isAuthenticated()) { return next() }
  res.status(403).send(false);
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string, username: string, id: string };
    const user = await findUser({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    return res.status(200).send(user);
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
}


//*service  for deleting user fucntionality
export async function deleteUserHandler(req: UserRequest, res: Response): Promise<Response> {
  const { id } = req.params;
  try {
    console.log(id);
    // const user = await findUser({ id: id });
    const user = await getUser(id);
    console.log(user)
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    user["deletedAt"] = new Date();
    deleteUserById(id)

    // Delete the user
    // const result = await deleteUserById(id);
    console.log(user);
    return res.status(200).json({ status: 'success', message: "Deleted user successfully" });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}
//* function for deleting user
/**
 * Deletes a user with the specified Id
 * @param  {Request} req
 * @param  {Response} res
 * @param  {NextFunction} next
 */
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
  try {
    const { id } = req.params;
    // Delete the user
    const result = await deleteUserById(id.toString());

    if (!result) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Return a success message
    return res.status(200).json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    // Handle errors

    return res.status(500).json({ status: 'error', message: error.message });
  }
}

//* service for update user with valid Id
export async function updateUserHandler(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params;
    const updates = req.body;
    // *Check if the user exists
    const user = await findUser({ id });
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    // *Update the user's information
    updates["updatedAt"] = new Date();
    await updateUser(id, updates);
    // Return the updated user
    return res.status(200).json({ status: 'success', message: 'User updated successfully' });
  } catch (error) {
    // Handle errors
    return res.status(400).json({ message: 'Invalid user ID' });

  }
}
