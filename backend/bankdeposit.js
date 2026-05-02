// bankdeposit.js
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// 1. Add the new fields to your schema
const bankDepositSchema = new mongoose.Schema({
    reservationId: { type: String, required: true },
    userId: { type: String },           // Added
    restaurantId: { type: String },     // Added
    packageId: { type: String },        // Added
    depositorName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    reference: { type: String, required: true },
    depositDate: { type: String },
    depositTime: { type: String },
    packageName: { type: String },
    price: { type: String },
    receiptImage: { type: String }, 
    status: { type: String, default: 'Pending Verification' },
    createdAt: { type: Date, default: Date.now }
});

const BankDeposit = mongoose.model('BankDeposit', bankDepositSchema);

router.post('/', async (req, res) => {
    try {
        // 2. Destructure the new fields from the request body
        const {
            reservationId,
            userId,
            restaurantId,
            packageId,
            depositorName,
            accountNumber,
            reference,
            depositDate,
            depositTime,
            packageName,
            price,
            receiptImage
        } = req.body;

        if (!reservationId || !depositorName || !accountNumber || !reference) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }

        // 3. Save the new deposit record with the extra IDs
        const newDeposit = new BankDeposit({
            reservationId,
            userId,
            restaurantId,
            packageId,
            depositorName,
            accountNumber,
            reference,
            depositDate,
            depositTime,
            packageName,
            price,
            receiptImage
        });
        await newDeposit.save();

        // 4. Update the actual Reservation's status in the database
        try {
            await mongoose.connection.collection('reservations').updateOne(
                { _id: new mongoose.Types.ObjectId(reservationId) },
                { $set: { status: 'deposit_pending' } }
            );
        } catch (updateErr) {
            // Fallback for standard string IDs if ObjectId fails
            await mongoose.connection.collection('reservations').updateOne(
                { id: reservationId },
                { $set: { status: 'deposit_pending' } }
            );
        }

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