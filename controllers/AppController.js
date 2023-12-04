import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const waitConnection = () => new Promise((resolve, reject) => {
  let i = 0;
  const repeatFct = async () => {
    await setTimeout(() => {
      i += 1;
      if (i >= 10) {
        reject();
      } else if (!dbClient.isAlive()) {
        repeatFct();
      } else {
        resolve();
      }
    }, 1000);
  };
  repeatFct();
});
let redisStatus = null;
let dbStatus = null;
let nbUsers = null;
let nbFiles = null;

(async () => {
  redisStatus = redisClient.isAlive();
  await waitConnection();
  dbStatus = dbClient.isAlive();
  nbUsers = await dbClient.nbUsers();
  nbFiles = await dbClient.nbFiles();
})();

const AppController = {
  getStatus: (req, res) => {
    if (redisStatus && dbStatus) {
      const status = {
        redis: redisStatus,
        db: dbStatus,
      };
      res.status(200).json(status);
    }
  },

  getStats: (req, res) => {
    const stats = {
      users: nbUsers,
      files: nbFiles,
    };
    res.status(200).json(stats);
  },
};

module.exports = AppController;
