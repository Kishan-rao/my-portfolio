const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./portfolio.db', (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.serialize(() => {
            // Create Contacts Table
            db.run(`CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                message TEXT,
                date TEXT
            )`);

            // Create Visitors Table
            db.run(`CREATE TABLE IF NOT EXISTS visitors (
                count INTEGER
            )`);

            // Initialize counter if empty
            db.get("SELECT count FROM visitors", (err, row) => {
                if (!row) {
                    db.run("INSERT INTO visitors (count) VALUES (0)");
                }
            });

            // Create Resume Tables
            db.run(`CREATE TABLE IF NOT EXISTS experience (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role TEXT,
                company TEXT,
                duration TEXT,
                description TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT,
                items TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                description TEXT,
                link TEXT
            )`);

            // Seed Data (Check if empty first to avoid duplicates)
            // We wrap this in a slight delay or ensure it runs after table creation
            // In serialize(), it should run sequentially, but let's be safe with error handling
            db.get("SELECT count(*) as count FROM experience", (err, row) => {
                if (err) {
                    // Table might not be ready yet if async issues persist, but serialize usually handles this.
                    // If error, we just skip seeding for now.
                    console.log("Skipping seed check due to error (table might be creating):", err.message);
                    return;
                }

                if (row && row.count === 0) {
                    console.log("Seeding initial data...");

                    // Experience
                    const experiences = [
                        ['Software Engineer Intern', 'Tech Solutions Inc.', 'Jan 2024 - Present', 'Developed backend APIs using Node.js and optimized database queries.'],
                        ['Web Developer', 'Freelance', 'Jun 2023 - Dec 2023', 'Built responsive websites for local businesses using HTML, CSS, and JavaScript.']
                    ];
                    const expStmt = db.prepare("INSERT INTO experience (role, company, duration, description) VALUES (?, ?, ?, ?)");
                    experiences.forEach(exp => expStmt.run(exp));
                    expStmt.finalize();

                    // Skills
                    const skills = [
                        ['Languages', 'JavaScript, Java, Python'],
                        ['Web Technologies', 'HTML, CSS'],
                        ['Core Concepts', 'Database Management, DSA, OOP'],
                        ['Tools', 'Git, GitHub, VSCode, IntelliJ']
                    ];
                    const skillStmt = db.prepare("INSERT INTO skills (category, items) VALUES (?, ?)");
                    skills.forEach(skill => skillStmt.run(skill));
                    skillStmt.finalize();

                    // Projects
                    const projects = [
                        ['FinSecure Al - Advanced Spam Text Detector', 'Built a real-time spam detection web application using FastAPI. Implemented an ensemble model combining Naive Bayes, LSTM, and CNN for text classification. Achieved ~99% accuracy on spam classification through preprocessing and model tuning. Developed APIs for model inference and integrated them with an interactive Ul. Engineered a high-performance FastAPI web application that processes real-time text analysis, combining multiple Al algorithms to deliver 99% spam classification accuracy with interactive confidence scoring.', '#'],
                        ['SwiftLink - High-Performance URL Shortening Service', 'Developed a scalable URL shortening service using Java 21 and Spring Boot. Implemented REST APIs for link creation, redirection, and click analytics. Integrated Redis caching to reduce database load and improve response time. Added features including custom aliases, JWT authentication, and rate limiting.', '#'],
                        ['Portfolio Website', 'A personal portfolio website to showcase my skills and projects.', '#']
                    ];
                    const projStmt = db.prepare("INSERT INTO projects (title, description, link) VALUES (?, ?, ?)");
                    projects.forEach(proj => projStmt.run(proj));
                    projStmt.finalize();
                }
            });
        });
    }
});

module.exports = db;
