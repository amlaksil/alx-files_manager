const express = require('express');
const routes = require('./routes/index');

const port = process.env.PORT || 5000;
const app = express();

// Load all routes from routes/index.js
routes(app);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
