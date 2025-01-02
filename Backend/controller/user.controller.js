
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';
import createToken from '../jwt/AuthToken.js';

// Registration controller
export const register = async (req, res) => {
    try {
        console.log(req.body); // Log input data
        console.log(req.files); // Log file data

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "User photo is required" });
        }
        
        const { photo } = req.files;
        const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedFormats.includes(photo.mimetype)) {
            return res.status(400).json({ message: "Invalid photo format. Only jpg and png are allowed" });
        }

        const { email, name, password, phone, education, role } = req.body;

        // Validate input fields
        if (!email || !name || !password || !phone || !education || !role) {
            const missingFields = [];
            if (!email) missingFields.push('email');
            if (!name) missingFields.push('name');
            if (!password) missingFields.push('password');
            if (!phone) missingFields.push('phone');
            if (!education) missingFields.push('education');
            if (!role) missingFields.push('role');
            return res.status(400).json({ message: `Please fill in all required fields: ${missingFields.join(', ')}` });
        }

        // Upload photo to Cloudinary
        const responsecloudinary = await cloudinary.uploader.upload(photo.tempFilePath);
        console.log('Cloudinary response:', responsecloudinary);   
        if (!responsecloudinary || responsecloudinary.error) {
            return res.status(500).json({ message: "Failed to upload photo. Please try again." });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            email,
            name,
            password: hashedPassword,
            phone,
            education,
            role,
            photo: {
                public_id: responsecloudinary.public_id,
                url: responsecloudinary.url
            },
        });

        // Save the new user to the database
        await newUser.save();

        // Create a token and send success response
        const token = await createToken(newUser._id, res);
        res.status(201).json({ message: `${newUser.name} registered successfully`, newUser, token });
        console.log('register token---->', token);

    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};




// Login controller
export const login = async (req, res) => {
    try {
        const { email, role, password } = req.body;

        // Validate input fields
        if (!email || !role || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists and include the password field
        const user = await User.findOne({ email, role }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid email or role" });
        }

        // Check if the password exists
        if (!user.password) {
            return res.status(400).json({ message: "User password is missing" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate token
        const token = await createToken(user._id, res);
        res.status(200).json({ message: `Welcome ${user.name} 😄`, token });
        console.log("login---->", token);

    } catch (error) {

        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt', { httpOnly: true });
        res.status(200).json({ message: "Logout successfully" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "logout server is error" })

    }

}

export const getMyProfile = async (req, res) => {
    const user = await req.user;
    return res.status(200).json({ user })
}

export const getAdmins = async (req, res) => {

    try {
        // Declare and initialize the 'admins' variable
        const admins = await User.find({ role: 'admin' });

        // Proceed with the response
        res.status(200).json({ admins });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllUser = async(req,res)=>{
    try {
        const user = await User.find({role:'user'})
        // Proceed with the response
        res.status(200).json({user})
    } catch (error) {
        res.status(500).json({message:"Something went to wrong in userFtech "})
    }
}