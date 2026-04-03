const express = require('express');
const { default: mongoose } = require('mongoose');

const router = express.Router();

const functionHallSchema = new mongoose.Schema({
    resturantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resturant_login',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    capacity: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    freeDate: {
        type: String, 
        default: ''
    },
    freeTime: {
        type: String, 
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    packageDetails: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1549429402-39c4f5263654?q=80&w=2070'
    }
}, { timestamps: true });

const FunctionHall = mongoose.model('Function_Hall', functionHallSchema);

router.post('/create-hall-package', async (req, res) => {
    try {
        const { resturantId, title, capacity, price, freeDate, freeTime, description, packageDetails, image } = req.body;
        if (!resturantId || !title || !capacity || !price) {
            return res.status(400).json({ message: 'Title, Capacity, Price, and Restaurant ID are required' });
        }
        const newHallPackage = new FunctionHall({
            resturantId,
            title,
            capacity,
            price,
            freeDate,
            freeTime,
            description,
            packageDetails,
            image,
        });
        await newHallPackage.save();
        res.status(201).json({
            message: 'Function hall package created successfully',
            package: {
                id: newHallPackage._id,
                ...newHallPackage._doc
            }
        });
    } catch (error) {
        console.error('Error creating function hall package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/get-hall-packages/:resturantId', async (req, res) => {
    try {
        const { resturantId } = req.params;
        const packages = await FunctionHall.find({ resturantId });
        
        const formattedPackages = packages.map(pkg => ({
            id: pkg._id.toString(),
            resturantId: pkg.resturantId,
            title: pkg.title,
            capacity: pkg.capacity,
            price: pkg.price,
            freeDate: pkg.freeDate,
            freeTime: pkg.freeTime,
            description: pkg.description,
            packageDetails: pkg.packageDetails,
            image: pkg.image
        }));

        res.status(200).json({ packages: formattedPackages });
    } catch (error) {
        console.error('Error fetching function hall packages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-hall-package/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, capacity, price, freeDate, freeTime, description, packageDetails, image } = req.body;
        
        if (!title || !capacity || !price) {
            return res.status(400).json({ message: 'Title, Capacity, and Price are required' });
        }
        const updatedPackage = await FunctionHall.findByIdAndUpdate(
            id, 
            { title, capacity, price, freeDate, freeTime, description, packageDetails, image },
            { new: true }
        );
        if (!updatedPackage) {
            return res.status(404).json({ message: 'Function hall package not found' });
        }
        res.status(200).json({
            message: 'Function hall package updated successfully',
            package: {
                id: updatedPackage._id,
                ...updatedPackage._doc
            }
        });
    } catch (error) {
        console.error('Error updating function hall package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/delete-hall-package/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPackage = await FunctionHall.findByIdAndDelete(id);
        
        if (!deletedPackage) {
            return res.status(404).json({ message: 'Function hall package not found' });
        }
        
        res.status(200).json({ message: 'Function hall package deleted successfully' });
    } catch (error) {
        console.error('Error deleting function hall package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/get-all-hall-packages', async (req, res) => {
    try {
        const packages = await FunctionHall.find();
        const formattedPackages = packages.map(pkg => ({
            id: pkg._id.toString(),
            resturantId: pkg.resturantId,
            title: pkg.title,
            capacity: pkg.capacity,
            price: pkg.price,
            freeDate: pkg.freeDate,
            freeTime: pkg.freeTime,
            description: pkg.description,
            packageDetails: pkg.packageDetails,
            image: pkg.image
        }));

        res.status(200).json({ packages: formattedPackages });
    } catch (error) {
        console.error('Error fetching all function hall packages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;