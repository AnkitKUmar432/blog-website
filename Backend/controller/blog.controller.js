
import mongoose from "mongoose";
import { Blog } from "../models/Blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import { User } from "../models/user.model.js";

export const createBlog = async (req, res) => {
    try {
        // Check if files are uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "Blog Image is required" });
        }

        const { blogImage } = req.files;
        const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];

        // Check if the uploaded file format is allowed
        if (!allowedFormats.includes(blogImage.mimetype)) {
            return res.status(400).json({
                message: "Invalid photo format"
            });
        }

        const { title, category, about } = req.body;

        // Check for required fields
        if (!title || !category || !about) {
            return res.status(400).json({
                message: "Title, category & about are required fields."
            });
        }

        const adminName = req.user?.name;  // Fallback
        const adminPhoto = req.user?.photo?.url;  // Fallback
        const createdBy = req.user?._id;  // Fallback

        // const adminName = req.user?.name || 'Unknown Admin';  // Fallback
        // const adminPhoto = req.user?.photo?.url || 'default.jpg';  // Fallback
        // const createdBy = req.user?._id || null;  // Fallback

        // Upload the image to Cloudinary
        const cloudinaryResponse = await cloudinary.uploader.upload(blogImage.tempFilePath);

        // Handle Cloudinary upload error
        if (cloudinaryResponse.error) {
            console.log(cloudinaryResponse.error);
            return res.status(500).json({
                message: "Error uploading image to Cloudinary"
            });
        }

        const blogData = {
            title,
            about,
            category,
            adminName,
            adminPhoto,
            createdBy,
            blogImage: {
                public_id: cloudinaryResponse.public_id,
                url: cloudinaryResponse.url
            }
        };
        // Create the blog in the database
        const blog = await Blog.create(blogData);
        res.status(201).json({
            message: "Blog has been created",
            blog
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteBlog = async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
        res.status(404).json({ message: "Blog not found" });
    }
    await blog.deleteOne();
    res.status(200).json({ message: "Blog deleted successfully" });
}

export const getAllBlogs = async (req, res) => {
    const allBlogs = await Blog.find();
    res.status(200).json(allBlogs)
}

export const getSingleBlogs = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid blog Id" })
    }
    const blog = await Blog.findById(id);
    if (!blog) {
        return res.status(404).json({ message: "Blog not found" })
    }
    res.status(200).json(blog)
}

export const getMyBlogs = async (req, res) => {
    try {
        const createdBy = req.user._id;
        const myBlogs = await Blog.find({ createdBy });

        if (!myBlogs || myBlogs.length === 0) {
            return res.status(404).json({ message: "No blogs found for this user" });
        }

        res.status(200).json(myBlogs);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const updateBlog = async (req, res) => {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "invalid Blog id" })
    }
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    if (!updateBlog) {
        return res.status(404).json({ message: "Blog not found" })
    }

    res.status(200).json({ message: "Blog update successfully", updateBlog })

}

export const singleUserDelete = async (req, res) => {
    const { id } = req.params;
    try {
        // Check if the user exists
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the user
        await userToDelete.deleteOne();
        return res.status(200).json({ message: 'User deleted successfully' });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while deleting the user" });
    }
}
