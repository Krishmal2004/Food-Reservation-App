const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// 1. Define the Mongoose Schema for Bank Deposits
const bankDepositSchema = new mongoose.Schema({
    reservationId: { type: String, required: true },
    depositorName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    reference: { type: String, required: true },
    depositDate: { type: String },
    depositTime: { type: String },
    packageName: { type: String },
    price: { type: String },
    receiptImage: { type: String }, // Stores the Base64 image string
    status: { type: String, default: 'Pending Verification' },
    createdAt: { type: Date, default: Date.now }
});

// Create the Model
const BankDeposit = mongoose.model('BankDeposit', bankDepositSchema);

// 2. Define the POST Route to receive frontend JSON data
router.post('/', async (req, res) => {
    try {
        const {
            reservationId,
            depositorName,
            accountNumber,
            reference,
            depositDate,
            depositTime,
            packageName,
            price,
            receiptImage
        } = req.body;

        // Validation
        if (!reservationId || !depositorName || !accountNumber || !reference) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }

        // Create a new deposit document
        const newDeposit = new BankDeposit({
            reservationId,
            depositorName,
            accountNumber,
            reference,
            depositDate,
            depositTime,
            packageName,
            price,
            receiptImage
        });

        // Save it to MongoDB
        await newDeposit.save();

        // NOTE: If you want to update the original reservation status to 'deposit_pending', 
        // you would import your Reservation model here and update it:
        // const Reservation = require('./booking-reservation').Model; (adjust to your path)
        // await Reservation.findByIdAndUpdate(reservationId, { status: 'deposit_pending' });

        // Send success response back to React Native
        res.status(200).json({
            message: 'Bank deposit submitted successfully.',
            reservationId: reservationId,
            status: 'deposit_pending'
        });

    } catch (error) {
        console.error('Error saving bank deposit:', error);
        res.status(500).json({ error: 'Failed to process bank deposit.' });
    }
});

module.exports = router;