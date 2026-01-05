
import express from "express"
import userRouter from "./routes/userRoutes.js"
import journalRouter from "./routes/journalRoutes.js"
import connectToDB from "./config/dbConfig.js"
import cors from "cors"
import helmet from "helmet"


const app = express()

app.use(cors())

app.use(helmet())



app.use(express.json())
app.use("/api/user",userRouter)
app.use("/api/journal",journalRouter)


app.get('/',(req,res)=>{

    return res.status(200).send("Hello World")
})

const PORT = 5000

app.listen(PORT,async()=>{
    await connectToDB()
    console.log(`server is running at http://localhost:${PORT}`)
})