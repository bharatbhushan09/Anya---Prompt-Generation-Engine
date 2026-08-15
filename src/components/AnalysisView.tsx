import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, Download, Bookmark, Sliders, RefreshCw, Wand2, Camera, Sun, Palette, Compass, ShieldAlert, Layers, Image as ImageIcon, Eye, ArrowLeftRight, CheckCircle2, Loader2, Play } from 'lucide-react';
import { UploadedFileItem, ModelType, ExportFormat } from '../types';
import { exportSinglePrompt } from '../utils/exportUtils';

interface AnalysisViewProps {
  item: UploadedFileItem;
  onSavePrompt: (item: UploadedFileItem) => void;
  onOpenEnhancer: (currentPrompt: string) => void;
  isSaved: boolean;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  item,
  onSavePrompt,
  onOpenEnhancer,
  isSaved,
}) => {
  const result = item.result;
  if (!result) return null;

  const [selectedModel, setSelectedModel] = useState<ModelType>('midjourney');
  const [currentPrompt, setCurrentPrompt] = useState<string>(result.primaryPrompt);
  const [activeTags, setActiveTags] = useState<string[]>(result.suggestedTags.map(t => t.tag));
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Real-time test generation states
  const [testAspectRatio, setTestAspectRatio] = useState<string>('1:1');
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [comparisonView, setComparisonView] = useState<'sideBySide' | 'splitSlider' | 'single'>('sideBySide');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Update prompt whenever model changes or initial result arrives
  useEffect(() => {
    if (result.modelPrompts[selectedModel]) {
      setCurrentPrompt(result.modelPrompts[selectedModel]);
    } else {
      setCurrentPrompt(result.primaryPrompt);
    }
  }, [selectedModel, result]);

  const handleCopyPrompt = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleToggleTag = (tag: string) => {
    let newTags: string[];
    let updatedPrompt = currentPrompt;

    if (activeTags.includes(tag)) {
      newTags = activeTags.filter((t) => t !== tag);
      // Remove tag from prompt
      updatedPrompt = updatedPrompt.replace(new RegExp(`,\\s*${tag}`, 'gi'), '').replace(new RegExp(`${tag},?\\s*`, 'gi'), '');
    } else {
      newTags = [...activeTags, tag];
      // Append tag to prompt
      updatedPrompt = updatedPrompt.trim() + `, ${tag}`;
    }

    setActiveTags(newTags);
    setCurrentPrompt(updatedPrompt);
  };

  const handleGenerateTestPreview = async () => {
    setIsGeneratingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch('/api/generate-preview-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          aspectRatio: testAspectRatio,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate test preview');
      }

      setGeneratedPreviewUrl(data.imageUrl);
    } catch (err: any) {
      console.error('Error generating preview:', err);
      setPreviewError(err.message || 'Image preview generation failed.');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Original Upload & Real-Time Test Preview */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          
          {/* Main Original Image Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>Original Source Image</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Confidence Match: {result.confidenceScore}%
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square group">
              <img
                src={item.previewUrl}
                alt={item.name}
                className="w-full h-full object-contain bg-slate-950"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
              <span className="truncate max-w-[200px]" title={item.name}>{item.name}</span>
              <span>{item.type.replace('image/', '').toUpperCase()} • {(item.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>

          {/* REAL-TIME TEST PREVIEW GENERATOR PANEL */}
          <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Real-Time Prompt Test Preview</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Synthesize an instant AI preview from your engineered prompt
                </p>
              </div>
            </div>

            {/* Test Settings: Aspect Ratio & Generate Button */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['1:1', '16:9', '9:16', '4:3'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setTestAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      testAspectRatio === ratio
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateTestPreview}
                disabled={isGeneratingPreview}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {isGeneratingPreview ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Test Prompt Real-Time</span>
                  </>
                )}
              </button>
            </div>

            {/* Preview Output Display */}
            {previewError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                {previewError}
              </div>
            )}

            {generatedPreviewUrl ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>AI Test Generation Output</span>
                  <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setComparisonView('sideBySide')}
                      className={`px-2 py-0.5 text-[10px] rounded ${
                        comparisonView === 'sideBySide' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Side-By-Side
                    </button>
                    <button
                      onClick={() => setComparisonView('splitSlider')}
                      className={`px-2 py-0.5 text-[10px] rounded ${
                        comparisonView === 'splitSlider' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      Compare Slider
                    </button>
                  </div>
                </div>

                {comparisonView === 'sideBySide' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">Original</span>
                      <div className="aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                        <img src={item.previewUrl} alt="Original" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 block">AI Prompt Output</span>
                      <div className="aspect-square rounded-lg overflow-hidden border border-indigo-500/40 bg-slate-950 shadow-md">
                        <img src={generatedPreviewUrl} alt="Generated Preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-950 select-none">
                    {/* Generated Image Base */}
                    <img src={generatedPreviewUrl} alt="Generated" className="absolute inset-0 w-full h-full object-cover" />
                    
                    {/* Original Image Overlay clipped */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img src={item.previewUrl} alt="Original" className="w-full h-full object-cover max-w-none" style={{ width: '100%' }} />
                    </div>

                    {/* Slider divider line */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shadow-lg">
                        <ArrowLeftRight className="w-3 h-3" />
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 border border-dashed border-slate-800 rounded-xl text-center bg-slate-950/60 space-y-2">
                <Wand2 className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Click <strong className="text-indigo-400">Test Prompt Real-Time</strong> to verify output consistency using machine learning image synthesis.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Master Prompt, Model Formats, Interactive Tags & Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                ML Tag Extractor Output
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenEnhancer(currentPrompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>AI Enhancer</span>
              </button>

              <button
                onClick={() => onSavePrompt(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Saved to Library' : 'Save Prompt'}</span>
              </button>

              <button
                onClick={() => exportSinglePrompt(item, 'json', selectedModel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Master Prompt Editor Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Primary Engineered Prompt</span>
              </label>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{currentPrompt.split(' ').length} Words</span>
                <button
                  onClick={() => handleCopyPrompt(currentPrompt)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedText ? 'Copied Prompt!' : 'Copy Master Prompt'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-sm font-mono text-slate-200 focus:outline-none transition-all leading-relaxed shadow-inner"
            />
          </div>

          {/* Model Specific Prompt Formats Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Target AI Generator Syntax
              </span>
              <span className="text-[11px] text-slate-400">Optimized parameter tags</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {(
                [
                  { id: 'midjourney', label: 'Midjourney v6' },
                  { id: 'stableDiffusion', label: 'Stable Diffusion XL' },
                  { id: 'dalle3', label: 'DALL-E 3' },
                  { id: 'flux', label: 'Flux.1' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center truncate ${
                    selectedModel === m.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="relative bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 leading-relaxed group">
              <p className="pr-12 whitespace-pre-wrap">{result.modelPrompts[selectedModel]}</p>
              <button
                onClick={() => handleCopyPrompt(result.modelPrompts[selectedModel])}
                className="absolute top-3 right-3 p-2 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all shadow"
                title="Copy Model Syntax"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive ML Tag Pills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Suggested Fine-Tuning Tags (Click to Toggle)</span>
              </span>
              <span className="text-[11px] text-slate-400">Appends directly to active prompt</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {result.suggestedTags.map((tagObj, idx) => {
                const isActive = activeTags.includes(tagObj.tag);
                return (
                  <button
                    key={idx}
                    onClick={() => handleToggleTag(tagObj.tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] text-indigo-300 font-bold uppercase opacity-80">
                      {tagObj.category}:
                    </span>
                    <span>{tagObj.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stylistic Descriptions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Subject & Action */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Subject & Action</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {result.subjectAndAction}
              </p>
            </div>

            {/* Art Style & Medium */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Palette className="w-4 h-4 text-purple-400" />
                <span>Art Style & Medium</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {result.artStyle}
              </p>
            </div>

            {/* Volumetric Lighting */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Lighting & Atmosphere</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {result.lightingAndAtmosphere}
              </p>
            </div>

            {/* Camera & Lens */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Camera & Lens Optics</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {result.cameraAndSettings}
              </p>
            </div>

          </div>

          {/* Color Palette Swatches */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <span>Extracted Color Palette</span>
              </span>
              <span className="text-[11px] text-slate-400">Click swatch to copy hex code</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {result.colorPalette.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyHex(col.hex)}
                  className="group/col p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-left transition-all flex items-center gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner border border-white/10 shrink-0"
                    style={{ backgroundColor: col.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{col.name}</p>
                    <p className="text-[10px] font-mono text-indigo-400">{copiedHex === col.hex ? 'COPIED!' : col.hex}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Negative Prompt Suggestions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Suggested Negative Prompt</span>
              </span>
              <button
                onClick={() => handleCopyPrompt(result.negativePrompt)}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Negative</span>
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 leading-relaxed">
              {result.negativePrompt}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
