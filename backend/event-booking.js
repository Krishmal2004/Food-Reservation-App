const express = require('express');
const {default: mongoose} = require('mongoose');

const router = express.Router();

const eventBookingSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Function_Hall',
        required: true,
    },
    resturantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resturant_login',
        required: true,
    },
    eventType: {
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
        type: String,
        required: true,
    },
    specialRequests: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        default: 'Pending', 
    }
}, { timestamps: true });

const EventBooking = mongoose.model('Event_Booking', eventBookingSchema);

router.post('/create-booking', async (req, res) => {
    try {
        const { userEmail, packageId, resturantId, eventType, date, time, guests, specialRequests } = req.body;

        if(!userEmail || !packageId || !resturantId || !eventType || !date || !time || !guests) {
            return res.status(400).json({ message: 'All fields except special requests are required' });
        }
        const newBooking = new EventBooking({
            userEmail,
            packageId,
            resturantId,
            eventType,
            date,
            time,
            guests,
            specialRequests,
        });
        await newBooking.save();    

        res.status(201).json({ message: 'Event booking created successfully', booking: newBooking });
    } catch (error) {
        console.error('Error creating event booking:', error);
        res.status(500).json({ message: 'Server error while creating event booking' });
    }
});

router.get('/user-booking/:email', async (req,res) => {
    try {
        const {email} = req.params;
        const bookings = await EventBooking.find({ userEmail: email })
            .populate('packageId', 'title image price capacity')
            .sort({ createdAt: -1 });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error while fetching user bookings' });
    }
});

router.get('/restaurant-bookings/:resturantId', async (req, res) => {
    try {
        const { resturantId } = req.params;
        const bookings = await EventBooking.find({ resturantId })
            .populate('packageId', 'title image')
            .sort({ createdAt: -1 });

        res.status(200).json({ bookings });
    } catch (error) {
        console.error('Error fetching restaurant event bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-event-status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const updatedBooking = await EventBooking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Status updated', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;