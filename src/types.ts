export interface ColorPaletteItem {
  hex: string;
  name: string;
  role: string;
}

export interface TagCategoryItem {
  category: string;
  tag: string;
}

export interface ModelPrompts {
  midjourney: string;
  stableDiffusion: string;
  dalle3: string;
  flux: string;
}

export interface ImageAnalysisResult {
  primaryPrompt: string;
  subjectAndAction: string;
  artStyle: string;
  lightingAndAtmosphere: string;
  cameraAndSettings: string;
  compositionAndFraming: string;
  colorPalette: ColorPaletteItem[];
  suggestedTags: TagCategoryItem[];
  negativePrompt: string;
  modelPrompts: ModelPrompts;
  confidenceScore: number;
}

export interface UploadedFileItem {
  id: string;
  file?: File;
  previewUrl: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
  status: 'idle' | 'analyzing' | 'done' | 'error';
  errorMessage?: string;
  result?: ImageAnalysisResult;
}

export interface SavedPrompt {
  id: string;
  title: string;
  imageUrl?: string;
  result: ImageAnalysisResult;
  createdAt: string;
  isFavorite: boolean;
  tags: string[];
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
}

export type ExportFormat = 'json' | 'csv' | 'txt' | 'zip';
export type ModelType = 'midjourney' | 'stableDiffusion' | 'dalle3' | 'flux';
