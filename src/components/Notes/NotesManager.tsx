import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useDebounce } from '../../hooks/useDebounce';
import type { Note } from '../../types';
import { 
 FiFolder, 
 FiPlus, 
 FiTrash2, 
 FiSearch, 
 FiEye, 
 FiEdit3, 
 FiTag, 
 FiBookOpen,
 FiBold,
 FiType,
 FiCode,
 FiList,
 FiCheckSquare,
 FiFilter
} from 'react-icons/fi';
// Custom Markdown Parser
const parseMarkdown = (text: string): string => {
 let html = text
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;');

 // Code blocks (```lang ... ```)
 html = html.replace(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)\n```/g, '<pre class="bg-white dark:bg-black/80 border border-neutral-200 dark:border-neutral-800/80 rounded-lg p-3 text-xs text-neutral-700 dark:text-neutral-300 my-3 overflow-x-auto"><code>$1</code></pre>');

 // Inline code (`code`)
 html = html.replace(/`([^`]+)`/g, '<code class="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 px-1 py-0.5 rounded text-xs text-neutral-700 dark:text-neutral-300">$1</code>');

 // Headers
 html = html.replace(/^# (.*?)$/gm, '<h1 class="text-lg font-bold tracking-tight text-black dark:text-white mt-4 mb-2 ">$1</h1>');
 html = html.replace(/^## (.*?)$/gm, '<h2 class="text-md font-bold tracking-tight text-black dark:text-white mt-3 mb-1.5 ">$1</h2>');
 html = html.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold tracking-tight text-black dark:text-white mt-2.5 mb-1 ">$1</h3>');

 // Checkboxes
 html = html.replace(/^- \[ \] (.*?)$/gm, '<li class="list-none flex items-center gap-2 text-neutral-700 dark:text-neutral-300 my-1"><input type="checkbox" disabled class="rounded border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 w-3.5 h-3.5 cursor-not-allowed"> <span>$1</span></li>');
 html = html.replace(/^- \[x\] (.*?)$/gm, '<li class="list-none flex items-center gap-2 text-neutral-500 my-1"><input type="checkbox" disabled checked class="rounded border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 w-3.5 h-3.5 cursor-not-allowed"> <span class="line-through">$1</span></li>');

 // Unordered lists
 html = html.replace(/^- (.*?)$/gm, '<li class="list-disc ml-5 text-neutral-700 dark:text-neutral-300 my-0.5">$1</li>');

 // Bold
 html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-black dark:text-white">$1</strong>');

 // Paragraphs
 const paragraphs = html.split(/\n\n+/);
 html = paragraphs.map(p => {
 if (/^\s*<(h[1-6]|pre|li|ul|ol)/i.test(p)) {
 return p;
 }
 return `<p class="text-neutral-700 dark:text-neutral-300 leading-relaxed text-xs my-2">${p.replace(/\n/g, '<br>')}</p>`;
 }).join('\n');

 return html;
};

export const NotesManager: React.FC = () => {
 const { notes, folders, addNote, updateNote, deleteNote, addFolder } = useStore();
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Extract all unique tags for notes
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => n.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [notes]);

  // Auto-select first note on initial cloud load, or when selected note is deleted by another device
  React.useEffect(() => {
    if (notes.length > 0) {
      const exists = notes.some(n => n.id === selectedNoteId);
      if (!exists) {
        setSelectedNoteId(notes[0].id);
      }
    } else {
      setSelectedNoteId(null);
    }
  }, [notes, selectedNoteId]);

 // Retrieve current active note object
 const activeNote = notes.find(n => n.id === selectedNoteId) || null;

 // Filters notes based on Folder selection & Search query & Advanced Filters
 const filteredNotes = notes.filter(note => {
  const matchesFolder = activeFolder === 'All' || note.folder === activeFolder;
  
  const q = debouncedSearchQuery.toLowerCase();
  const matchesSearch = !q ||
  note.title.toLowerCase().includes(q) ||
  note.content.toLowerCase().includes(q) ||
  note.tags.some(tag => tag.toLowerCase().includes(q));

  const matchesTag = tagFilter === 'all' || note.tags.includes(tagFilter);

  let matchesDate = true;
  if (dateFilter !== 'all') {
    const noteDate = new Date(note.updatedAt || new Date());
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - noteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (dateFilter === 'today') matchesDate = diffDays <= 1;
    else if (dateFilter === 'week') matchesDate = diffDays <= 7;
    else if (dateFilter === 'month') matchesDate = diffDays <= 30;
  }

  return matchesFolder && matchesSearch && matchesTag && matchesDate;
 });

 const handleCreateNote = () => {
 const folder = activeFolder === 'All' ? (folders[0] || 'Work') : activeFolder;
 const newNote: Omit<Note, 'id' | 'updatedAt'> = {
 title: 'Untitled Note',
 content: '# Untitled Note\n\nStart writing notes here...',
 folder,
 tags: ['new']
 };
 addNote(newNote);
 // Find newly added note in subsequent tick (or compute id)
 setTimeout(() => {
 const updatedNotes = useStore.getState().notes;
 const latest = updatedNotes[updatedNotes.length - 1];
 if (latest) {
 setSelectedNoteId(latest.id);
 setEditorTab('write');
 }
 }, 50);
 };

 const handleUpdateNoteContent = (content: string) => {
 if (!selectedNoteId) return;
 updateNote(selectedNoteId, { content });
 };

 const handleUpdateNoteTitle = (title: string) => {
 if (!selectedNoteId) return;
 updateNote(selectedNoteId, { title });
 };

 const handleUpdateNoteFolder = (folder: string) => {
 if (!selectedNoteId) return;
 updateNote(selectedNoteId, { folder });
 };

 const handleUpdateNoteTags = (tagsString: string) => {
 if (!selectedNoteId) return;
 const tagsArray = tagsString
 .split(',')
 .map(tag => tag.trim())
 .filter(tag => tag.length > 0);
 updateNote(selectedNoteId, { tags: tagsArray });
 };

 const handleDeleteNote = (id: string) => {
 deleteNote(id);
 if (selectedNoteId === id) {
 const remaining = notes.filter(n => n.id !== id);
 setSelectedNoteId(remaining.length > 0 ? remaining[0].id : null);
 }
 };

 const handleAddFolderSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (newFolderName.trim()) {
 addFolder(newFolderName.trim());
 setNewFolderName('');
 setIsAddingFolder(false);
 }
 };

 // Helper to insert markdown tags into editor textarea
 const insertMarkdown = (syntax: string) => {
 const textarea = document.getElementById('note-textarea') as HTMLTextAreaElement;
 if (!textarea || !activeNote) return;

 const start = textarea.selectionStart;
 const end = textarea.selectionEnd;
 const text = textarea.value;
 const selectedText = text.substring(start, end);
 
 let replacement = '';
 switch (syntax) {
 case 'bold':
 replacement = `**${selectedText || 'bold text'}**`;
 break;
 case 'header':
 replacement = `\n# ${selectedText || 'Heading'}\n`;
 break;
 case 'code':
 replacement = `\n\`\`\`javascript\n${selectedText || '// code here'}\n\`\`\`\n`;
 break;
 case 'list':
 replacement = `\n- ${selectedText || 'list item'}`;
 break;
 case 'todo':
 replacement = `\n- [ ] ${selectedText || 'todo item'}`;
 break;
 }

 const nextContent = text.substring(0, start) + replacement + text.substring(end);
 handleUpdateNoteContent(nextContent);
 
 // Focus back and set selection
 setTimeout(() => {
 textarea.focus();
 textarea.setSelectionRange(start + replacement.length, start + replacement.length);
 }, 10);
 };

 return (
 <div className="flex flex-col md:grid md:grid-cols-4 gap-6 h-[calc(100vh-8.5rem)]">
 
 {/* 1. Folders Column */}
 <div className="h-48 md:h-auto md:col-span-1 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 flex flex-col shadow-xl overflow-y-auto">
 <div>
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Notebooks</span>
 <button 
 onClick={() => setIsAddingFolder(!isAddingFolder)} 
 className="p-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:text-white hover:bg-neutral-100 dark:bg-neutral-800 rounded cursor-pointer"
 title="New folder"
 >
 <FiPlus className="w-4 h-4" />
 </button>
 </div>

 {/* Add Folder Input Form */}
 <>
 {isAddingFolder && (
 <form
 onSubmit={handleAddFolderSubmit}
 className="mb-4"
 >
 <input 
 type="text" 
 placeholder="Folder name..." 
 value={newFolderName}
 onChange={(e) => setNewFolderName(e.target.value)}
 className="w-full text-xs px-3 py-2 rounded-lg bg-white dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
 autoFocus
 />
 </form>
 )}
 </>

 {/* Folder Buttons */}
 <div className="space-y-1">
 <button
 onClick={() => { setActiveFolder('All'); }}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-pointer ${
 activeFolder === 'All'
 ? 'bg-neutral-100 dark:bg-neutral-850/80 text-neutral-700 dark:text-neutral-300 font-semibold border-l-2 border-neutral-500'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 hover:bg-white dark:bg-black/30'
 }`}
 >
 <FiBookOpen className="w-4 h-4" />
 <span>All Notes</span>
 <span className="ml-auto text-xxs bg-white dark:bg-black px-1.5 py-0.5 rounded text-neutral-500">
 {notes.length}
 </span>
 </button>

 {folders.map(folder => {
 const count = notes.filter(n => n.folder === folder).length;
 return (
 <button
 key={folder}
 onClick={() => { setActiveFolder(folder); }}
 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-pointer ${
 activeFolder === folder
 ? 'bg-neutral-100 dark:bg-neutral-850/80 text-neutral-700 dark:text-neutral-300 font-semibold border-l-2 border-neutral-500'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 hover:bg-white dark:bg-black/30'
 }`}
 >
 <FiFolder className="w-4 h-4" />
 <span className="truncate">{folder}</span>
 <span className="ml-auto text-xxs bg-white dark:bg-black px-1.5 py-0.5 rounded text-neutral-500">
 {count}
 </span>
 </button>
 );
 })}
 </div>
 </div>

 <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800/60 text-xxs text-neutral-500">
 Markdown rendering auto-compiled in editor.
 </div>
 </div>

 {/* 2. Notes List Column */}
 <div className="h-64 md:h-auto md:col-span-1 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
 {/* Search & Filters */}
 <div className="space-y-3">
   <div className="flex items-center gap-2">
     <div className="relative flex-1">
       <FiSearch className="w-4 h-4 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
       <input 
         type="text" 
         placeholder="Search notes..." 
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         className="w-full text-xs pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-black/40 border border-neutral-200 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
       />
     </div>
     <button
       onClick={() => setShowFilters(!showFilters)}
       className={`p-2 rounded-lg border transition-colors ${
         showFilters 
           ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-black dark:text-white' 
           : 'bg-white dark:bg-black/40 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
       }`}
       title="Advanced Filters"
     >
       <FiFilter className="w-4 h-4" />
     </button>
   </div>

   {showFilters && (
     <div className="flex flex-col gap-2 p-2.5 bg-white dark:bg-black/20 border border-neutral-200 dark:border-neutral-800/80 rounded-lg animate-in slide-in-from-top-1 fade-in duration-200">
       <div className="flex flex-col gap-1">
         <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Filter by Tag</label>
         <select
           value={tagFilter}
           onChange={(e) => setTagFilter(e.target.value)}
           className="w-full text-xs px-2 py-1.5 rounded bg-neutral-50 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-neutral-500"
         >
           <option value="all">Any Tag</option>
           {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
         </select>
       </div>
       <div className="flex flex-col gap-1">
         <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Date Modified</label>
         <select
           value={dateFilter}
           onChange={(e) => setDateFilter(e.target.value)}
           className="w-full text-xs px-2 py-1.5 rounded bg-neutral-50 dark:bg-black/60 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:border-neutral-500"
         >
           <option value="all">Any Time</option>
           <option value="today">Today</option>
           <option value="week">Past 7 Days</option>
           <option value="month">Past 30 Days</option>
         </select>
       </div>
     </div>
   )}
 </div>

 {/* Note Grid */}
 <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
 {filteredNotes.length === 0 ? (
 <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 p-4">
 <FiFolder className="w-8 h-8 opacity-20 mb-2" />
 <p className="text-xxs">No notes found.</p>
 </div>
 ) : (
 filteredNotes.map(note => (
 <div
 key={note.id}
 onClick={() => setSelectedNoteId(note.id)}
 className={`p-3 rounded-xl border  cursor-pointer text-left relative group ${
 selectedNoteId === note.id
 ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-600 shadow-md shadow-neutral-900/5'
 : 'bg-white dark:bg-black/20 border-neutral-200 dark:border-neutral-850 hover:border-neutral-200 dark:border-neutral-800'
 }`}
 >
 <div className="flex items-start justify-between">
 <h4 className="text-xs font-semibold text-black dark:text-white truncate max-w-[80%]">
 {note.title || 'Untitled Note'}
 </h4>
 <button
 onClick={(e) => {
 e.stopPropagation();
 handleDeleteNote(note.id);
 }}
 className="opacity-0 group-hover:opacity-100 p-0.5 text-neutral-500 hover:text-neutral-400 rounded cursor-pointer"
 title="Delete Note"
 >
 <FiTrash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 <p className="text-xxs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1.5">
 {note.content.replace(/[#*`\-]/g, '').substring(0, 75)}
 </p>
 <div className="flex items-center gap-1.5 mt-2.5 overflow-x-hidden">
 <span className="text-[9px] font-bold text-neutral-500 bg-white dark:bg-black/80 px-1 py-0.5 rounded">
 {note.folder}
 </span>
 {note.tags.slice(0, 2).map(tag => (
 <span key={tag} className="text-[9px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 px-1 py-0.5 rounded">
 #{tag}
 </span>
 ))}
 </div>
 </div>
 ))
 )}
 </div>

 {/* Create Note Trigger */}
 <button
 onClick={handleCreateNote}
 className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:bg-neutral-700 text-black dark:text-white rounded-xl cursor-pointer"
 >
 <FiPlus className="w-4 h-4" />
 <span>New Note</span>
 </button>
 </div>

 {/* 3. Editor Column */}
 <div className={`flex-1 md:col-span-2 glass-panel border border-neutral-200 dark:border-neutral-800/80 rounded-2xl flex flex-col shadow-xl overflow-hidden ${!selectedNoteId ? 'max-md:hidden' : ''}`}>
 {activeNote ? (
 <>
 {/* Editor Toolbar */}
 <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black/20 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex bg-white dark:bg-black/60 p-0.5 rounded-lg border border-neutral-300 dark:border-black">
 <button
 onClick={() => setEditorTab('write')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xxs font-bold cursor-pointer ${
 editorTab === 'write'
 ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200'
 }`}
 >
 <FiEdit3 className="w-3 h-3" />
 <span>Editor</span>
 </button>
 <button
 onClick={() => setEditorTab('preview')}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xxs font-bold cursor-pointer ${
 editorTab === 'preview'
 ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white'
 : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200'
 }`}
 >
 <FiEye className="w-3 h-3" />
 <span>Preview</span>
 </button>
 </div>

 {editorTab === 'write' && (
 <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800/60 pl-2">
 <button 
 onClick={() => insertMarkdown('header')} 
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 title="Header"
 >
 <FiType className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={() => insertMarkdown('bold')} 
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 title="Bold"
 >
 <FiBold className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={() => insertMarkdown('list')} 
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 title="List"
 >
 <FiList className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={() => insertMarkdown('todo')} 
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 title="Todo Checklist"
 >
 <FiCheckSquare className="w-3.5 h-3.5" />
 </button>
 <button 
 onClick={() => insertMarkdown('code')} 
 className="p-1 hover:bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:text-neutral-200 cursor-pointer"
 title="Code Block"
 >
 <FiCode className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 </div>

 {/* Folder Selector */}
 <div className="flex items-center gap-2">
 <span className="text-[10px] text-neutral-500">Notebook:</span>
 <select
 value={activeNote.folder}
 onChange={(e) => handleUpdateNoteFolder(e.target.value)}
 className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 text-xxs font-semibold text-neutral-700 dark:text-neutral-300 rounded px-2 py-1 focus:outline-none focus:border-neutral-500"
 >
 {folders.map(f => (
 <option key={f} value={f}>{f}</option>
 ))}
 </select>
 </div>
 </div>

 {/* Note Fields Input */}
 <div className="p-4 border-b border-neutral-200 dark:border-neutral-850 flex gap-4 bg-white dark:bg-black/10">
 <div className="flex-1">
 <input 
 type="text" 
 value={activeNote.title}
 onChange={(e) => handleUpdateNoteTitle(e.target.value)}
 placeholder="Note Title" 
 className="w-full text-sm font-semibold bg-transparent border-b border-transparent hover:border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:outline-none text-black dark:text-white py-1 px-0"
 />
 </div>

 <div className="w-1/3 flex items-center gap-1.5">
 <FiTag className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
 <input 
 type="text" 
 value={activeNote.tags.join(', ')}
 onChange={(e) => handleUpdateNoteTags(e.target.value)}
 placeholder="tags, separated, by, commas" 
 className="w-full text-xxs bg-transparent border-b border-transparent hover:border-neutral-200 dark:border-neutral-800 focus:border-neutral-500 focus:outline-none text-neutral-700 dark:text-neutral-300 py-1 px-0"
 />
 </div>
 </div>

 {/* Note Body editor / Preview panel */}
 <div className="flex-1 p-4 overflow-y-auto">
 {editorTab === 'write' ? (
 <textarea
 id="note-textarea"
 value={activeNote.content}
 onChange={(e) => handleUpdateNoteContent(e.target.value)}
 placeholder="Type note body here in markdown format..."
 className="w-full h-full bg-transparent text-xs text-neutral-800 dark:text-neutral-200 placeholder-neutral-650 resize-none focus:outline-none leading-relaxed"
 />
 ) : (
 <div 
 className="prose prose-invert max-w-none text-left"
 dangerouslySetInnerHTML={{ __html: parseMarkdown(activeNote.content) }}
 />
 )}
 </div>
 </>
 ) : (
 <div className="h-full flex flex-col items-center justify-center text-neutral-500 p-8 text-center">
 <FiBookOpen className="w-16 h-16 opacity-10 mb-3" />
 <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400">No Note Selected</h3>
 <p className="text-xxs max-w-[240px] leading-relaxed mt-1 text-neutral-500">
 Select an existing note from the sidebar or click "New Note" to draft a document.
 </p>
 </div>
 )}
 </div>

 </div>
 );
};
export default NotesManager;
