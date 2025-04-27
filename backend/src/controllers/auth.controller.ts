import { NextFunction, Request, Response } from "express";
import passport from "passport";
import "../config/auth/passportConfig";

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", async function (err: Error, user: any, info: any) {
        if (err) {
            return res.status(401).json({ status: "error", message: "unauthorized access" });
        }
        if (!user) {
            return res.status(401).json({ status: "error", message: "unauthorized access user not found" });
        } else {
            if (!user.is_active) {
                return res.status(300).json({ status: "error", message: "User is not yet verfied, please verify" });
            } else if (user.deletedAt) {
                return res.status(300).json({ status: "error", message: "User has been disabled by admin, please contact your company administrator" });
            }
            req.user = user;
            return next();
        }
    })(req, res, next);
}

export async function authorizeJWT(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("jwt", function (err: any, user: any, jwtToken: any) {
        if (err) {
            return res.status(401).json({ status: "error", message: "unauthorized" });
        }
        if (!user) {
            return res.status(401).json({ status: "error", message: "unauthorized" });
        } else {
            const scope = req.baseUrl.split("/").slice(-1)[0];
            const authScope = jwtToken.scope;
            if (authScope && authScope.indexOf(scope) > -1) {
                return next();
            }
            else {
                return res.status(401).json({ status: "error", message: "unauthorized" });
            }
        }
    })(req, res, next);
}