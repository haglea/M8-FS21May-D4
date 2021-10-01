import createHttpError from "http-errors"
import atob from "atob" // to decode base64 strings
import AuthorModel from "../services/authors/schema.js"

export const basicAuthMiddleware = async (req, res, next) => {
  console.log("BASIC AUTH MIDDLEWARE")
  console.log(req.headers)

  // 1. Check if Authorization header is received, if it is not --> trigger an error (401)
  if (!req.headers.authorization) {
    next(createHttpError(401, "Please provide credentials in Authorization header!"))
  } else {
    // 2. If we received the Authorization header we'll need to extract the credentials from the Authorization header (which is in base64, therefore we will need to decode that obtaining normal text)
    const decodedCredentials = atob(req.headers.authorization.split(" ")[1])

    const [email, password] = decodedCredentials.split(":")

    console.log("EMAIL ", email)
    console.log("PASSWORD ", password)

    // 3. Check the validity of the credentials (find author in db by email, compare received password with hashed pw), if they aren't ok --> trigger an error (401)

    const author = await AuthorModel.checkCredentials(email, password)

    if (author) {
      // 4. If credentials are valid we can proceed to what is next (another middleware or the route handler)
      req.author = author
      
      next()
    } else {
      next(createHttpError(401, "Credentials are not correct!"))
    }
  }
}