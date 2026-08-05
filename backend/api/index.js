const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool, init } = require('../db');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Make sure tables exist / are seeded before handling any API request.
app.use(async (req, res, next) => {
    try {
        await init();
        next();
    } catch (err) {
        console.error('DB init error:', err.message);
        res.status(500).json({ error: 'Database initialization failed' });
    }
});

// API: Contact Form Submission
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO contacts (name, email, message, date) VALUES (?, ?, ?, ?)',
            [name, email, message, new Date()]
        );
        res.json({ message: 'Message sent successfully!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Get Resume Data
app.get('/api/resume-data', async (req, res) => {
    try {
        const [experience] = await pool.query('SELECT * FROM experience');
        const [skills] = await pool.query('SELECT * FROM skills');
        const [projects] = await pool.query('SELECT * FROM projects');
        res.json({ experience, skills, projects });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Visitor Counter
app.get('/api/visit', async (req, res) => {
    try {
        await pool.query('UPDATE visitors SET count = count + 1');
        const [rows] = await pool.query('SELECT count FROM visitors');
        res.json({ count: rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
