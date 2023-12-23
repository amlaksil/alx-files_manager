import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AppController = {
  getStatus: async (req, res) => {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    return res.status(200).json({ redis: redisAlive, db: dbAlive });
  },

  getStats: async (req, res) => {
    try {
      const nbUsers = await dbClient.db.collection('users').countDocuments();
      const nbFiles = await dbClient.db.collection('files').countDocuments();

      return res.status(200).json({ users: nbUsers, files: nbFiles });
    } catch (error) {
      console.error('Error retrieving stats:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = AppController;
