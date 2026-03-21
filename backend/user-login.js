const express = require('express');
const {default: mongoose} = require('mongoose');
const bcrypt = require('bcrypt');

const router = express.Router();

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    mobileNumber: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
},{timestamps: true});
const user =  mongoose.model('User', userSchema);

//User Registration
router.post('/register', async (req, res)=> {
    try {
        const {fullName, mobileNumber, email, password} = req.body;
        if(!fullName || !mobileNumber || !email || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const existingUser = await user.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: 'User already exists'});
        }
        //Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newuser = new user({
            fullName,
            mobileNumber,
            email,
            password: hashedPassword,
        });
        await newuser.save();
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                fullName: newuser.fullName,
                mobileNumber: newuser.mobileNumber,
                email: newuser.email,
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({message: 'Server error'});
    }
});
//User Login
router.post('/login', async (req, res) => {
    try {
        const {email,password} =req.body;
        if(!email || !password) {
            return res.status(400).json({message: 'Email and password are required'});
        }
        const existingUser = await user.findOne({email});
        if(!existingUser) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if(!isMatch) {
            return res.status(400).json({message: 'Invalid email or password'});
        }
        res.status(200).json({message: 'Login successful', user: {fullName: existingUser.fullName, email: existingUser.email}});
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({message: 'Server error'});
    }
});
module.exports = router;