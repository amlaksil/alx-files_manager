const Queue = require('bull');

// Create the fileQueue
const fileQueue = new Queue('fileQueue');

module.exports = fileQueue;
