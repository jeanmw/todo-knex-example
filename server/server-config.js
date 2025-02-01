require('dotenv').config()
const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple Bearer Token Middleware
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
    }

    const token = authHeader.split(' ')[1];

    if (token !== process.env.BEARER_TOKEN) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }

    next(); // Proceed to the next middleware/route handler
});

// CORS Configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

module.exports = app;
