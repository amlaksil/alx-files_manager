import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const ensureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

const FilesController = {
  postUpload: async (req, res) => {
    const { 'x-token': token } = req.headers;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      // const user = await dbClient.db.collection('users').findOne({ token });
      const userId = await redisClient.getAsync(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const file = {
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
      };

      if (type === 'folder') {
        const result = await dbClient.db.collection('files').insertOne(file);
        const createdFile = { id: result.insertedId, ...file };
        return res.status(201).json(createdFile);
      }
      ensureDirectoryExists(FOLDER_PATH);
      const filePath = path.join(FOLDER_PATH, `${uuidv4()}`);

      const fileContent = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileContent);

      file.localPath = filePath;

      const result = await dbClient.db.collection('files').insertOne(file);
      const createdFile = { id: result.insertedId, ...file };
      return res.status(201).json(createdFile);
    } catch (err) {
      console.error('Error creating file:', err);
      return res.status(500).json({ error: 'An error occurred while creating the file' });
    }
  },
};

module.exports = FilesController;
