import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req, res, next) => {
    try {
        // Get the token from cookies (assuming cookies are used)
        const token = req.cookies.jwt;
        console.log('middleware: ', token);

        if (!token) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, { algorithms: ['HS256'] });

        // Find the user by ID in the token
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Attach the user object to the request for use in subsequent middleware/routes
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" });
        }
        console.log("Error occurring in authentication: ", error);
        return res.status(401).json({ error: "User not authenticated" });
    }
};

// Middleware to check if the user has the required role(s)
export const isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `User with role ${req.user.role} is not authorized`
            });
        }
        next();
    };
};

export const isAdminOrOwner = (req, res, next) => {
    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
    const isAdmin = userRoles.includes('admin');

    // Allow if the user is admin or is the owner of the blog
    if (isAdmin || req.user._id.toString() === req.params.id.toString()) {
        return next();
    }

    return res.status(403).json({ error: "You are not authorized to update this blog" });
};
