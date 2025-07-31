
import { Router, Request, Response, } from "express"
import { supabase } from "../functions/supabase.js"
import { verifyAccessJWToken } from "../functions/verifyAccessJWToken.js"
import { verifyRefreshJWToken } from "../functions/verifyRefreshJWToken.js"
import bcrypt from 'bcrypt'

import createJWToken from "../functions/createJWToken.js"

import { v4 } from "uuid"

const router = Router()


router.post("/login", async (req: Request, res: Response) => {
    const { username, userpassword } = req.body;
    console.log(username, userpassword)
    try {
        if (!username || !userpassword) {
            res.status(400).send({ successful: false, message: "username or password can't be empty" }); return
        }
        const { data: results } = await supabase
            .from("users")
            .select("*")
            .eq("username", username)

        if (results === null) return res.status(400).json({ succesful: false, message: "couldn't find any rows" });
        
        
        if (results.length <= 0) {
            res.status(400).send({ successful: false, message: "user not found" }); return
        }
        
        const user = results[0]
        const match = await bcrypt.compare(userpassword, user.userpassword)

        if (!match) return res.status(402).send({ successful: false, message: "incorrect password" });
        const { accessToken, refreshToken } = createJWToken(user.user_id, user.username)!

        res.cookie("zzzApiRefreshToken", refreshToken, {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ successful: true, token: accessToken, message: "logging successful" });

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
        const { error } = await supabase
            .from('users')
            .insert({ token: userToken, user_id: user_id, username: username, userpassword: encriptedPassword })
        console.log(error)
        res.status(200).send({ successful: true, token: userToken, message: "user created succesfully" });
    }
    catch (error: any) {
        if (error.code === "23505") {
            console.error(error)
            res.status(401).send({ successful: false, message: "duplicated username" });
        }
        console.error(error)
        res.status(400).send({ successful: false, message: "there was an error registering the user" });
    }

})

router.post("/auth/profile/logout", async (req: Request, res: Response) => {
    const { user_id, username } = req.body

    try {

        const { refreshToken } = createJWToken(user_id, username)!;
        if (!refreshToken) return res.status(500).json({ succesful: false, message: "server error, couldn't create token" })

        const { error } = await supabase
            .from('users')
            .update({ token: refreshToken })
            .eq("username", username)
            .eq("user_id", user_id)
        console.error(error)
    }
    catch (error) {
        console.log(error)
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
