// ----------------------------- blogPosts CRUD ---------------------
import express from "express"
import createError from "http-errors"
import BlogPostModel from './schema.js'
import { basicAuthMiddleware } from "../../auth/basic.js";

const blogPostsRouter = express.Router()


// ----------------------------- blogPosts GET with authors ---------------------
blogPostsRouter.get("/", async (req, res, next) => {
    try {
        const blogPosts = await BlogPostModel.find()
        res.send(blogPosts)      
    } catch (error) {
        next(error)
    }    
})

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
    try {       
    const blogPostId = req.params.blogPostId
    const blogPost = await BlogPostModel.findById(blogPostId)

    if (blogPost) {
      res.send(blogPost)
    } else {
      next(createError(404, `BlogPost with id ${blogPostId} not found!`))
    }
  
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.post("/", async (req, res, next) => {
    try {      
    const newBlogPost = new BlogPostModel(req.body) // here happens validation of the req.body, if it's not ok mongoose will throw a "ValidationError"
    const {_id} = await newBlogPost.save()   

    res.status(201).send({ _id })
    
    } catch (error) {
        next(error)
  }
})

blogPostsRouter.put("/:blogPostId", basicAuthMiddleware, async (req, res, next) => {
    try {       
        const blogPostId = req.params.blogPostId
        const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(blogPostId, req.body, {
            new: true, // returns the updated blogPost
            runValidators: true, // returns the modified blogPost
        })
    
        if (updatedBlogPost) {
          res.send(updatedBlogPost)
        } else {
          next(createError(404, `BlogPost with id ${blogPostId} not found!`))
        }
    
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete("/:blogPostId", basicAuthMiddleware, async (req, res, next) => {
    try {       
        const blogPostId = req.params.blogPostId
        const deletedBlogPost = await BlogPostModel.findByIdAndDelete(blogPostId)

        if (deletedBlogPost) {
          res.status(204).send(deletedBlogPost)
        } else {
          next(createError(404, `BlogPost with id ${blogPostId} not found!`))
        }
    
    } catch (error) {
        next(error)
    }
})
 
export default blogPostsRouter