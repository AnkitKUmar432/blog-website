
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

const createToken = async (userId, res) => {
    try {
        // Sign the token with user ID and secret key
        const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
            expiresIn: "90d", // Token expiration time
        });

        // Set the token as an HTTP-only cookie
        res.cookie('jwt', token, {
            httpOnly: true, // Prevents XSS attacks
            secure:true,
            // secure: process.env.NODE_ENV === "production", // Ensures secure cookie in production
            sameSite: "strict" // Helps prevent CSRF attacks
        });

        // Optional: Save the token to the user's record in the database
        await User.findByIdAndUpdate(userId, { token });

        // Return the token for further use
        return token;

    } catch (error) {
        console.error("Error creating token:", error);
        throw new Error("Token creation failed");
    }
};

export default createToken;
