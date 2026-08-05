// server.js — local development entry point.
// On Vercel, backend/api/index.js is deployed directly as a serverless function
// and static files are served automatically; this file is only used
// when running `npm start` on your own machine.
const path = require('path');
const express = require('express');
const app = require('./api/index');

const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS, images) from the frontend folder.
app.use(express.static(path.join(__dirname, '..', 'frontend'), { index: 'index.html' }));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
