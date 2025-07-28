import type { userInterface } from "./user.js";

declare global {
    namespace Express{
        interface Request{
            user?: userInterface
        }
    }
}