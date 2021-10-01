import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    role: { type: String, required: true, enum: ["User", "Admin"], default: "User" },
    refreshToken: { type: String },
    googleId: { type: String },
  },
  { timestamps: true }
)

AuthorSchema.pre("save", async function (next) {
  // used not only on creation but also when author document is being modified (PUT)
  // BEFORE saving the author in db, hash the password
  const newAuthor = this
  const plainPW = newAuthor.password

  if (newAuthor.isModified("password")) {
    // only if author is modifying the password we are going to "waste" CPU cycles in running hash function
    newAuthor.password = await bcrypt.hash(plainPW, 10)
  }
  next()
})

AuthorSchema.methods.toJSON = function () { 
  // toJSON is called every time express does a res.send of the documents, this is not going to affect the db

  const authorDocument = this

  const authorObject = authorDocument.toObject()

  delete authorObject.password // so that passwords are not sent back
  delete authorObject.__v

  // authorObject.newProperty = "ashdasdsadas" if you want you can also add new properties to the returned objects
  return authorObject
}

AuthorSchema.statics.checkCredentials = async function (email, plainPW) {
  // This function is going to receive email and pw

  // 1. Find the author by email

  const author = await this.findOne({ email }) // "this" represents the model

  if (author) {
    // 2. If the author is found we are going to compare plainPW with the hashed one
    const isMatch = await bcrypt.compare(plainPW, author.password)

    // 3. Return a meaningful response

    if (isMatch) return author
    else return null
  } else {
    return null
  }
}

export default model("Author", AuthorSchema)
