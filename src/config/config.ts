import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Available models
export interface ModelInfo {
  name: string;
  displayName: string;
  description: string;
  task: string;
}

export interface ModelsConfig {
  [key: string]: ModelInfo;
}

export const AVAILABLE_MODELS: ModelsConfig = {
  'distilgpt2': {
    name: 'distilgpt2',
    displayName: 'DistilGPT-2',
    description: 'Distilled version of GPT-2, a transformer-based language model',
    task: 'text-generation'
  },
  'flan-t5-large': {
    name: 'google/flan-t5-large',
    displayName: 'Flan-T5 Large',
    description: 'Finetuned version of T5 with instructions',
    task: 'text2text-generation'
  },
  'bloom-560m': {
    name: 'bigscience/bloom-560m',
    displayName: 'BLOOM 560M',
    description: 'BLOOM language model, 560M parameter version',
    task: 'text-generation'
  }
};

// Default model to use
export const DEFAULT_MODEL = 'distilgpt2';

// Configuration for API request
export const MAX_NEW_TOKENS = 100;
export const TEMPERATURE = 0.7;
export const TOP_K = 50;
export const TOP_P = 0.95;

// Get Hugging Face API key from environment variables
export const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN || '';

// Server configuration
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';