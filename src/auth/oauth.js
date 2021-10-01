import GoogleStrategy from "passport-google-oauth20"
import passport from "passport"
import AuthorModel from "../services/authors/schema.js"
import { JWTAuthenticate } from "./tools.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_OAUTH_ID,
    clientSecret: process.env.GOOGLE_OAUTH_SECRET,
    callbackURL: `${process.env.API_URL}:${process.env.PORT}/authors/googleRedirect`,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    try {
        // We are receiving some profile information from Google
        console.log(profile)
        
  
        // 1. Check if author is already in db or not.
  
        const author = await AuthorModel.findOne({ googleId: profile.id })
  
        if (author) {
          // 2. If author was already there we are creating the tokens for him/her
  
          const tokens = await JWTAuthenticate(author)
  
          passportNext(null, { tokens })
        } else {
          // 3. If it is not we are creating a new record and then we are creating the tokens for him/her
          const newAuthor = {
            name: profile.name.givenName,
            surname: profile.name.familyName,
            email: profile.emails[0].value,
            role: "User",
            googleId: profile.id,
          }
  
          const createdAuthor = new AuthorModel(newAuthor)
          const savedAuthor = await createdAuthor.save()
          const tokens = await JWTAuthenticate(savedAuthor)
  
          passportNext(null, { authors: savedAuthor, tokens })
        }
      } catch (error) {
        console.log(error)
        passportNext(error)
      }
    }
  )
  
  passport.serializeUser(function (author, passportNext) { //to maintain login sessions
    passportNext(null, author) // MANDATORY. This attaches stuff to req.author
  })
  
  export default googleStrategy
  