const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resturant_login',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
},{timestamps: true});
const Review = mongoose.model('Review', reviewSchema);

router.post('/add-review', async (req,res) =>{
    try {
        const {userEmail, restaurantId, rating, text} = req.body;
        
        if(!userEmail || !restaurantId || !rating || !text) {
            return res.status(400).json({message: 'All fields are required'});
        }

        const User = mongoose.model('User');
        const existingUser = await User.findOne({ email: userEmail });
        
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newReview = new Review({
            userId: existingUser._id, 
            restaurantId,
            rating,
            text
        });
        
        await newReview.save();
        
        res.status(201).json({
            message: 'Review added successfully',
            review: newReview
        });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;