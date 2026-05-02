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
    receiptImage: { type: String }, // Stores the Base64 image string
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