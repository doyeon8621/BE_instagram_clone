const express = require('express');
const router = express.Router();
const {Posts} = require('../models/posts');
const authMiddleware = require('../middlewares/auth-middleware');



module.exports = router;
