export interface Metadata {
  url: string;
  timestamp: string;
  total_pairs: number;
}

export interface Prompt {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export interface ChatExport {
  metadata: Metadata;
  prompts: Prompt[];
}

export interface ExportOptions {
  format: 'json' | 'markdown';
  includeMetadata: boolean;
}

export interface StorageData {
  settings: {
    defaultFormat: 'json' | 'markdown';
    autoExport: boolean;
    customTemplate?: string;
  };
} 