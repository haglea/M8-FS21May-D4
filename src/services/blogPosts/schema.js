import mongoose from 'mongoose'
import Authors from "../authors/schema.js";

const {Schema, model} = mongoose

const BlogPostSchema = new Schema({
  category: { type: String, required: true},
  title: { type: String, required: true},
  cover: { type: String, required: true},
  readTime: {
      value: { type: Number, min: 1, max: 65, required: true },
      unit: { type: String, required: true }
  },
  content: { type: String, required: true },
  comments: [{
      comment: String,
      rate: Number
  }], 
  authors: [{ type: Schema.Types.ObjectId, ref: "Author" }]
}, { 
  timestamps: true // adds createdAt and updatedAt automatically
})

BlogPostSchema.pre("save", async function (next) {
  try {
    const isExist = await Authors.findById(this.authors);
    if (isExist) {
      next();
    } else {
      const error = new Error("this author does not exist");
      error.status = 400;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});


export default model("blogPost", BlogPostSchema) // bounded to the "blogPost" collection, if it is not there it is going to be created automatically