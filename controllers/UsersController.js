import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

const UsersController = {
  postNew: (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if the email already exists in the database
    dbClient.db.collection('users')
      .findOne({ email })
      .then((existingUser) => {
        if (existingUser) {
          return res.status(400).json({ error: 'Already exist' });
        }

        // Hash the password using SHA1
        const hashedPassword = crypto
          .createHash('sha1')
          .update(password)
          .digest('hex');

        const newUser = {
          email,
          password: hashedPassword,
        };
        // Save the new user in the "users" collection
        dbClient.db.collection('users')
          .insertOne(newUser)
          .then((result) => {
            const { insertedId } = result;

            // Return the new user with only the email and id
            const responseUser = {
              id: insertedId,
              email,
            };
            return res.status(201).json(responseUser);
          })
          .catch((err) => {
            console.error('Error creating new user:', err);
            return res.status(500).json({ error: 'An error occurred while creating a new user' });
          });
        return res;
      })
      .catch((err) => {
        console.error('Error checking existing user:', err);
        return res.status(500).json({ error: 'An error occurred while checking existing user' });
      });
    return res;
  },

  getMe: (req, res) => {
    const { 'X-Token': token } = req.headers;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve the user ID from Redis using the token
    redisClient.get(`auth_${token}`, (err, userId) => {
      if (err) {
        console.error('Error retrieving user from Redis:', err);
        return res.status(500).json({ error: 'An error occurred while retrieving the user' });
      }

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the user in the database based on the retrieved ID
      dbClient.db.collection('users')
        .findOne({ _id: ObjectId(userId) })
        .then((user) => {
          if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
          }

          const { _id, email } = user;
          const userData = { id: _id, email };

          return res.status(200).json(userData);
        })
        .catch((err) => {
          console.error('Error retrieving user from the database:', err);
          return res.status(500).json({ error: 'An error occurred while retrieving the user' });
        });
      return userId;
    });
    return res;
  },
};

module.exports = UsersController;
