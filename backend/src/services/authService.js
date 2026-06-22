const express = require('express');
const { create, join, listMine, remove, getOne } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoomAccess } = require('../middleware/roomAccessMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', create);
router.get('/', listMine);
router.post('/:roomCode/join', join);
router.get('/:roomCode', requireRoomAccess, getOne);
router.delete('/:roomId', remove);

module.exports = router;
