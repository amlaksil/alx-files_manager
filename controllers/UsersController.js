import dbClient from '../utils/db';

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
          return res.status(400).json({ error: 'Already exists' });
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
              email,
              id: insertedId,
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
};

module.exports = UsersController;
