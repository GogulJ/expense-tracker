import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../context/NotesContext';
import { FaStickyNote, FaChevronDown, FaChevronUp, FaSave } from 'react-icons/fa';
import './Notes.css';

export default function Notes({ type }) {
  const { getNote, updateNote } = useNotes();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const note = getNote(type);
    setContent(note);
  }, [type, getNote]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounce auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 1000); // Auto-save after 1 second of inactivity
  };

  const handleSave = async (contentToSave = content) => {
    setIsSaving(true);
    try {
      await updateNote(type, contentToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    handleSave();
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const seconds = Math.floor((new Date() - lastSaved) / 1000);
    if (seconds < 5) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Saved ${minutes}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className={`notes-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button className="notes-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="notes-header-left">
          <FaStickyNote />
          <span>Notes</span>
          {content && !isExpanded && <span className="notes-preview">{content.slice(0, 30)}...</span>}
        </div>
        <div className="notes-header-right">
          {isSaving && <span className="saving-indicator">Saving...</span>}
          {lastSaved && !isSaving && <span className="last-saved">{formatLastSaved()}</span>}
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </div>
      </button>

      {isExpanded && (
        <div className="notes-body">
          <textarea
            className="notes-textarea"
            placeholder={`Write your ${type} notes here...`}
            value={content}
            onChange={handleContentChange}
            rows={6}
          />
          <div className="notes-footer">
            <span className="char-count">{content.length} characters</span>
            <button 
              className="save-btn" 
              onClick={handleManualSave}
              disabled={isSaving}
            >
              <FaSave /> {isSaving ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
