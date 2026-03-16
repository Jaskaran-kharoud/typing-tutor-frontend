import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chaptersAPI } from '../services/api';

const AdminChapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    try {
      const response = await chaptersAPI.getAll();
      setChapters(response.data);
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter({ ...chapter });
    setEditingLesson(null);
  };

  const handleEditLesson = (chapter, lesson) => {
    setEditingChapter(chapter);
    setEditingLesson({ ...lesson });
  };

  const handleSaveChapter = async () => {
    try {
      await chaptersAPI.update(editingChapter._id, editingChapter);
      await fetchChapters();
      setEditingChapter(null);
      alert('Chapter updated successfully!');
    } catch (err) {
      console.error('Error updating chapter:', err);
      alert('Failed to update chapter: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveLesson = async () => {
    try {
      const updatedChapter = { ...editingChapter };
      const lessonIndex = updatedChapter.lessons.findIndex(l => l._id === editingLesson._id);
      
      if (lessonIndex >= 0) {
        updatedChapter.lessons[lessonIndex] = editingLesson;
      }

      await chaptersAPI.update(updatedChapter._id, updatedChapter);
      await fetchChapters();
      setEditingLesson(null);
      setEditingChapter(null);
      alert('Lesson updated successfully!');
    } catch (err) {
      console.error('Error updating lesson:', err);
      alert('Failed to update lesson: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Are you sure you want to delete this chapter? This cannot be undone.')) {
      return;
    }

    try {
      await chaptersAPI.delete(chapterId);
      await fetchChapters();
      alert('Chapter deleted successfully!');
    } catch (err) {
      console.error('Error deleting chapter:', err);
      alert('Failed to delete chapter: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading chapters...</div>;
  }

  // Editing lesson modal
  if (editingLesson) {
    return (
      <div className="container">
        <div className="card">
          <h2>Edit Lesson</h2>
          <div className="form-group">
            <label>Lesson Title</label>
            <input
              type="text"
              value={editingLesson.lessonTitle}
              onChange={(e) => setEditingLesson({ ...editingLesson, lessonTitle: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={editingLesson.description}
              onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Lesson Type</label>
            <select
              value={editingLesson.lessonType}
              onChange={(e) => setEditingLesson({ ...editingLesson, lessonType: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', border: '2px solid #ddd', borderRadius: '5px' }}
            >
              <option value="intro">Introduction</option>
              <option value="random-words">Random Words</option>
              <option value="meaningful-words">Meaningful Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraph">Paragraph</option>
            </select>
          </div>

          <div className="form-group">
            <label>Content (what user will type)</label>
            <textarea
              value={editingLesson.content}
              onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
              rows="10"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontFamily: 'monospace', border: '2px solid #ddd', borderRadius: '5px' }}
            />
            <small style={{ color: '#666' }}>
              Character count: {editingLesson.content.length} | 
              Word count: ~{Math.round(editingLesson.content.split(/\s+/).length)}
            </small>
          </div>

          <div className="form-group">
            <label>Target Keys (comma-separated)</label>
            <input
              type="text"
              value={(editingLesson.targetKeys || []).join(', ')}
              onChange={(e) => setEditingLesson({ 
                ...editingLesson, 
                targetKeys: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              })}
              placeholder="e.g., a, s, d, f"
            />
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={editingLesson.duration}
              onChange={(e) => setEditingLesson({ ...editingLesson, duration: parseInt(e.target.value) })}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-success" onClick={handleSaveLesson}>
              Save Lesson
            </button>
            <button className="btn btn-secondary" onClick={() => {
              setEditingLesson(null);
              setEditingChapter(null);
            }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Editing chapter modal
  if (editingChapter) {
    return (
      <div className="container">
        <div className="card">
          <h2>Edit Chapter {editingChapter.chapterNumber}</h2>
          
          <div className="form-group">
            <label>Chapter Title</label>
            <input
              type="text"
              value={editingChapter.chapterTitle}
              onChange={(e) => setEditingChapter({ ...editingChapter, chapterTitle: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={editingChapter.description}
              onChange={(e) => setEditingChapter({ ...editingChapter, description: e.target.value })}
            />
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Lessons in this Chapter</h3>
          
          <div className="lessons-list">
            {editingChapter.lessons.map((lesson) => (
              <div key={lesson._id} className="lesson-item">
                <div>
                  <strong>Lesson {lesson.lessonNumber}: {lesson.lessonTitle}</strong>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.3rem' }}>
                    Type: {lesson.lessonType} | Duration: {lesson.duration} min
                  </div>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleEditLesson(editingChapter, lesson)}
                >
                  Edit Lesson
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn btn-success" onClick={handleSaveChapter}>
              Save Chapter Info
            </button>
            <button className="btn btn-secondary" onClick={() => setEditingChapter(null)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main chapters list
  return (
    <div className="container">
      <div className="card">
        <h2>Manage Chapters & Lessons</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Click on a chapter to edit its details and lessons
        </p>

        {error && <div className="error">{error}</div>}

        <div className="chapters-grid">
          {chapters.map((chapter) => (
            <div key={chapter._id} className="chapter-card">
              <div className="chapter-header">
                <div>
                  <h3>Chapter {chapter.chapterNumber}: {chapter.chapterTitle}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    {chapter.description}
                  </p>
                </div>
                <div style={{ color: '#667eea', fontWeight: '600' }}>
                  {chapter.lessons.length} lessons
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleEditChapter(chapter)}
                >
                  Edit Chapter
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleDeleteChapter(chapter._id)}
                  style={{ background: '#dc3545' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/admin')}
          style={{ marginTop: '2rem' }}
        >
          Back to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default AdminChapters;
