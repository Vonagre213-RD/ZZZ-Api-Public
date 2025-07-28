
import { Router, Request, Response, } from "express"
import { verifyToken } from "../functions/verifyToken.js"
import { Pool } from "pg"

import { v4 } from "uuid"

const router = Router()
const pool = new Pool()



router.post("/login", async (req: Request, res: Response) => {
    const { username, userpassword } = req.body;

    try {

        let result = await pool.query("SELECT * FROM users WHERE username = $1 AND userpassword = $2", [username, userpassword]);
        const userToken = `Token-${v4()}`;

        if (result.rows.length <= 0) {
            res.status(400).send({ succesful: false, message: "usuario no encontrado" }); return
        }
        else {
            pool.query(`UPDATE users SET token = $3 WHERE username = $1 AND userpassword = $2`,[username, userpassword, userToken])
            res.status(200).send({ succesful: true, message: "Sesion iniciada correctamente" });
            console.log("sesion iniciada correctamente");
        }
    }
    catch (error) {
        console.error(error);
    }
})


router.post("/register", async (req: Request, res: Response) => {
    const { username, userpassword } = req.body

    const user_id = `user-${v4()}`;
    const userToken = `token-${v4()}`;


    try {
        await pool.query("INSERT INTO users (token, user_id, username, userpassword) values ($1, $2, $3, $4)", [userToken, user_id, username, userpassword])
        res.status(200).send({ succesful: true, message: "user created succesfully" });
    }
    catch (error) {
        console.error(error);
        res.status(400).send({ succesful: false, message: "there was an error registering the user" });
    }

})

router.post('/auth/profile', verifyToken, (req: Request, res: Response) => {
    res.status(200).json({succesful: true, user: req.user})
})

export { router as accountsRoutes }
