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
// Get Reviews
router.get('/show-reviews/:email', async (req, res) => {
    try {
        const User = mongoose.model('User');
        const user = await User.findOne({ email: req.params.email });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const reviews = await Review.find({ userId: user._id }).populate('restaurantId', 'restaurantName');
        res.status(200).json({reviews});
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
//update review 
router.put('/update-review/:id', async(req,res) => {
    try {
        const {id} = req.params;
        const {rating,text} = req.body;
        if(!rating || !text) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const updatedReview = await Review.findByIdAndUpdate(
            id,
            {rating,text},
            {new:true}
        );
        if(!updatedReview) {
            return res.status(404).json({message: 'Review not found'});
        }
        res.status(200).json({
            message: 'Review updated successfully',
            review: {
                id: updatedReview._id,
                userId: updatedReview.userId,
                restaurantId: updatedReview.restaurantId,
                rating: updatedReview.rating,
                text: updatedReview.text,
            }
        });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({message: 'Server error'});
    }
});
// Delete review 
router.delete('/delete-review/:id', async(req,res) =>{
    try {
        const {id} = req.params;
        const deletedReview = await Review.findByIdAndDelete(id);
        if(!deletedReview) {
            return res.status(404).json({message: 'Review not found'});
        }
        res.status(200).json({message: 'Review deleted successfully'});
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({message: 'Server error'});
    }
})
module.exports = router;