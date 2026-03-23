const express = require('express');
const {default: mongoose} = require('mongoose');

const router = express.Router();

const reservationSchema = new mongoose.Schema({
    userId: {
        type: String, 
        ref: 'User',
        required: true,
    },
    resturantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resturant_login',
        required: true,
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food_Package',
        required: false, 
    },
    customerName: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    time: {
        type: String,   
        required: true,
    },
    guests: { 
        type: Number,
        required: true,
    },
    note: {
        type: String,
        default: '',
    },
    price: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food_Package',
        required: false,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
},{timestamps: true});

const Reservation = mongoose.model('Reservation', reservationSchema);

router.post('/create-reservation', async(req,res) => {
    try {
        const {userEmail, restaurantId, packageId, customerName, date, time, guests, note} = req.body;
        
        // FIXED: Removed customerName from this check. It will auto-fill below!
        if(!userEmail || !restaurantId || !date || !time || !guests) {
            return res.status(400).json({message: 'All fields are required'});
        }
        
        const User = mongoose.model('User');    
        const existingUser = await User.findOne({email: userEmail});
        
        if(!existingUser) {
            return res.status(404).json({message: 'User not found'});
        }
        
        const newReservation = new Reservation({
            userId: existingUser.email,
            resturantId: restaurantId, 
            packageId: packageId || null,
            customerName: customerName || existingUser.fullName, 
            date,
            time,
            guests: Number(guests), 
            note,
        });
        
        await newReservation.save();
        
        res.status(201).json({
            message: 'Reservation created successfully',
            reservation: newReservation
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({message: 'Server error'});
    }
});
//get the Reservation 
router.get('/reservation/:userEmail', async(req,res) => {
    try {
        const {userEmail} = req.params;
        const reservations = await Reservation.find({userId: userEmail}).populate('resturantId', 'restaurantName').populate('packageId', 'title price');
        const formattedReservations = reservations.map(reservation => ({
            id: reservation._id,
            restaurantName: reservation.resturantId?.restaurantName || 'Unknown Restaurant',
            packageName: reservation.packageId?.title || 'Standard Booking',
            date: reservation.date,
            time: reservation.time,
            guests: reservation.guests,
            price: reservation.packageId?.price || '0',
            status: reservation.status
        }));
        res.status(200).json({reservations: formattedReservations});
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({message: 'Server error'});
    }
});

module.exports = router;