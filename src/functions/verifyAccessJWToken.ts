import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


interface jwtInterface {
    user_id: string,
    username: string,
    iat?: number,
    exp?: number
}

export async function verifyAccessJWToken(req: Request, res: Response, next: NextFunction) {
    const authToken = req.headers['authorization']

    if (!authToken || !authToken.startsWith("Bearer ")) {
        return res.status(400).json({ succesful: false, message: "token no provided" })
    }

    const token = authToken?.split(" ")[1]

    try {

        const payload = jwt.verify(token, process.env.ACCESSSECRETSIGN!) as unknown as jwtInterface;
        req.user = {
            user_id: payload.user_id,
            username: payload.username,
            accessToken: token
        }

        next()
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ succesful: false, message: "Token expired" })
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ succesful: false, message: "Invalid token" })

        }
        else{
            return res.status(500).json({ succesful: false, message: "server error" })
        }
    }

}