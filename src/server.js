import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import blogPostsRouter from "./services/blogPosts/index.js"
import authorsRouter from "./services/authors/index.js"
import { unauthorizedHandler, forbiddenHandler, catchAllHandler } from "./errorHandlers.js"
import passport from "passport"
import GoogleStrategy from "./auth/oauth.js"
import cookieParser from "cookie-parser"

const server = express()
const port = process.env.PORT || 3000

passport.use("google", GoogleStrategy)

// ******************** MIDDLEWARES *************************

server.use(cors({ origin: "http://localhost:3000", credentials: true })) // no options means Access-Control-Allow-Origin: "*"
server.use(express.json())
server.use(cookieParser())
server.use(passport.initialize())

// ******************** ROUTES ******************************

server.use("/blogPosts", blogPostsRouter)
server.use("/authors", authorsRouter)

// ********************** ERROR HANDLERS *************************

server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

console.table(listEndpoints(server))

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
  console.log("Mongo connected!")
  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
})
