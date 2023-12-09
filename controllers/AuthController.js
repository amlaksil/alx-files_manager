import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

const AuthController = {
  getConnect: (req, res) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract email and password from Basic auth header
    const encodedCredentials = authorization.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [email, password] = decodedCredentials.split(':');

    // Hash the password using SHA1
    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    // Find the user associated with the email and hashed password
    const user = dbClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a random token
    const token = uuidv4();

    // Create a key for storing the user ID in Redis
    const key = `auth_${token}`;

    // Store the user ID in Redis with an expiration of 24 hours
    redisClient.set(key, user.id, (error, result) => {
      if (error) {
        console.error('Error storing token in Redis:', error);
        return res.status(500).json({ error: 'An error occurred while storing the token' });
      }

      // Set the expiration time in seconds (24 hours = 86400 seconds)
      const expirationTime = 86400;

      redisClient.expire(key, expirationTime, (error, result) => {
        if (error) {
          console.error('Error setting expiration time in Redis:', error);
          return res.status(500).json({ error: 'An error occurred while setting the expiration time' });
        }
        return result;
      });
      return result;
    });
    return res.status(200).json({ token });
  },

  getDisconnect: (req, res) => {
    const { 'x-token': token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Delete the token from Redis
    redisClient.del(`auth_${token}`);

    return res.sendStatus(204);
  },
};

module.exports = AuthController;
