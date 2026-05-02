require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const userLoginRouter = require('./user-login');
const resturantLoginRouter = require('./resturant-login');
const foodPackageRouter = require('./food-package');
const reviewRouter = require('./review');
const reservation = require('./booking-reservation');
const tablePackageRouter = require('./table-package');
const functionHallRouter = require('./function-hall'); 
const eventBookingRouter = require('./event-booking'); 
const paymentRouter = require('./payment');

const app = express();

//app.use(express.json());
app.use(cors({origin: process.env.CROS_ORIGIN || 'http://localhost:3000'}));

//connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err
));

app.use('/api/auth', userLoginRouter);
app.use('/api/auth', resturantLoginRouter);
app.use('/api/resturant', foodPackageRouter);
app.use('/api/user', reviewRouter);
app.use('/api/user', reservation);
app.use('/api/resturant', tablePackageRouter);
app.use('/api/resturant', functionHallRouter);
app.use('/api/user', eventBookingRouter);
app.use('/api/payment', paymentRouter);

//Add the payload limits for handling large images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({origin: process.env.CROS_ORIGIN || 'http://localhost:3000'}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});