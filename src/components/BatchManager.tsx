import React, { useState } from 'react';
import { Layers, Play, Download, Trash2, FileJson, FileSpreadsheet, FileText, Archive, CheckCircle2, AlertCircle, Loader2, Copy, Check, Eye } from 'lucide-react';
import { UploadedFileItem, ExportFormat, ModelType } from '../types';
import { exportBatchPrompts } from '../utils/exportUtils';

interface BatchManagerProps {
  batchItems: UploadedFileItem[];
  onProcessBatch: () => void;
  onClearBatch: () => void;
  onRemoveItem: (id: string) => void;
  onSelectForView: (item: UploadedFileItem) => void;
  isProcessing: boolean;
}

export const BatchManager: React.FC<BatchManagerProps> = ({
  batchItems,
  onProcessBatch,
  onClearBatch,
  onRemoveItem,
  onSelectForView,
  isProcessing,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('zip');
  const [selectedModel, setSelectedModel] = useState<ModelType>('midjourney');
  const [copiedBatch, setCopiedBatch] = useState(false);

  const completedCount = batchItems.filter((item) => item.status === 'done').length;
  const errorCount = batchItems.filter((item) => item.status === 'error').length;
  const idleCount = batchItems.filter((item) => item.status === 'idle').length;
  const progressPercent = batchItems.length > 0 ? Math.round((completedCount / batchItems.length) * 100) : 0;

  const handleExportAll = () => {
    exportBatchPrompts(batchItems, selectedFormat, selectedModel);
  };

  const handleCopyAllPrompts = () => {
    const doneItems = batchItems.filter((i) => i.status === 'done' && i.result);
    if (doneItems.length === 0) return;

    const textList = doneItems
      .map((item, index) => {
        const prompt = item.result?.modelPrompts[selectedModel] || item.result?.primaryPrompt;
        return `[Image ${index + 1}: ${item.name}]\n${prompt}\n`;
      })
      .join('\n---\n\n');

    navigator.clipboard.writeText(textList);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  if (batchItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No Images in Bulk Queue</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Switch to Bulk Batch Mode or drag and drop multiple images into the uploader to extract prompts in bulk.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Controls & Status Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Bulk Extraction Queue</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {batchItems.length} Files Total
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Process multiple images concurrently and export structured JSON, CSV, TXT, or ZIP bundles.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onProcessBatch}
              disabled={isProcessing || idleCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Images ({completedCount}/{batchItems.length})...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Analyze {idleCount > 0 ? `${idleCount} Remaining` : 'Queue'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClearBatch}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-medium transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Queue</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Overall Progress: {progressPercent}%</span>
            <span>
              <strong className="text-emerald-400">{completedCount} Complete</strong> •{' '}
              <strong className="text-amber-400">{idleCount} Pending</strong> •{' '}
              <strong className="text-rose-400">{errorCount} Errors</strong>
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bulk Export Toolbar */}
        {completedCount > 0 && (
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Format:</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {(['zip', 'json', 'csv', 'txt'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-3 py-1 rounded-md text-xs font-medium uppercase transition-all ${
                      selectedFormat === fmt
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="midjourney">Midjourney v6 Format</option>
                <option value="stableDiffusion">Stable Diffusion Format</option>
                <option value="dalle3">DALL-E 3 Format</option>
                <option value="flux">Flux.1 Format</option>
              </select>

              <button
                onClick={handleCopyAllPrompts}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
              >
                {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBatch ? 'Copied All!' : 'Copy All'}</span>
              </button>

              <button
                onClick={handleExportAll}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Batch ({completedCount})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchItems.map((item) => (
          <div
            key={item.id}
            className={`bg-slate-900/90 border rounded-xl overflow-hidden p-4 space-y-3 transition-all ${
              item.status === 'analyzing'
                ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
                : item.status === 'done'
                ? 'border-slate-800 hover:border-slate-700'
                : 'border-slate-800'
            }`}
          >
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                {item.status === 'analyzing' && (
                  <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {(item.size / 1024).toFixed(1)} KB • {item.type.replace('image/', '').toUpperCase()}
                </p>

                {/* Status Badges */}
                {item.status === 'idle' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Pending
                  </span>
                )}
                {item.status === 'analyzing' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    <Loader2 className="w-3 h-3 animate-spin" /> Extracting ML Tags...
                  </span>
                )}
                {item.status === 'done' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Done ({item.result?.confidenceScore}%)
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <AlertCircle className="w-3 h-3" /> Error
                  </span>
                )}
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                disabled={isProcessing}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors self-start"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt snippet if completed */}
            {item.status === 'done' && item.result && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 space-y-2">
                <p className="line-clamp-2 italic text-slate-400">"{item.result.primaryPrompt}"</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-indigo-400">{item.result.artStyle}</span>
                  <button
                    onClick={() => onSelectForView(item)}
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-300 hover:text-indigo-200"
                  >
                    <Eye className="w-3 h-3" /> View & Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
