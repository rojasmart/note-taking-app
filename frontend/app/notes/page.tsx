'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export default function NotesHomepage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }
      
      try {
        const response = await fetch('http://localhost:5000/api/notes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        
        const data = await response.json();
        setNotes(data);
        // Select first note by default if available
        if (data.length > 0) {
          setSelectedNote(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching notes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const createNewNote = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const newNote = {
      title: 'Untitled Note',
      content: ''
    };

    try {
      const response = await fetch('http://localhost:5000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNote)
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      const createdNote = await response.json();
      setNotes([createdNote, ...notes]);
      setSelectedNote(createdNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating a note');
    }
  };

  const updateNote = async (updatedContent: string) => {
    if (!selectedNote) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...selectedNote,
          content: updatedContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update note');
      }

      const updatedNote = await response.json();
      setSelectedNote(updatedNote);
      setNotes(notes.map(note => note._id === updatedNote._id ? updatedNote : note));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating the note');
    }
  };

  const deleteNote = async () => {
    if (!selectedNote) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      const updatedNotes = notes.filter(note => note._id !== selectedNote._id);
      setNotes(updatedNotes);
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the note');
    }
  };

  const archiveNote = async () => {
    if (!selectedNote) return;
    
    // This would typically update a field on the note to mark it as archived
    // For this example, let's just show an alert
    alert('Archive functionality would be implemented here');
  };

  const filteredNotes = searchQuery
    ? notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Left sidebar - Logo and Tags */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center p-2">
            {/* Replace with your actual logo */}
            <div className="bg-blue-600 text-white font-bold text-xl p-2 rounded">
              Notes App
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">Tags</h2>
          <ul className="space-y-2">
            {/* Example tags - these would come from your data */}
            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Work
            </li>
            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
              Personal
            </li>
            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              Ideas
            </li>
            <li className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 cursor-pointer">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              Projects
            </li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header with search */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex justify-between items-center p-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative ml-4">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Notes list */}
          <div className="w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={createNewNote}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                + New Note
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {filteredNotes.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  No notes found
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotes.map((note) => (
                    <li 
                      key={note._id} 
                      onClick={() => setSelectedNote(note)}
                      className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${selectedNote?._id === note._id ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {note.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {note.content}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Main note editor */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
            {selectedNote ? (
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) => {
                      setSelectedNote({...selectedNote, title: e.target.value});
                    }}
                    className="w-full text-xl font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0"
                    placeholder="Note title"
                  />
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <textarea
                    value={selectedNote.content}
                    onChange={(e) => {
                      setSelectedNote({...selectedNote, content: e.target.value});
                      updateNote(e.target.value);
                    }}
                    className="w-full h-full text-gray-700 dark:text-gray-300 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
                    placeholder="Start writing..."
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>Select a note or create a new one</p>
              </div>
            )}
          </div>

          {/* Right sidebar - Actions */}
          <div className="w-16 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col items-center py-6">
            {selectedNote && (
              <>
                <button 
                  onClick={archiveNote}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none mb-4"
                  title="Archive Note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </button>
                <button 
                  onClick={deleteNote}
                  className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none"
                  title="Delete Note"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}