
import { Router, Request, Response, } from "express"
import { verifyAccessJWToken } from "../functions/verifyAccessJWToken.js"
import { verifyRefreshJWToken } from "../functions/verifyRefreshJWToken.js"
import bcrypt from 'bcrypt'
import { Pool } from "pg"
import createJWToken from "../functions/createJWToken.js"

import { v4 } from "uuid"

const router = Router()
const pool = new Pool()

router.post("/login", async (req: Request, res: Response) => {
    const {username, userpassword } = req.body;

    try {
        if (!username || !userpassword) {
            res.status(400).send({ successful: false, message: "username or password can't be empty" }); return
        }

        let results = await pool.query("SELECT * FROM users WHERE username = $1 ", [username]);

        if (results.rows.length <= 0) {
            res.status(400).send({ successful: false, message: "user not found" }); return
        }

        const user = results.rows[0]
        const match = await bcrypt.compare(userpassword, user.password)

        if (!match) return res.status(402).send({ successful: false, message: "incorrect password" }); 

        const { accessToken, refreshToken } = createJWToken(user.user_id, user.username)!

        res.cookie("zzzApiRefreshToken", refreshToken, {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ successful: true, token: accessToken, message: "logging successful" });

        console.log("logging successful");
    }
    catch (error) {
        res.status(400).json({ successful: true, error: error, message: "Server error" });

    }
})

router.post("/register", async (req: Request, res: Response) => {
    const { username, userpassword } = req.body

    const user_id = `user-${v4()}`;
    const userToken = `Token-${v4()}`;

    const encriptedPassword = await bcrypt.hash(userpassword, 10)

    try {
        await pool.query("INSERT INTO users (token, user_id, username, userpassword) values ($1, $2, $3, $4)", [userToken, user_id, username, encriptedPassword])
        res.status(200).send({ successful: true, token: userToken, message: "user created succesfully" });
    }
    catch (error: any) {
        if(error.code === "23505"){
            console.log(error)
            res.status(401).send({ successful: false, message: "duplicated username" });
        }
        console.log(encriptedPassword)
        console.log(error)
        res.status(400).send({ successful: false, message: "there was an error registering the user" });
    }

})

router.post("/auth/profile/logout", async (req: Request, res: Response) => {
    const { token } = req.body

    try {

        const userToken = `token-${v4()}`;
        await pool.query("Update users set token = $1 where token = $2", [userToken, token])
    }
    catch (error) {
        return res.status(500).json({ succesful: false, message: "server error" })

    }
})

router.get("/auth/refresh", verifyRefreshJWToken, (req: Request, res: Response) => {
    return res.status(200).json({
        successful: true,
        accessToken: req.user?.accessToken,
        message: "Access token renewed successfully"
    });
});

router.get('/auth/profile', verifyAccessJWToken, (req: Request, res: Response) => {
    res.status(200).json({ successful: true, user: req.user })
})


export { router as accountsRoutes }
