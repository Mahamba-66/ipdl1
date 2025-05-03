const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    borrowBook,
    returnBook,
    getUserLoans
} = require('../controllers/loanController');

router.use(auth);
router.post('/borrow', borrowBook);
router.post('/:id/return', returnBook);
router.get('/user', getUserLoans);

module.exports = router;
