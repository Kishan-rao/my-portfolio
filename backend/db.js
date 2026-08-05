// db.js — MySQL connection pool + schema init + seed data
// Reads connection info from environment variables so the same code
// works locally (via a .env file) and on Vercel (via Project Env Vars).
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

let initialized = false;

// Creates tables if they don't exist and seeds resume/project data once.
// Safe to call on every request — it only does real work the first time.
async function init() {
    if (initialized) return;

    await pool.query(`CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        message TEXT,
        date DATETIME
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS visitors (
        count INT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role VARCHAR(255),
        company VARCHAR(255),
        duration VARCHAR(255),
        description TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(255),
        items TEXT
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        description TEXT,
        link VARCHAR(500)
    )`);

    const [visitorRows] = await pool.query('SELECT count FROM visitors');
    if (visitorRows.length === 0) {
        await pool.query('INSERT INTO visitors (count) VALUES (0)');
    }

    const [[{ count: expCount }]] = await pool.query('SELECT COUNT(*) as count FROM experience');
    if (expCount === 0) {
        console.log('Seeding initial data...');

        const experiences = [
            ['Software Engineer Intern', 'Tech Solutions Inc.', 'Jan 2024 - Present', 'Developed backend APIs using Node.js and optimized database queries.'],
            ['Web Developer', 'Freelance', 'Jun 2023 - Dec 2023', 'Built responsive websites for local businesses using HTML, CSS, and JavaScript.']
        ];
        await pool.query(
            'INSERT INTO experience (role, company, duration, description) VALUES ?',
            [experiences]
        );

        const skills = [
            ['Languages', 'JavaScript, Java, Python'],
            ['Web Technologies', 'HTML, CSS'],
            ['Core Concepts', 'Database Management, DSA, OOP'],
            ['Tools', 'Git, GitHub, VSCode, IntelliJ']
        ];
        await pool.query('INSERT INTO skills (category, items) VALUES ?', [skills]);

        const projects = [
            ['FinSecure AI - Advanced Spam Text Detector', 'Built a real-time spam detection web application using FastAPI. Implemented an ensemble model combining Naive Bayes, LSTM, and CNN for text classification. Achieved ~99% accuracy on spam classification through preprocessing and model tuning.', 'https://finsecure-ai-uepz.onrender.com/'],
            ['SwiftLink - High-Performance URL Shortening Service', 'Developed a scalable URL shortening service using Java 21 and Spring Boot. Implemented REST APIs for link creation, redirection, and click analytics. Integrated Redis caching, custom aliases, JWT authentication, and rate limiting.', 'https://swiftlink-url-shortener-production.up.railway.app/'],
            ['Portfolio Website', 'A personal portfolio website to showcase my skills and projects. Built with vanilla HTML, CSS, and JavaScript with a Node.js/Express backend on MySQL.', '#']
        ];
        await pool.query('INSERT INTO projects (title, description, link) VALUES ?', [projects]);
    }

    initialized = true;
}

module.exports = { pool, init };
