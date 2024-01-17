const Queue = require('bull');

// Create the fileQueue
const fileQueue = new Queue('fileQueue');

// Create the userQueue
const userQueue = new Queue('userQueue');

module.exports = { fileQueue, userQueue };
