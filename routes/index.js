const AppController = require('../controllers/AppController');

module.exports = function routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
};
