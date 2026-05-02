const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const bankDepositSchema = new mongoose.Schema({
    reservationId: { type: String, required: true },
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

        if (!reservationId || !depositorName || !accountNumber || !reference) {
            return res.status(400).json({ error: 'Please fill in all required fields.' });
        }

        // 1. Save the new deposit record
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
        await newDeposit.save();

        // 2. Update the actual Reservation's status in the database
        // We use mongoose.connection.collection to update it directly, 
        // assuming your reservations collection is named 'reservations'.
        try {
            await mongoose.connection.collection('reservations').updateOne(
                { _id: new mongoose.Types.ObjectId(reservationId) },
                { $set: { status: 'deposit_pending' } }
            );
        } catch (updateErr) {
            console.error('Warning: Failed to update reservation status, but deposit was saved.', updateErr);
            // If your ID isn't an ObjectId (e.g. standard string), fallback to a string query:
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