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
                id: newFoodPackage._id,
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
//fetching food packages
router.get('/get-food-packages/:resturantId', async(req, res) => {
    try {
        const { resturantId } = req.params;
        const packages = await foodPackage.find({ resturantId });
        
        const formattedPackages = packages.map(pkg => ({
            id: pkg._id.toString(),
            resturantId: pkg.resturantId,
            title: pkg.title,
            price: pkg.price,
            note: pkg.note,
            image: pkg.image
        }));

        res.status(200).json({ packages: formattedPackages });
    } catch (error) {
        console.error('Error fetching food packages:', error);
        res.status(500).json({ message: 'Server error' });
    }
})
//update food package
router.put('/update-food-package/:id', async(req,res)=>{
    try {
        const {id} = req.params;
        const {title,price,note,image} = req.body;
        if(!title || !price || !note) {
            return res.status(400).json({message: 'All fields are required'});
        }
        const updatedPackage = await foodPackage.findByIdAndUpdate(
            id, 
            {title,price,note,image},
            {new:true}
        );
        if(!updatedPackage) {
            return res.status(404).json({message: 'Food package not found'});
        }
        res.status(200).json({
            message: 'Food package updated successfully',
            foodPackage: {
                id: updatedPackage._id,
                resturantId: updatedPackage.resturantId,
                title: updatedPackage.title,
                price: updatedPackage.price,
                note: updatedPackage.note,
                image: updatedPackage.image,
            }
        });
    } catch (error) {
        console.error('Error updating food package:', error);
        res.status(500).json({message: 'Server error'});
    }
});
//delete food package
router.delete('/delete-food-package/:id', async(req,res)=>{
    try {
        const {id} = req.params;
        const deletedPackage = await foodPackage.findByIdAndDelete(id);
        if(!deletedPackage) {
            return res.status(404).json({message: 'Food package not found'});
        }
        res.status(200).json({message: 'Food package deleted successfully'});
    } catch (error) {
        console.error('Error deleting food package:', error);
        res.status(500).json({message: 'Server error'});
    }
});

//Fetching all food packages for customers
router.get('/get-all-food-packages', async(req,res) => {
    try {
        const packages = await foodPackage.find();
        const formattedPackages = packages.map(pkg => ({
            id: pkg._id.toString(),
            resturantId: pkg.resturantId,
            title: pkg.title,
            price: pkg.price,
            note: pkg.note,
            image: pkg.image
        }));
        res.status(200).json({ packages: formattedPackages });
    } catch (error) {
        console.error('Error fetching food packages:', error);
        res.status(500).json({ message: 'Server error' });  
    }
});
module.exports = router;