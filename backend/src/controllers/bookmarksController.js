// src/controllers/bookmarksController.js
const prisma = require('../prisma');
const axios = require('axios');
const cheerio = require('cheerio');

// Helper function to fetch title
async function fetchMetadata(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    return $('head > title').text() || url;
  } catch (err) {
    return url; // Fallback to URL if fetch fails
  }
}

// POST /api/bookmarks
exports.createBookmark = async (req, res) => {
  try {
    let { url, title, description, tags } = req.body;
    const userId = req.user.userId; // Securely get user ID from token

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // BONUS: Auto-fetch title if missing
    if (!title) {
      title = await fetchMetadata(url);
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title,
        description,
        tags: tags || [],
        userId: userId // Link to the logged-in user
      }
    });

    res.status(201).json(bookmark);
  } catch (error) {
    console.error("Create Bookmark Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/bookmarks?q=search&tags=tag1,tag2
exports.getBookmarks = async (req, res) => {
  try {
    const { q, tags } = req.query;
    const userId = req.user.userId;

    const query = {
      where: {
        userId: userId // FILTER: Only fetch bookmarks for this user
      },
      orderBy: { createdAt: 'desc' }
    };

    // Search Logic (Title or Description)
    if (q) {
      query.where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Tag Logic
    if (tags) {
      const tagArray = tags.split(',');
      query.where.tags = { hasSome: tagArray };
    }

    const bookmarks = await prisma.bookmark.findMany(query);
    res.json(bookmarks);
  } catch (error) {
    console.error("Get Bookmarks Error:", error);
    res.status(500).json({ error: 'Error fetching bookmarks' });
  }
};

// PUT /api/bookmarks/:id
exports.updateBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, description, tags, isFavorite } = req.body;
    const userId = req.user.userId;

    // 1. Verify ownership first
    const existingBookmark = await prisma.bookmark.findFirst({
      where: { id, userId }
    });

    if (!existingBookmark) {
      return res.status(404).json({ error: 'Bookmark not found or unauthorized' });
    }

    // 2. Update logic
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: { url, title, description, tags, isFavorite }
    });

    res.json(updatedBookmark);
  } catch (error) {
    console.error("Update Bookmark Error:", error);
    res.status(500).json({ error: 'Error updating bookmark' });
  }
};

// DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Use deleteMany to safely ensure we only delete if the userId matches.
    // Standard .delete() throws an error if we try to filter by non-unique fields.
    const result = await prisma.bookmark.deleteMany({
      where: { 
        id: id,
        userId: userId
      }
    });

    if (result.count === 0) {
      return res.status(404).json({ error: 'Bookmark not found or unauthorized' });
    }

    res.json({ message: 'Bookmark deleted' });
  } catch (error) {
    console.error("Delete Bookmark Error:", error);
    res.status(500).json({ error: 'Error deleting bookmark' });
  }
};
// Add this new function
exports.getBookmarkById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId }
    });

    if (!bookmark) return res.status(404).json({ error: 'Bookmark not found' });
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookmark' });
  }
};