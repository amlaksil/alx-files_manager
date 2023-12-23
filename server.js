const express = require('express');
const routes = require('./routes/index');

const port = process.env.PORT || 5000;
const app = express();
// const port = process.env.PORT || 5000;

// Parse the request body as JSON
app.use(express.json());

// Register the 'routes' middleware to handle requests at the root path
app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
