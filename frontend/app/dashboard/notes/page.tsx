"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Search, Tag, Trash2, X, Heart } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // New Note State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');

  const fetchNotes = async () => {
    try {
      const query = search ? `?q=${search}` : '';
      const { data } = await api.get(`/notes${query}`);
      setNotes(data);
    } catch (error) {
      toast.error('Failed to load notes');
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search]);
  // @ts-ignore
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);
      await api.post('/notes', {
        title: newTitle,
        content: newContent,
        tags: tagsArray
      });
      
      toast.success('Note created!');
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };
// @ts-ignore
  const toggleFavorite = async (note) => {
    try {
      const updatedNote = { ...note, isFavorite: !note.isFavorite };
      
      // Optimistic UI update: Update state immediately
      // @ts-ignore
      setNotes(notes.map(n => n.id === note.id ? updatedNote : n));

      // Send update to backend
      await api.put(`/notes/${note.id}`, {
        isFavorite: updatedNote.isFavorite
      });
    } catch (error) {
      toast.error('Failed to update favorite');
      fetchNotes(); // Revert on error
    }
  };
// @ts-ignore
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      toast.success('Note deleted');
      // @ts-ignore
      setNotes(notes.filter(n => n.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-700 mt-1">Capture your ideas and thoughts.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
        >
          <Plus size={20} /> New Note
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Search notes by title, content, or tags..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-500 shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
            // @ts-ignore
          <div key={note.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group relative flex flex-col h-64">
            
            {/* Actions Container */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               {/* Favorite Button */}
               <button 
                onClick={() => toggleFavorite(note)}
                className={`p-1.5 rounded-full transition ${
                    // @ts-ignore
                  note.isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
                // @ts-ignore
                title={note.isFavorite ? "Unmark as favorite" : "Mark as favorite"}
              >
                
                <Heart size={18} fill={note.isFavorite ? "currentColor" : "none"} />
              </button>

              {/* Delete Button */}
              <button 
              // @ts-ignore
                onClick={() => handleDelete(note.id)}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete Note"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Note Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-3 pr-16 truncate flex items-center gap-2">
              {note.title}
              {/* Show small heart icon always if it is favorite (even when not hovering) */}
              {note.isFavorite && <Heart size={14} className="text-red-500 fill-red-500 inline-block" />}
            </h3>
            
            {/* Note Content */}
            <div className="flex-1 overflow-hidden">
               <p className="text-gray-700 whitespace-pre-wrap line-clamp-5 text-sm leading-relaxed">
                 {note.content}
               </p>
            </div>
            
            {/* Tags & Date */}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {note.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-100">
                  <Tag size={10} className="mr-1.5" /> {tag}
                </span>
              ))}
              <span className="ml-auto text-xs font-medium text-gray-500">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
               <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notes yet</h3>
            <p className="text-gray-600 mt-1">Create your first note to get started!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Create New Note</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Project Ideas"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                <textarea
                  placeholder="Write your note here..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none text-gray-900"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="e.g. work, personal (comma separated)"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}