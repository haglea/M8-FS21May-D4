import express from "express"
import AuthorModel from "./schema.js"
import BlogModel from "../blogPosts/schema.js";
import { basicAuthMiddleware } from "../../auth/basic.js"
import { adminMiddleware } from "../../auth/admin.js"
import { JWTAuthMiddleware } from "../../auth/token.js"
import { JWTAuthenticate, refreshTokens } from "../../auth/tools.js"
import passport from "passport"

const authorsRouter = express.Router()

authorsRouter.post("/register", async (req, res, next) => {
  try {
    const newAuthor = new AuthorModel(req.body)
    const { _id } = await newAuthor.save()

    res.status(201).send({ _id })
  } catch (error) {
    next(error)
    console.log(error)
  }
})

authorsRouter.get("/", JWTAuthMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const authors = await AuthorModel.find()
    res.send(authors)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/me/stories", JWTAuthMiddleware, async (req, res, next) => {
  try {
    
    const posts = await BlogModel.find({ authors: req.author._id })
    console.log(req.author._id)
    res.status(200).send(posts)

  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/googleLogin", passport.authenticate("google", { scope: ["profile", "email"] }))

authorsRouter.get("/googleRedirect", passport.authenticate("google"), async (req, res, next) => {
  try {
    console.log("redirect")
    console.log(req.user)
    res.cookie("accessToken", req.user.tokens.accessToken, {
      httpOnly: true,
    })
    res.cookie("refreshToken", req.user.tokens.refreshToken, {
      httpOnly: true,
    })
    res.redirect(`http://localhost:3000`)
  } catch (error) {
    next(error)
  }
})

authorsRouter.get("/:authorId", JWTAuthMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    //console.log(req.author.role)
    const author = await AuthorModel.findById(req.params.authorId)
    res.send(author)
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1. Verify credentials

    const author = await AuthorModel.checkCredentials(email, password)

    if (author) {
      // 2. If everything is ok we are going to generate an access token
      const { accessToken, refreshToken }  = await JWTAuthenticate(author)
      // 3. Send token back as a response
      res.send({ accessToken, refreshToken })
    } else {
      // 4. If credentials are not ok we are sending an error (401)
      next(createHttpError(401, "Credentials are not ok!"))
    }
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/refreshToken", async (req, res, next) => {
  try {
    const { actualRefreshToken } = req.body

    // 1. Check the validity (if it is not expired, check the integrity, check if it is in db) of the actual refresh token

    // 2. If everything is fine we can create a new pair of tokens (accessToken, refreshToken)

    const { accessToken, refreshToken } = await refreshTokens(actualRefreshToken)

    res.send({ accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
})

authorsRouter.post("/logout", JWTAuthMiddleware, async (req, res, next) => {
  try {
    req.author.refreshToken = null
    await req.author.save()
    res.send()
  } catch (error) {
    next(error)
  }
})

export default authorsRouter