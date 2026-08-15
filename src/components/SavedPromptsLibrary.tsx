import React, { useState } from 'react';
import { Bookmark, Search, Star, Copy, Check, Trash2, Eye, Download, Sparkles, Filter, Tag } from 'lucide-react';
import { SavedPrompt, ModelType, ExportFormat } from '../types';
import { exportSinglePrompt, exportBatchPrompts } from '../utils/exportUtils';

interface SavedPromptsLibraryProps {
  savedPrompts: SavedPrompt[];
  onToggleFavorite: (id: string) => void;
  onDeletePrompt: (id: string) => void;
  onSelectForView: (prompt: SavedPrompt) => void;
  onClearAllSaved: () => void;
}

export const SavedPromptsLibrary: React.FC<SavedPromptsLibraryProps> = ({
  savedPrompts,
  onToggleFavorite,
  onDeletePrompt,
  onSelectForView,
  onClearAllSaved,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(savedPrompts.flatMap((p) => p.result.suggestedTags.map((t) => t.tag)))
  );

  const filteredPrompts = savedPrompts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.result.primaryPrompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.result.artStyle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      filterTag === 'all' || p.result.suggestedTags.some((t) => t.tag === filterTag);

    const matchesFavorite = !showFavoritesOnly || p.isFavorite;

    return matchesSearch && matchesTag && matchesFavorite;
  });

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportSavedBatch = (fmt: ExportFormat) => {
    const mockItems = filteredPrompts.map((p) => ({
      id: p.id,
      name: p.title,
      previewUrl: p.imageUrl || '',
      size: 0,
      type: 'image/png',
      status: 'done' as const,
      result: p.result,
    }));

    exportBatchPrompts(mockItems, fmt, 'midjourney', `promptvision-library-${Date.now()}.zip`);
  };

  if (savedPrompts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Your Saved Prompt Library is Empty</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Extract prompts from any uploaded image and click "Save Prompt" to store prompts, style tags, and model syntax in your personal history.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-400" />
              <span>Prompt Library & Saved History ({filteredPrompts.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter, search, organize, and batch export your saved prompt engineering assets
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExportSavedBatch('zip')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (ZIP)</span>
            </button>

            <button
              onClick={onClearAllSaved}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs font-medium transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Search & Tag Filter Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts by keyword, subject, or style..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="all">All Style Tags ({allTags.length})</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  #{t}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                showFavoritesOnly
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Favorites Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrompts.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-4 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {item.result.artStyle}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        item.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => onDeletePrompt(item.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Thumbnail + Title */}
              <div className="flex gap-3 items-center">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate" title={item.title}>
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-500">{item.createdAt}</p>
                </div>
              </div>

              {/* Master Prompt Snippet */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 font-mono line-clamp-3 leading-relaxed italic">
                "{item.result.primaryPrompt}"
              </div>

              {/* Tags snippet */}
              <div className="flex flex-wrap gap-1">
                {item.result.suggestedTags.slice(0, 4).map((t, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    #{t.tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyPrompt(item.id, item.result.primaryPrompt)}
                className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() =>
                  onSelectForView({
                    id: item.id,
                    name: item.title,
                    previewUrl: item.imageUrl || '',
                    size: 0,
                    type: 'image/jpeg',
                    status: 'done',
                    result: item.result,
                  })
                }
                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Load in Studio</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
