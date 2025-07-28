import express from 'express'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import { dirname } from 'node:path'
import cors from  'cors'
import * as rt from './src/routes/agentsDataRoutes.js'
import * as pt from './src/routes/accountRouting.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

app.use('/images', express.static(path.join(__dirname, '../public/images')))

app.use("/", rt.Routes);
app.use("/api", pt.accountsRoutes)

app.listen(3000, (err: unknown) => {
    if (err) {
        console.log(err)
    }
    else {

        console.log('servidor corriendo')
    }
})
