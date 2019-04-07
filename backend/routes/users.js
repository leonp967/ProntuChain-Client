var express = require('express');
var router = express.Router();

const UserController = require('../controllers/user_controller');

router.post('/signup', UserController.createUser);

router.post('/login', UserController.userLogin);

module.exports = router;
