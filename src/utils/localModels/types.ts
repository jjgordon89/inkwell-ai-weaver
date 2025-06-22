
// Type definitions for local model providers

export interface LocalModelInfo {
  name: string;
  size: string;
  modified_at: string;
  digest: string;
  details?: {
    family?: string;
    parameter_size?: string;
    quantization_level?: string;
  };
}

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface LMStudioModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}
