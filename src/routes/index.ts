import { Router, Request, Response } from 'express';
import { AVAILABLE_MODELS, DEFAULT_MODEL, MAX_NEW_TOKENS, TEMPERATURE, TOP_K, TOP_P } from '../config/config';
import { HuggingFaceAPI } from '../services/huggingfaceApi';
import logger from '../utils/logger';

const router = Router();
const huggingFaceAPI = new HuggingFaceAPI();

/**
 * Home page route
 */
router.get('/', (req: Request, res: Response) => {
  res.render('index', {
    models: AVAILABLE_MODELS,
    defaultModel: DEFAULT_MODEL,
    defaultParams: {
      max_new_tokens: MAX_NEW_TOKENS,
      temperature: TEMPERATURE,
      top_k: TOP_K,
      top_p: TOP_P
    }
  });
});

/**
 * API endpoint for text generation
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { model, prompt, params } = req.body;
    
    if (!model) {
      res.status(400).json({ error: 'Model is required' });
      return;
    }
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }
    
    logger.info(`Generating text with model: ${model}, prompt: ${prompt}`);
    
    // Parse the params if they are provided as a string
    let parsedParams = params;
    if (typeof params === 'string') {
      try {
        parsedParams = JSON.parse(params);
      } catch (error) {
        logger.error(`Failed to parse params: ${error}`);
        res.status(400).json({ error: 'Invalid params format' });
        return;
      }
    }
    
    // Generate text using the Hugging Face API
    const response = await huggingFaceAPI.generateText(model, prompt, parsedParams);
    
    res.json(response);
  } catch (error: any) {
    logger.error(`Error generating text: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to generate text',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;