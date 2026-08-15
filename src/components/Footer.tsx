import React from 'react';
import { Sparkles, FileText, Layers, ShieldCheck, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950 py-8 px-4 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white">PromptVision AI Engine</span>
          <span className="text-slate-600">•</span>
          <span>Image-to-Prompt Engineering & Style Extractor</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" /> Multimodal Vision ML
          </span>
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Batch Export Engine
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Real-Time Testing
          </span>
        </div>

        <div className="text-slate-500">
          Compatible with Midjourney v6 • DALL-E 3 • SDXL • Flux.1
        </div>
      </div>
    </footer>
  );
};
