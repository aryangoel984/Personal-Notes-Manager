// src/controllers/notesController.js
const prisma = require('../prisma');

// GET /api/notes?q=search&tags=tag1,tag2
exports.getNotes = async (req, res) => {
  try {
    const { q, tags } = req.query;
    const userId = req.user.userId; // Extracted from authMiddleware

    const query = {
      where: {
        userId: userId // FILTER: Only fetch notes for this user
      },
      orderBy: { updatedAt: 'desc' }
    };

    // Search Logic (Title OR Content)
    if (q) {
      query.where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Tag Logic (Prisma 5 Array Filter)
    if (tags) {
      const tagArray = tags.split(',');
      query.where.tags = { hasSome: tagArray };
    }

    const notes = await prisma.note.findMany(query);
    res.json(notes);
  } catch (error) {
    console.error("Get Notes Error:", error);
    res.status(500).json({ error: 'Error fetching notes' });
  }
};

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user.userId; // Extracted from authMiddleware

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and Content are required' });
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags: tags || [],
        userId: userId // LINK: Associate note with the logged-in user
      }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create Note Error:", error);
    res.status(500).json({ error: 'Error creating note' });
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, isFavorite } = req.body;
    const userId = req.user.userId;

    // Prisma update will throw an error if the record isn't found
    // We add userId to 'where' to ensure they own the note they are updating
    const updatedNote = await prisma.note.update({
      where: { 
        id: id,
        userId: userId // SECURITY: Ensure user owns this note
      },
      data: { title, content, tags, isFavorite }
    });

    res.json(updatedNote);
  } catch (error) {
    // Check if error is because record wasn't found (Prisma error code P2025)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }
    console.error("Update Note Error:", error);
    res.status(500).json({ error: 'Error updating note' });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    await prisma.note.delete({
      where: { 
        id: id,
        userId: userId // SECURITY: Ensure user owns this note
      }
    });

    res.json({ message: 'Note deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }
    console.error("Delete Note Error:", error);
    res.status(500).json({ error: 'Error deleting note' });
  }
};
// Add this new function
exports.getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const note = await prisma.note.findFirst({
      where: { id, userId } // Ensure ownership
    });

    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching note' });
  }
};