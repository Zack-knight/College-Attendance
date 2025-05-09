const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedback, deleteFeedback } = require('../controllers/feedback');
const auth = require('../middleware/auth');

router.post('/submit', auth(), submitFeedback);
router.get('/all', getFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router;