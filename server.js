const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname)));

// API: Contact Form Submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    const date = new Date().toISOString();

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `INSERT INTO contacts (name, email, message, date) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, message, date], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Message sent successfully!", id: this.lastID });
    });
});

// API: Get Resume Data
app.get('/api/resume-data', (req, res) => {
    const data = {};

    db.all("SELECT * FROM experience", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        data.experience = rows;

        db.all("SELECT * FROM skills", (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            data.skills = rows;

            db.all("SELECT * FROM projects", (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                data.projects = rows;
                res.json(data);
            });
        });
    });
});

// API: Visitor Counter
app.get('/api/visit', (req, res) => {
    db.run("UPDATE visitors SET count = count + 1", (err) => {
        if (err) return res.status(500).json({ error: err.message });

        db.get("SELECT count FROM visitors", (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ count: row.count });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
