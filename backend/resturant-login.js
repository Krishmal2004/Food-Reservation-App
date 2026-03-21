const express = require('express');
const {default: mongoose} = require('mongoose');    
const bcrypt = require('bcrypt');

const router = express.Router();

const restuarantSchema = new mongoose.Schema({
    restaurantName:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
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
const resturant = mongoose.model('Resturant_login', restuarantSchema);

//Resturant Registration
router.post('/register-restaurant', async (req,res)=>{
    try {
        const {restaurantName,email,password} = req.body;
        if(!restaurantName || !email || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const existingResturant = await resturant.findOne({email});
        if(existingResturant) {
            return res.status(400).json({message: 'Resturant already exists'});
        }
        //Password Hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newResturant = new resturant({
            restaurantName,
            email,
            password: hashedPassword,
        });
        await newResturant.save();
        res.status(201).json({
            message: 'Resturant registered successfully',
            resturant: {
                id: newResturant._id,
                restaurantName: newResturant.restaurantName,
                email: newResturant.email,
                password: newResturant.password,
            }
        });
    } catch (error) {
        console.error('Error registering resturant:', error);
        res.status(500).json({message: 'Server error'});
    }
});

//Resturant Login
router.post('/restaurant-login', async (req,res)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const existingResturant = await resturant.findOne({email});
        if(!existingResturant) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const isMatch = await bcrypt.compare(password, existingResturant.password);
        if(!isMatch) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        res.status(200).json({
            message: 'Login successful',
            resturant: {
                id: existingResturant._id,
                restaurantName: existingResturant.restaurantName,
                email: existingResturant.email,
            }
        });
    } catch (error) {
        console.error('Error logging in resturant:', error);
        res.status(500).json({message: 'Server error'});
    }
});
module.exports = router;