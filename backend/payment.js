const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-payment-intent', async (req,res) => {
    try {
        const {amount, currency} = req.body;
        
        const numericAmount = parseFloat(amount);

        if (!numericAmount || isNaN(numericAmount) || numericAmount < 0.5) {
            return res.status(400).json({
                error: 'Invalid amount. Minimum amount is $0.50'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(numericAmount * 100), 
            currency: currency || 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

router.post('/bank-deposit', async (req,res) => {
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
        }res.status(200).json({
            message: 'Bank deposit submitted successfully.',
            reservationId: reservationId,
            status: 'deposit_pending'
        });

    } catch (error) {
        console.error('Error processing bank deposit:', error);
        res.status(500).json({ error: 'Failed to process bank deposit.' });
    }
});
module.exports = router; 