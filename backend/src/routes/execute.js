const router = require('express').Router();
const { executeCode } = require('../controllers/executeController');

// No auth required — rooms are open
router.post('/', executeCode);

module.exports = router;
