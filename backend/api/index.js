const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Resend } = require('resend');
const { pool, init } = require('../db');

const app = express();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO || 'ykishanrao05@gmail.com';
const CONTACT_EMAIL_FROM = process.env.CONTACT_EMAIL_FROM || 'Portfolio <onboarding@resend.dev>';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function formatSubmittedAt(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short'
    }).format(date);
}

function buildContactEmailHtml({ name, email, message, submittedAt }) {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br>');
    const safeSubmittedAt = escapeHtml(formatSubmittedAt(submittedAt));

    return `
        <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #0f172a;">
            <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #0f172a; color: #ffffff; padding: 20px 24px;">
                    <h1 style="margin: 0; font-size: 22px; line-height: 1.3;">New Portfolio Contact</h1>
                </div>
                <div style="padding: 24px;">
                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Name</p>
                    <p style="margin: 0 0 18px; font-size: 16px;">${safeName}</p>

                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Email</p>
                    <p style="margin: 0 0 18px; font-size: 16px;">
                        <a href="mailto:${safeEmail}" style="color: #2563eb; text-decoration: none;">${safeEmail}</a>
                    </p>

                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Message</p>
                    <div style="margin: 0 0 18px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 16px; line-height: 1.5;">
                        ${safeMessage}
                    </div>

                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase;">Submitted</p>
                    <p style="margin: 0; font-size: 16px;">${safeSubmittedAt}</p>
                </div>
            </div>
        </div>
    `;
}

async function sendContactNotification({ name, email, message, submittedAt }) {
    if (!resend) {
        throw new Error('RESEND_API_KEY is not configured');
    }

    return resend.emails.send({
        from: CONTACT_EMAIL_FROM,
        to: CONTACT_EMAIL_TO,
        subject: `New Portfolio Contact from ${name}`,
        html: buildContactEmailHtml({ name, email, message, submittedAt }),
        replyTo: email
    });
}

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
    const name = req.body.name && req.body.name.trim();
    const email = req.body.email && req.body.email.trim();
    const message = req.body.message && req.body.message.trim();

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const submittedAt = new Date();
        const [result] = await pool.query(
            'INSERT INTO contacts (name, email, message, date) VALUES (?, ?, ?, ?)',
            [name, email, message, submittedAt]
        );

        try {
            await sendContactNotification({ name, email, message, submittedAt });
            res.json({
                success: true,
                message: 'Message sent successfully!',
                id: result.insertId
            });
        } catch (emailErr) {
            console.error('Resend email error:', emailErr);
            res.json({
                success: true,
                message: 'Message saved. Email notification could not be sent.',
                id: result.insertId
            });
        }
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
