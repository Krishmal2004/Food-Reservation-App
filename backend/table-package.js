const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const tableSchema = new mongoose.Schema({
    resturantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resturant_login',
        required: true,
    },
    tableNumber: {
        type: String,
        required: true,
        trim: true,
    },
    seats: {
        type: Number,
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
    note: {
        type: String,
        default: '',
    },
    price: {
        type: String,
        required: true,
        default: '0',
    }
}, { timestamps: true });

const Table = mongoose.model('Table_Package', tableSchema);

// create a table 
router.post('/create-table-package', async (req, res) => {
    try {
        const { resturantId, tableNumber, seats, date, time, note, price } = req.body;
        
        if (!tableNumber || !seats || !date || !time || !price) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const parsedSeats = parseInt(seats, 10);
        if (isNaN(parsedSeats)) {
            return res.status(400).json({ message: 'Seats must be a valid number' });
        }
        
        const newTableReservation = new Table({
            resturantId,
            tableNumber,
            seats: parsedSeats,
            date,
            time,
            note,
            price,
        });
        
        await newTableReservation.save();
        
        res.status(201).json({
            message: 'Table reservation created successfully',
            table: {
                id: newTableReservation._id,
                resturantId: newTableReservation.resturantId,
                tableNumber: newTableReservation.tableNumber,
                seats: newTableReservation.seats,
                date: newTableReservation.date,
                time: newTableReservation.time,
                note: newTableReservation.note,
                price: newTableReservation.price,
            }
        });
    } catch (error) {
        console.error('Error creating table reservation:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// get the package 
router.get('/get-table-packages/:resturantId', async (req, res) => {
    try {
        const { resturantId } = req.params;
        console.log('Fetching tables for restaurant ID:', resturantId);
        const tables = await Table.find({ resturantId });
        
        const formattedTables = tables.map(t => ({
            id: t._id.toString(),
            tableNumber: t.tableNumber,
            seats: t.seats,
            date: t.date,
            time: t.time,
            note: t.note,
            price: t.price,
        }));

        res.status(200).json({ tables: formattedTables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

//update table package
router.put('/update-table-package/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { tableNumber, seats, date, time, note, price } = req.body;
        
        if (!tableNumber || !seats || !date || !time) {
            return res.status(400).json({ message: 'All mandatory fields are required' });
        }

        const parsedSeats = parseInt(seats, 10);
        if (isNaN(parsedSeats)) {
            return res.status(400).json({ message: 'Seats must be a valid number' });
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            { tableNumber, seats: parsedSeats, date, time, note, price },
            { new: true }
        );

        if (!updatedTable) {
            return res.status(404).json({ message: 'Table not found' });
        }

        res.status(200).json({ message: 'Table updated successfully', table: updatedTable });
    } catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// delete table reservation
router.delete('/delete-table-package/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTable = await Table.findByIdAndDelete(id);
        
        if (!deletedTable) {
            return res.status(404).json({ message: 'Table not found' });
        }
        
        res.status(200).json({ message: 'Table deleted successfully' });
    } catch (error) {
        console.error('Error deleting table:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;