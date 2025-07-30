import jwt  from "jsonwebtoken";


export default function createJWToken(user_id: string, username: string){

 
        if(!user_id || !username){
            return console.log("required data missing")
        }
        const accessToken = jwt.sign({user_id: user_id, username:username}, process.env.ACCESSSECRETSIGN!, {expiresIn: "2h"})
        const refreshToken= jwt.sign({user_id: user_id, username:username}, process.env.REFRESHSECRETSIGN!, {expiresIn: "7d"})

 
 

    return {accessToken, refreshToken}
}
