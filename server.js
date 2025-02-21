// Import required modules
const express = require('express');
const path = require('path');

// Create an Express app
const app = express();
const host = "localhost";
const port = 8080;
const wwwdir = path.join(__dirname, 'www');

// Serve static files (e.g., HTML, JS, CSS)
app.use(express.static(wwwdir));

// Start the HTTP server
const server = app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});
