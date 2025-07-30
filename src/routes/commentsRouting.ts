import { Router, Request, Response, } from "express"
import { verifyAccessJWToken } from "../functions/verifyAccessJWToken.js";
import { v4 } from "uuid"
import { Pool } from "pg"

//adding comments waaaaa
const router = Router();
const pool = new Pool()

router.post("/auth/agentsComments", verifyAccessJWToken, async (req: Request, res: Response) => {
    const { commentContent, agent_id } = req.body
    try {

        const commentId = `comment-id${v4()}`
        const user = req.user

        if (!user || !user.user_id) {
            return res.status(400).json({ successful: false, message: "not verified user" });
        }

        const user_id = user.user_id

        const verificationQuery = await pool.query("SELECT * FROM users where user_id = $1", [user_id])
        if (verificationQuery.rows[0].length < 0) {
            return res.status(400).json({ sucessful: false, message: "cannot find user" })
        }

        const username = verificationQuery.rows[0].username

        if (!commentContent || commentContent === "" || !agent_id) {
            return res.status(400).json({ successful: false, message: "there are required data missing" });
        }

        await pool.query("INSERT INTO AGENTsCOMMENTS (comment_id, user_id, agent_id, commentcontent, username) values ($1, $2, $3, $4, $5)", [commentId, user_id, agent_id, commentContent, username])

        res.status(200).send({ successful: true, message: "comment added succesfully" })
    }
    catch (error) {
        res.status(400).send({ sucessful: false, message: "server error", error: error })
    }
});

router.get('/agentsComments/:agent_id', async (req: Request, res: Response) => {
    const { agent_id } = req.params

    try {
        const result = await pool.query("SELECT username, commentcontent, TO_CHAR(commentDate, 'DD/MM/YY') as commentDate from agentscomments where agent_id = $1", [agent_id])
        console.log(result.rows)
        res.status(200).send({ successful: true, comments: result.rows })
    }
    catch (error) {
        res.status(400).json({ sucessful: false, message: "server error", error: error })
    }
})

export { router as commentsRoutes }