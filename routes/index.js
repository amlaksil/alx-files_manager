const express = require('express');
const AppController = require('../controllers/AppController');
const { UsersController, UserController } = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UserController.getMe);

router.post('/users', UsersController.postNew);

module.exports = router;
