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
        if(!req.body) {
            return res.status(400).json({
                message: 'Request body is missing. Ensure content type is application/json'
            });
        }
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

//Update User Profile
router.put('/update-profile/:email',async (req,res) =>{
    try {
        //const {id} = req.params;
        const currentEmail = req.params.email;
        const {fullName,mobileNumber,email,password} = req.body;
        if(!fullName || !mobileNumber || !email) {
            return res.status(400).json({message: 'All fields are required'});
        }
        let updateData = {fullName, mobileNumber, email};
        if(password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        const updatedUser = await user.findOneAndUpdate(
            { email: currentEmail },
            updateData,
            {returnDocument: 'after', runValidators: true}
        );
        if(!updatedUser) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                mobileNumber: updatedUser.mobileNumber,
                email: updatedUser.email,
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({message: 'Server error'});
    }
});
//Get the Profile Details
router.get('/profile/:email', async (req,res) =>{
    try {
        const existingUser = await user.findOne({email: req.params.email});
        if(!existingUser) {
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({
            user: {
                fullName: existingUser.fullName,
                mobileNumber: existingUser.mobileNumber,
                email: existingUser.email,
            }
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({message: 'Server error'});
    }
});
module.exports = router;