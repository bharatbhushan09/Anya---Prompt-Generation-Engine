import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Layers, Zap, FileCode2, ArrowRight } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { SampleImage } from '../types';

interface HeroUploadProps {
  onFilesSelected: (files: File[]) => void;
  onSampleSelected: (sample: SampleImage) => void;
  isBulkMode: boolean;
  setIsBulkMode: (mode: boolean) => void;
  isAnalyzing: boolean;
}

export const HeroUpload: React.FC<HeroUploadProps> = ({
  onFilesSelected,
  onSampleSelected,
  isBulkMode,
  setIsBulkMode,
  isAnalyzing,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file: File) =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      if (droppedFiles.length > 1) {
        setIsBulkMode(true);
      }
      onFilesSelected(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 1) {
        setIsBulkMode(true);
      }
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-12 px-4 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-pink-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-6">
        
        {/* Subhead Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-inner">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multimodal Machine Learning Prompt Engineering</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Transform Uploaded Images into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Precision AI Prompts & Style Tags
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
          Upload any artwork, photo, or render to instantly analyze art styles, camera settings, volumetric lighting, color swatches, and model-specific prompts for <strong className="text-white">Midjourney v6</strong>, <strong className="text-white">DALL-E 3</strong>, <strong className="text-white">Stable Diffusion XL</strong>, and <strong className="text-white">Flux.1</strong>.
        </p>

        {/* Mode Toggle Controls */}
        <div className="flex justify-center items-center gap-3 pt-2">
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 inline-flex shadow-lg">
            <button
              onClick={() => setIsBulkMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                !isBulkMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Single Image Mode</span>
            </button>
            <button
              onClick={() => setIsBulkMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                isBulkMode
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Bulk Batch Mode</span>
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer mt-6 p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01] shadow-2xl shadow-indigo-500/20'
              : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/60 hover:bg-slate-900/90 shadow-xl'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            multiple={isBulkMode}
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-md">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                {isBulkMode ? 'Drop Multiple Images Here for Bulk Extraction' : 'Drag & Drop Your Image Here'}
              </h3>
              <p className="text-xs text-slate-400">
                Supports <strong className="text-slate-200">JPG, PNG, WEBP, AVIF, GIF</strong> (Up to 50MB per file)
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 group-hover:bg-indigo-500 transition-all">
              <Sparkles className="w-4 h-4" />
              <span>{isBulkMode ? 'Select Batch Images' : 'Browse Computer'}</span>
            </div>
          </div>
        </div>

        {/* Sample Image Section */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Or test with curated sample images</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSampleSelected(sample)}
                className="group/sample relative rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 transition-all duration-200 hover:scale-105 shadow-md text-left bg-slate-900"
              >
                <div className="aspect-square w-full overflow-hidden relative">
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover/sample:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-[11px] font-bold text-white truncate">{sample.title}</p>
                    <p className="text-[9px] text-indigo-300 truncate">{sample.category}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
