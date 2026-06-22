const router = require('express').Router();
const { createRoom, getRoom, updateLanguage } = require('../controllers/roomController');
const { optionalAuth } = require('../middleware/auth');

// optionalAuth — logged-in users get createdBy set; guests can still create rooms
router.post('/',                    optionalAuth, createRoom);
router.get('/:roomId',              getRoom);
router.patch('/:roomId/language',   updateLanguage);

module.exports = router;
