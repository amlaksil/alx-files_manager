import dbClient from './utils/db';

const Queue = require('bull');
const thumbnail = require('image-thumbnail');
const { ObjectId } = require('mongodb');
const fs = require('fs');

// Create the fileQueue
const fileQueue = new Queue('fileQueue');

// Process the fileQueue
fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  // Find the file document in the database
  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId });

  if (!file) {
    throw new Error('File not found');
  }

  // Generate thumbnails using image-thumbnail library
  const thumbnailOptions = { width: 500 };
  const thumbnail500 = await thumbnail(file.path, thumbnailOptions);
  await fs.writeFile(`${file.path}_500`, thumbnail500);

  thumbnailOptions.width = 250;
  const thumbnail250 = await thumbnail(file.path, thumbnailOptions);
  await fs.writeFile(`${file.path}_250`, thumbnail250);

  thumbnailOptions.width = 100;
  const thumbnail100 = await thumbnail(file.path, thumbnailOptions);
  await fs.writeFile(`${file.path}_100`, thumbnail100);
});

module.exports = fileQueue;
