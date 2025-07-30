import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import createJWToken from "./createJWToken.js";


interface jwtInterface {
    user_id: string,
    username: string,
    iat?: number,
    exp?: number
}

const pool = new Pool()
export async function verifyRefreshJWToken (req: Request, res: Response, next: NextFunction) {

    
    try {
        if(!req.cookies || !req.cookies.refreshToken) return res.status(400).json({ succesful: false, message: "no cookies provided" })
        const refreshToken = req.cookies.refreshToken

            
        const payload = jwt.verify(refreshToken, process.env.REFRESHSECRETSIGN!) as unknown as jwtInterface;

        const {accessToken} = createJWToken(payload.user_id, payload.username)!

        const results = await pool.query("SELECT * FROM users WHERE token = $1", [refreshToken])

        if(results.rows.length < 0) return res.status(400).json({ succesful: false, message: "no user token match the provided Token" });
        
        const user = results.rows[0]
        req.user = {
            user_id: user.user_id,
            username: user.username,
            accessToken: accessToken
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