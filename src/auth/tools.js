import jwt from "jsonwebtoken"
import createHttpError from "http-errors"
import AuthorModel from "../services/authors/schema.js"

export const JWTAuthenticate = async author => {
  // 1. Given the author ==> generate the token with author._id as payload

  const accessToken = await generateJWT({ _id: author._id })
  const refreshToken = await generateRefreshJWT({ _id: author._id })
  // 2. Save refresh token in db
  author.refreshToken = refreshToken

  await author.save()
  return { accessToken, refreshToken }
}

const generateJWT = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1week" }, (err, token) => {
      if (err) reject(err)
      resolve(token)
    })
  )

export const verifyJWT = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) reject(err)
      resolve(decodedToken)
    })
  )

  const generateRefreshJWT = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "1week" }, (err, token) => {
      if (err) reject(err)
      resolve(token)
    })
  )

const verifyRefreshJWT = token =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decodedToken) => {
      if (err) reject(err)
      resolve(decodedToken)
    })
  )

  
export const refreshTokens = async actualRefreshToken => {
    // 1. Is the actual refresh token valid (exp date and integrity)?
  
    const decodedRefreshToken = await verifyRefreshJWT(actualRefreshToken)
  
    // 2. If the token is valid we are going to find the author in db
  
    const author = await AuthorModel.findById(decodedRefreshToken._id)
  
    if (!author) throw new Error("Author not found!")
  
    // 3. We need to compare actual refresh token with the one found in db
  
    if (author.refreshToken === actualRefreshToken) {
      // 4. If everything is fine we can generate a new pair of tokens
      const { accessToken, refreshToken } = await JWTAuthenticate(author)
  
      return { accessToken, refreshToken }
    } else {
      throw createHttpError(401, "Refresh Token not valid!")
    }
  }
  