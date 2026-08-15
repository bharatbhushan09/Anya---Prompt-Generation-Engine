import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroUpload } from './components/HeroUpload';
import { AnalysisView } from './components/AnalysisView';
import { BatchManager } from './components/BatchManager';
import { SavedPromptsLibrary } from './components/SavedPromptsLibrary';
import { PromptEnhancerModal } from './components/PromptEnhancerModal';
import { Footer } from './components/Footer';
import { UploadedFileItem, SavedPrompt, SampleImage, ImageAnalysisResult } from './types';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'extractor' | 'batch' | 'library'>('extractor');
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  
  // Single/Current Extractor File Item
  const [activeFileItem, setActiveFileItem] = useState<UploadedFileItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Bulk Batch Queue
  const [batchItems, setBatchItems] = useState<UploadedFileItem[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  // Saved Prompts Library (localStorage)
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => {
    try {
      const stored = localStorage.getItem('promptvision_saved_prompts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Prompt Enhancer Modal
  const [isEnhancerOpen, setIsEnhancerOpen] = useState(false);
  const [enhancerPrompt, setEnhancerPrompt] = useState('');

  // Persist saved prompts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('promptvision_saved_prompts', JSON.stringify(savedPrompts));
    } catch (e) {
      console.error('Failed to save prompts to localStorage', e);
    }
  }, [savedPrompts]);

  // Helper: Read File as Base64 Data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Helper: Fetch Image URL as Base64 Data URL
  const urlToBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  // Analyze a single base64 image
  const analyzeImageBase64 = async (base64Data: string, mimeType: string): Promise<ImageAnalysisResult> => {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: mimeType || 'image/jpeg',
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to extract tags and prompt');
    }

    return data.result;
  };

  // Handle User File Selection (Single or Bulk)
  const handleFilesSelected = async (files: File[]) => {
    setAnalysisError(null);

    if (isBulkMode || files.length > 1) {
      // Bulk Batch Mode
      const newBatchItems: UploadedFileItem[] = files.map((f) => ({
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        file: f,
        previewUrl: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
        type: f.type,
        status: 'idle',
      }));

      setBatchItems((prev) => [...prev, ...newBatchItems]);
      setActiveTab('batch');
    } else {
      // Single Image Mode
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      const item: UploadedFileItem = {
        id: `single-${Date.now()}`,
        file,
        previewUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'analyzing',
      };

      setActiveFileItem(item);
      setIsAnalyzing(true);
      setActiveTab('extractor');

      try {
        const base64Data = await fileToBase64(file);
        const result = await analyzeImageBase64(base64Data, file.type);
        setActiveFileItem({
          ...item,
          status: 'done',
          result,
        });
      } catch (err: any) {
        console.error('Error analyzing image:', err);
        setAnalysisError(err.message || 'Image analysis failed');
        setActiveFileItem({
          ...item,
          status: 'error',
          errorMessage: err.message,
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // Handle Curated Sample Image Selection
  const handleSampleSelected = async (sample: SampleImage) => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    setActiveTab('extractor');

    const item: UploadedFileItem = {
      id: `sample-${sample.id}`,
      previewUrl: sample.url,
      name: sample.title,
      size: 102400,
      type: 'image/jpeg',
      status: 'analyzing',
    };

    setActiveFileItem(item);

    try {
      const base64Data = await urlToBase64(sample.url);
      const result = await analyzeImageBase64(base64Data, 'image/jpeg');
      setActiveFileItem({
        ...item,
        status: 'done',
        result,
      });
    } catch (err: any) {
      console.error('Sample analysis error:', err);
      setAnalysisError(err.message || 'Sample image analysis failed');
      setActiveFileItem({
        ...item,
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process Batch Queue
  const handleProcessBatch = async () => {
    setIsProcessingBatch(true);

    for (let i = 0; i < batchItems.length; i++) {
      const current = batchItems[i];
      if (current.status === 'done') continue;

      setBatchItems((prev) =>
        prev.map((item) => (item.id === current.id ? { ...item, status: 'analyzing' } : item))
      );

      try {
        let base64Data = '';
        let mime = current.type || 'image/jpeg';

        if (current.file) {
          base64Data = await fileToBase64(current.file);
        } else if (current.previewUrl) {
          base64Data = await urlToBase64(current.previewUrl);
        }

        const result = await analyzeImageBase64(base64Data, mime);

        setBatchItems((prev) =>
          prev.map((item) =>
            item.id === current.id ? { ...item, status: 'done', result } : item
          )
        );
      } catch (err: any) {
        console.error(`Batch item ${current.name} error:`, err);
        setBatchItems((prev) =>
          prev.map((item) =>
            item.id === current.id ? { ...item, status: 'error', errorMessage: err.message } : item
          )
        );
      }
    }

    setIsProcessingBatch(false);
  };

  // Batch item removals & views
  const handleRemoveBatchItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectBatchItemForView = (item: UploadedFileItem) => {
    setActiveFileItem(item);
    setActiveTab('extractor');
  };

  // Saved Prompts Handlers
  const handleSavePrompt = (item: UploadedFileItem) => {
    if (!item.result) return;

    const newSaved: SavedPrompt = {
      id: `saved-${Date.now()}`,
      title: item.name || 'Untitled Prompt',
      imageUrl: item.previewUrl,
      result: item.result,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isFavorite: false,
      tags: item.result.suggestedTags.map((t) => t.tag),
    };

    setSavedPrompts((prev) => [newSaved, ...prev]);
  };

  const handleToggleFavoriteSaved = (id: string) => {
    setSavedPrompts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSelectSavedForView = (saved: SavedPrompt) => {
    setActiveFileItem({
      id: saved.id,
      previewUrl: saved.imageUrl || '',
      name: saved.title,
      size: 0,
      type: 'image/jpeg',
      status: 'done',
      result: saved.result,
    });
    setActiveTab('extractor');
  };

  // Open Enhancer modal
  const handleOpenEnhancer = (prompt: string) => {
    setEnhancerPrompt(prompt);
    setIsEnhancerOpen(true);
  };

  const handleApplyEnhancedPrompt = (enhancedPrompt: string) => {
    if (activeFileItem && activeFileItem.result) {
      setActiveFileItem({
        ...activeFileItem,
        result: {
          ...activeFileItem.result,
          primaryPrompt: enhancedPrompt,
        },
      });
    }
  };

  const isCurrentSaved = activeFileItem?.result
    ? savedPrompts.some((p) => p.result.primaryPrompt === activeFileItem.result?.primaryPrompt)
    : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedPrompts.length}
        batchCount={batchItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* TAB 1: EXTRACTOR / GENERATOR STUDIO */}
        {activeTab === 'extractor' && (
          <div className="space-y-8">
            <HeroUpload
              onFilesSelected={handleFilesSelected}
              onSampleSelected={handleSampleSelected}
              isBulkMode={isBulkMode}
              setIsBulkMode={setIsBulkMode}
              isAnalyzing={isAnalyzing}
            />

            {/* Analysis Loading State */}
            {isAnalyzing && (
              <div className="max-w-2xl mx-auto p-8 bg-slate-900/90 border border-indigo-500/30 rounded-2xl text-center space-y-4 shadow-2xl animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Analyzing Multimodal Image Features...</h3>
                  <p className="text-xs text-slate-400">
                    Extracting lighting vectors, optical lens parameters, color hex swatches, and prompt syntax for Midjourney v6, DALL-E 3, SDXL & Flux.1.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {analysisError && !isAnalyzing && (
              <div className="max-w-2xl mx-auto p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* Analysis Result View */}
            {activeFileItem && activeFileItem.status === 'done' && !isAnalyzing && (
              <div className="px-4 lg:px-8">
                <AnalysisView
                  item={activeFileItem}
                  onSavePrompt={handleSavePrompt}
                  onOpenEnhancer={handleOpenEnhancer}
                  isSaved={isCurrentSaved}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BULK PROCESSING QUEUE */}
        {activeTab === 'batch' && (
          <div className="px-4 lg:px-8 pt-8">
            <BatchManager
              batchItems={batchItems}
              onProcessBatch={handleProcessBatch}
              onClearBatch={() => setBatchItems([])}
              onRemoveItem={handleRemoveBatchItem}
              onSelectForView={handleSelectBatchItemForView}
              isProcessing={isProcessingBatch}
            />
          </div>
        )}

        {/* TAB 3: PROMPT LIBRARY */}
        {activeTab === 'library' && (
          <div className="px-4 lg:px-8 pt-8">
            <SavedPromptsLibrary
              savedPrompts={savedPrompts}
              onToggleFavorite={handleToggleFavoriteSaved}
              onDeletePrompt={handleDeleteSaved}
              onSelectForView={handleSelectSavedForView}
              onClearAllSaved={() => setSavedPrompts([])}
            />
          </div>
        )}

      </main>

      {/* AI Prompt Enhancer Modal */}
      <PromptEnhancerModal
        isOpen={isEnhancerOpen}
        onClose={() => setIsEnhancerOpen(false)}
        initialPrompt={enhancerPrompt}
        onApplyEnhancedPrompt={handleApplyEnhancedPrompt}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
