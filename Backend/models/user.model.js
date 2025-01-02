import mongoose from "mongoose";
import validator from 'validator';
// import bcrypt from "bcryptjs/dist/bcrypt";
// import {v2 as cloudinary} from 'cloudinary'
const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },   
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: true,
        select: false,
        minlength: 8
    },
    education: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true,
        enum: ['user', 'admin']
    }, phone: {
        type: Number,
        required: true,
        unique: true
    },
    photo: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        }
    },
    token: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});
export const User = mongoose.model('User', userSchema)