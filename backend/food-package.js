const express = require('express');
const {default: mongoose} = require('mongoose');    

const router = express.Router();
const foodPackageSchema = new mongoose.Schema({
    resturantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resturant_login',
        required: false,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: true,
    },
    image: {
        type:String,
        default: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=1000'
    }
},{timestamps: true});
const foodPackage = mongoose.model('Food_Package', foodPackageSchema);

//Creating Food Package
router.post('/create-food-package', async(req,res)=>{
    try {
        const {resturantId,title,price,note,image} = req.body;
        if(!title || !price || !note) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const newFoodPackage = new foodPackage({
            resturantId,
            title,
            price,
            note,
            image,
        });
        await newFoodPackage.save();
        res.status(201).json({
            message: 'Food package created successfully',
            foodPackage: {
                resturantId: newFoodPackage.resturantId,
                title: newFoodPackage.title,
                price: newFoodPackage.price,
                note: newFoodPackage.note,
                image: newFoodPackage.image,
            }
        });
    } catch (error) {
        console.error('Error creating food package:', error);
        res.status(500).json({message: 'Server error'});
    }
});
module.exports = router;