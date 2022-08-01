const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require("cors")
require('dotenv').config();

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString);
const database = mongoose.connection

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

app.use(
    cors({
	origin: "*",
    methods: ["GET", "POST"],
})
)

app.use(express.json())

const subscribersRouter = require('./routes/routes')
app.use('/questions', subscribersRouter)

app.listen(5001, () => {
    console.log(`Server Started at ${5001}`)
})