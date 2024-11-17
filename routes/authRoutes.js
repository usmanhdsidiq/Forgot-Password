const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/register', (req, res) => res.render('register'));
router.post('/register', authController.register);
router.get('/login', (req, res) => res.render('login'));
router.post('/login', authController.login);

module.exports = router;