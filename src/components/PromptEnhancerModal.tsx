import React, { useState } from 'react';
import { Wand2, X, Sparkles, Check, Loader2, ArrowRight } from 'lucide-react';

interface PromptEnhancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  onApplyEnhancedPrompt: (enhancedPrompt: string) => void;
}

export const PromptEnhancerModal: React.FC<PromptEnhancerModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  onApplyEnhancedPrompt,
}) => {
  if (!isOpen) return null;

  const [promptInput, setPromptInput] = useState(initialPrompt);
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Photorealism');
  const [targetModel, setTargetModel] = useState('Midjourney v6');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string | null>(null);
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const stylePresets = [
    'Cinematic Photorealism',
    'Cyberpunk Neon Sci-Fi',
    'Dark Fantasy & Mythic',
    'Octane Render 3D',
    'Studio Macro Product',
    'Makoto Shinkai Anime',
  ];

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          style: selectedStyle,
          targetModel,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enhance prompt');
      }

      setEnhancedResult(data.enhancedPrompt);
      if (Array.isArray(data.addedKeywords)) {
        setAddedKeywords(data.addedKeywords);
      }
    } catch (err: any) {
      console.error('Enhancer error:', err);
      setErrorMsg(err.message || 'Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApply = () => {
    if (enhancedResult) {
      onApplyEnhancedPrompt(enhancedResult);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI Prompt Enhancer</h3>
              <p className="text-xs text-slate-400">Expand details, lighting specs, and optic descriptors</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form controls */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Target Style Preset</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {stylePresets.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                    selectedStyle === style
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Original Base Prompt</label>
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !promptInput.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing Prompt with Machine Learning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enhance Prompt Now</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Enhanced Result Box */}
        {enhancedResult && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">Enhanced AI Prompt Result:</span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-indigo-500/30 text-xs text-slate-200 font-mono leading-relaxed">
              {enhancedResult}
            </div>

            {addedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 self-center">Added Descriptors:</span>
                {addedKeywords.map((kw, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                    +{kw}
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Generator</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
