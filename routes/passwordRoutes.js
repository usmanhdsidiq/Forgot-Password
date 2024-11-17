const express = require('express');
const passwordController = require('../controllers/passwordController');
const router = express.Router();

router.get('/forgot-password', (req, res) => res.render('forgot'));
router.post('/forgot', passwordController.forgotPassword);

router.get('/reset-password', (req, res) => res.render('reset', { token: req.query.token }));
router.post('/reset', passwordController.resetPassword);

module.exports = router;