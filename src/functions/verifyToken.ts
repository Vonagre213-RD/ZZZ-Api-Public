import { Request, Response, NextFunction } from "express";
import { Pool } from "pg";

const pool = new Pool()

export async function verifyToken (req: Request, res: Response, next: NextFunction){
    const authToken = req.headers['authorization']

    if(!authToken || !authToken.startsWith("Bearer ")){
        res.status(400).json({succesful: false, message: "token no provided"})
    }

    const token = authToken?.split(" ")

    try{
        const result = await pool.query("SELECT * FROM users WHERE token = $1", [token])
        
        if(result.rows.length < 0 ){
            res.status(400).json({succesful: false, message: "couldn't find user"})
        }
        req.user = result.rows[0].user
    }
    catch(error){
        res.status(500).json({succesful: false, message: "server error"})
    }

    next()
}