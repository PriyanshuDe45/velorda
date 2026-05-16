require('dotenv').config();
const express = require('express');
const helemt = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(helmet({contentSecurityPolicy: false}));
app.use(cors)({origin: process.env.CLIENT_URL, credentials: true })
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

const authLimiter = rateLimit({windowMs: 60*1000, max: 5});

app.use('api/auth', authLimiter, require('./routes/auth'));
app.use('api/categories', require('./routes/categories'));
app.use('api/bicycles', require('./routes/bicycles'));
app.use('api/tariffs', require('./routes/tariffs'));
app.use('api/bookings', require('./routes/bookings'));
app.use('api/applications', require('./routes/applications'));
app.use('api/promocodes', require('./routes/promoCodes'));

app.get('/api/health', (req,res) => res.json ( {success: 'ok'}));

app.listen(process.env.PORT || 5000, () => 
    console.log('Server started at PORT 5000')
);