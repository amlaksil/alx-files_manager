const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

module.exports = function routes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);

	app.post('/users', UsersController.postNew);
};
