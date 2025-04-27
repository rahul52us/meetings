import express from "express";

import {
  changePasswordUser,
  registerUser,
  isLoggedIn,
  getalluser,
  getPermissionsService,
} from "../services/authentication";

import {
  deleteUser,
  deleteUserHandler,
  getCurrentUser,
  updateUserHandler,
} from "../services/authentication/login.service";

import { authenticateJWT } from "../controllers/auth.controller";

import { grantAccess } from "../controllers/rbac/rbac.controller";
import { getUserAccountService } from "../services/authentication/getuser.service";

const User = express.Router();

User.get("/isLoggedIn", authenticateJWT, isLoggedIn);

User.post("/changePassword", authenticateJWT, changePasswordUser);

User.delete("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

User.post(
  "/create",
  authenticateJWT,
//   grantAccess("create", "user"),
  registerUser
); // authenticateJWT, grantAccess('canCreateUser', 'User'),

User.get("/get", authenticateJWT, getalluser);

User.delete(
  "/delete/:id",
  authenticateJWT,
  grantAccess("delete", "user"),
  deleteUserHandler
);

User.put(
  "/update/:id",
  authenticateJWT,
//   grantAccess("update", "user"),
  updateUserHandler
);

User.get("/getPermissions", authenticateJWT, getPermissionsService);

User.get("/getAccountDetail", authenticateJWT, getUserAccountService);

export default User;
