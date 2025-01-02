import express from "express";
import { createBlog, deleteBlog, getAllBlogs, getMyBlogs, getSingleBlogs, singleUserDelete, updateBlog } from "../controller/blog.controller.js";
import { isAdmin, isAuthenticated } from "../middleware/authUser.js";
import { getAllUser } from "../controller/user.controller.js";

const router = express.Router();

// POST route to create a blog
router.post('/create', isAuthenticated, isAdmin('admin'), createBlog);
// DELETE route to delete a blog by ID
router.delete('/remove/:id', isAuthenticated, isAdmin('admin'), deleteBlog);
// GET route to get all blogs
router.get('/all-blogs', getAllBlogs);
// .GET route to single blogs with the help of id
router.get('/single-blog/:id', isAuthenticated, getSingleBlogs);
// Get router to  my blog
router.get('/my-blog', isAuthenticated, isAdmin('admin'), getMyBlogs);
// router.get('/my-blog', isAuthenticated, isAdmin('admin'), getMyBlogs);
//  Get route to update the blog with the help of id
router.put('/update/:id', isAuthenticated, isAdmin('admin'), updateBlog)
router.get('/all-users', isAuthenticated,isAdmin('admin'),getAllUser)
router.delete('/user/delete/:id', isAuthenticated,isAdmin('admin'),singleUserDelete)

export default router;
