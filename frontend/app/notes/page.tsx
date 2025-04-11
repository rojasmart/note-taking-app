"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<"notes" | "settings">("notes");

  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [newNoteData, setNewNoteData] = useState({
    title: "",
    content: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/notes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();

        // Verifique se data é um array. Se não, use um array vazio ou extraia a parte array da resposta
        const notesArray = Array.isArray(data) ? data : [];

        setNotes(notesArray);

        // Select first note by default if available
        if (notesArray.length > 0) {
          setSelectedNote(notesArray[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const createNewNote = async () => {
    // Limpar os dados do novo formulário e ativar modo de criação
    setNewNoteData({
      title: "",
      content: "",
      tags: [],
    });
    setTagInput("");
    setIsCreatingNewNote(true);
    setSelectedNote(null);
  };

  // Adicionar função para salvar a nova nota
  const saveNewNote = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setError("");

    try {
      // URL completa para debugging
      const url = "http://localhost:5000/api/notes";
      console.log("Creating new note with request to:", url);

      // Dados sendo enviados
      const noteToSave = {
        title: newNoteData.title || "Untitled Note",
        content: newNoteData.content || "",
        tags: newNoteData.tags || [],
        userId: "000000000000000000000000", // ID de usuário temporário em formato ObjectId
      };

      console.log("Sending data:", JSON.stringify(noteToSave));

      // Enviando a requisição com log detalhado
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(noteToSave),
      });

      console.log("Response status:", response.status, response.statusText);

      // Verificar se é erro 404 e fornecer informações claras
      if (response.status === 404) {
        throw new Error(`API endpoint não encontrado: ${url}. Verifique se o servidor está rodando e se a rota está correta.`);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Error response:", errorData);
        throw new Error(errorData?.message || `Failed to create note (Status: ${response.status})`);
      }

      const responseData = await response.json();
      console.log("Create note response:", responseData);

      // Construir objeto de nota completo
      const createdNote: Note = {
        _id: responseData._id || Date.now().toString(),
        title: newNoteData.title || "Untitled Note",
        content: newNoteData.content || "",
        tags: newNoteData.tags || [],
        createdAt: responseData.createdAt || new Date().toISOString(),
        updatedAt: responseData.updatedAt || new Date().toISOString(),
      };

      setNotes([createdNote, ...notes]);
      setSelectedNote(createdNote);
      setIsCreatingNewNote(false);
    } catch (err) {
      console.error("Error creating note:", err);
      setError(err instanceof Error ? err.message : "An error occurred while creating a note");
      // Manter o form aberto em caso de erro
      // setIsCreatingNewNote(false);
    }
  };

  const updateNote = async (updatedContent: string) => {
    if (!selectedNote) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...selectedNote,
          content: updatedContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const updatedNote = await response.json();
      setSelectedNote(updatedNote);
      setNotes(notes.map((note) => (note._id === updatedNote._id ? updatedNote : note)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating the note");
    }
  };

  const deleteNote = async () => {
    if (!selectedNote) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/notes/${selectedNote._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      const updatedNotes = notes.filter((note) => note._id !== selectedNote._id);
      setNotes(updatedNotes);
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting the note");
    }
  };

  const archiveNote = async () => {
    if (!selectedNote) return;

    // This would typically update a field on the note to mark it as archived
    // For this example, let's just show an alert
    alert("Archive functionality would be implemented here");
  };

  // Função para adicionar tags
  const handleAddTag = () => {
    if (tagInput.trim() && !newNoteData.tags.includes(tagInput.trim())) {
      setNewNoteData({
        ...newNoteData,
        tags: [...newNoteData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  // Função para remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    setNewNoteData({
      ...newNoteData,
      tags: newNoteData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const filteredNotes = searchQuery
    ? notes.filter(
        (note) => note.title.toLowerCase().includes(searchQuery.toLowerCase()) || note.content.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div className="text-white font-bold text-xl p-2 rounded">Notes App</div>
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
                onClick={() => setActiveView(activeView === "notes" ? "settings" : "notes")}
                className={`w-10 h-10 rounded-full ${
                  activeView === "settings"
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                } flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {activeView === "notes" ? (
            <>
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
                  {!Array.isArray(filteredNotes) || filteredNotes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">No notes found</div>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredNotes.map((note) => (
                        <li
                          key={note._id}
                          onClick={() => setSelectedNote(note)}
                          className={`p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            selectedNote?._id === note._id ? "bg-blue-50 dark:bg-gray-700" : ""
                          }`}
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{note.title}</h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{note.content}</p>
                          <p className="mt-2 text-xs text-gray-500">{new Date(note.updatedAt).toLocaleDateString()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Main note editor */}
              <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
                {isCreatingNewNote ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <input
                        type="text"
                        value={newNoteData.title}
                        onChange={(e) => setNewNoteData({ ...newNoteData, title: e.target.value })}
                        className="flex-1 text-xl font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0"
                        placeholder="Note title"
                        autoFocus
                      />
                      <button onClick={saveNewNote} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Save
                      </button>
                    </div>

                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {newNoteData.tags.map((tag) => (
                          <div
                            key={tag}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 w-4 h-4 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <div className="flex">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                            className="border border-gray-300 dark:border-gray-600 rounded-l-md px-2 py-1 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Add tag..."
                          />
                          <button onClick={handleAddTag} className="px-2 py-1 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700">
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                      <textarea
                        value={newNoteData.content}
                        onChange={(e) => setNewNoteData({ ...newNoteData, content: e.target.value })}
                        className="w-full h-full text-gray-700 dark:text-gray-300 bg-transparent border-none resize-none focus:outline-none focus:ring-0"
                        placeholder="Start writing..."
                      ></textarea>
                    </div>
                  </div>
                ) : selectedNote ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <input
                        type="text"
                        value={selectedNote.title}
                        onChange={(e) => {
                          setSelectedNote({ ...selectedNote, title: e.target.value });
                        }}
                        className="w-full text-xl font-medium text-gray-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0"
                        placeholder="Note title"
                      />
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                      <textarea
                        value={selectedNote.content}
                        onChange={(e) => {
                          setSelectedNote({ ...selectedNote, content: e.target.value });
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
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={deleteNote}
                      className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none"
                      title="Delete Note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            // Settings/Profile view that replaces the notes list and editor
            <div className="flex-1 bg-white dark:bg-gray-900 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Settings</h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
                </div>

                {/* Profile Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile</h2>

                  <div className="flex items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Name</h3>
                      <p className="text-gray-600 dark:text-gray-400">user@example.com</p>
                      <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">Change profile picture</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        defaultValue="User Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        defaultValue="user@example.com"
                      />
                    </div>
                  </div>

                  <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Save Profile
                  </button>
                </div>

                {/* Preferences Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Enable dark mode for the app</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none">
                        <input type="checkbox" id="dark-mode" className="sr-only" />
                        <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-12"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Get notifications about your notes</p>
                      </div>
                      <div className="relative inline-block w-12 mr-2 align-middle select-none">
                        <input type="checkbox" id="notifications" className="sr-only" />
                        <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-12"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      </div>
                    </div>
                  </div>

                  <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Save Preferences
                  </button>
                </div>

                {/* Account Management */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Management</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                          <input
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          />
                        </div>
                      </div>
                      <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Update Password
                      </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Danger Zone</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveView("notes")}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Back to Notes
                  </button>

                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
