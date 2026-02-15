// src/routes/bookmarks.js
const express = require('express');
const router = express.Router();
const bookmarksController = require('../controllers/bookmarksController');
const authMiddleware = require('../middlewares/authMiddleware'); // Import it

router.use(authMiddleware);

router.get('/', bookmarksController.getBookmarks);
router.post('/', bookmarksController.createBookmark);
router.delete('/:id', bookmarksController.deleteBookmark);
router.put('/:id',bookmarksController.updateBookmark);
router.get('/:id', bookmarksController.getBookmarkById);

module.exports = router;