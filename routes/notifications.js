const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.render('home'));
router.get('/notifications', (req, res) => res.render('notification'));

module.exports = router;