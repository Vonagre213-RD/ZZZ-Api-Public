import { Router, Request, Response, } from "express"
import { verifyAccessJWToken } from "../functions/verifyAccessJWToken.js";
import { v4 } from "uuid"
import { supabase } from "../functions/supabase.js";
//adding comments waaaaa
const router = Router();


router.post("/auth/agentsComments", verifyAccessJWToken, async (req: Request, res: Response) => {
    const { commentContent, agent_id } = req.body
    try {

        const commentId = `comment-id${v4()}`
        const user = req.user

        if (!user || !user.user_id) {
            return res.status(400).json({ successful: false, message: "not verified user" });
        }

        const user_id = user.user_id

        const { data: verificationQuery } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user_id)

        if (!verificationQuery) return res.status(401).send({ sucessful: false, message: "server error, couldn't find any rows" })

        if (verificationQuery[0].length <= 0) {
            return res.status(400).json({ sucessful: false, message: "cannot find user" })
        }

        const username = verificationQuery[0].username

        if (!commentContent || commentContent === "" || !agent_id) {
            return res.status(400).json({ successful: false, message: "there are required data missing" });
        } 
        await supabase
            .from("agentscomments")
            .insert({ comment_id: commentId, user_id: user_id, agent_id: agent_id, username: username, commentcontent: commentContent })

        res.status(200).send({ successful: true, message: "comment added succesfully" })
    }
    catch (error) {
        res.status(400).send({ sucessful: false, message: "server error", error: error })
    }
});

router.get('/agentsComments/:agent_id', async (req: Request, res: Response) => {
    const { agent_id } = req.params

    try {
        const { data: result } = await supabase
            .from('agentscomments')
            .select('*')
            .eq('agent_id', agent_id)

        console.log("hola soy ",result)
        res.status(200).send({ successful: true, comments: result })
    }
    catch (error) {
        res.status(400).json({ sucessful: false, message: "server error", error: error })
    }
})

export { router as commentsRoutes }