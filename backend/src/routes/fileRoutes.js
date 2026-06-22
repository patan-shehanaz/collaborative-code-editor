const express = require('express');
const { listFiles, createFile, renameFile, deleteFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoomAccess } = require('../middleware/roomAccessMiddleware');

// Mounted in app.js at /api/rooms/:roomCode/files — mergeParams lets this router
// see :roomCode from the parent path.
const router = express.Router({ mergeParams: true });

router.use(protect, requireRoomAccess);

router.get('/', listFiles);
router.post('/', createFile);
router.patch('/:fileId', renameFile);
router.delete('/:fileId', deleteFile);

module.exports = router;
