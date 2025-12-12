export interface EditResult {
  imageUrl: string;
  description?: string;
}

export interface AppState {
  originalImage: string | null; // Base64 data URL
  originalMimeType: string;
  generatedImage: string | null; // Base64 data URL
  isGenerating: boolean;
  error: string | null;
  prompt: string;
}

export enum ViewMode {
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
}