import React from 'react';
import { Sparkles, Layers, Bookmark, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  activeTab: 'extractor' | 'batch' | 'library';
  setActiveTab: (tab: 'extractor' | 'batch' | 'library') => void;
  savedCount: number;
  batchCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  batchCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                Anya - Your Ai Assistant
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ML Vision AI
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Image-to-Prompt Engineering & Style Description Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('extractor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'extractor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Prompt Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'batch'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Bulk Processing</span>
            {batchCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-400/20 text-indigo-300 font-bold">
                {batchCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'library'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Prompt Library</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Supported Formats Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/60">
          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
          <span>JPG • PNG • WEBP • AVIF • GIF</span>
        </div>

      </div>
    </header>
  );
};
