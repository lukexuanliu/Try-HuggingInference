import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { HUGGINGFACE_API_TOKEN, AVAILABLE_MODELS, ModelInfo } from '../config/config';
import logger from '../utils/logger';

// Types for API responses
export interface GenerationResult {
  generated_text: string;
}

export interface DebugInfo {
  model: ModelInfo;
  requestUrl: string;
  requestHeaders: Record<string, string>;
  requestPayload: any;
  requestTime: number;
  rawRequest: any;
  rawResponse: any;
  httpStatus: number | null;
}

export interface ApiResponse {
  success: boolean;
  result?: string;
  error?: string;
  debugInfo: DebugInfo;
}

export class HuggingFaceAPI {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(apiToken: string = HUGGINGFACE_API_TOKEN) {
    this.baseUrl = 'https://api-inference.huggingface.co/models/';
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generate text using the specified model and prompt
   * 
   * @param modelId The ID of the model to use
   * @param prompt The prompt to generate text from
   * @param params Additional parameters for the API call
   * @returns Response containing generation results and debug info
   */
  async generateText(modelId: string, prompt: string, params: Record<string, any> = {}): Promise<ApiResponse> {
    // Start timing the request
    const startTime = Date.now();
    
    // Get the model info from available models
    const modelInfo = AVAILABLE_MODELS[modelId];
    if (!modelInfo) {
      return {
        success: false,
        error: `Model ${modelId} not found in available models`,
        debugInfo: {
          model: {} as ModelInfo,
          requestUrl: '',
          requestHeaders: {},
          requestPayload: {},
          requestTime: 0,
          rawRequest: null,
          rawResponse: null,
          httpStatus: null
        }
      };
    }
    
    // Construct the API URL
    const apiUrl = `${this.baseUrl}${modelInfo.name}`;
    logger.debug(`API URL: ${apiUrl}`);
    
    // Prepare the payload based on the task type
    const task = modelInfo.task || 'text-generation';
    const payload = { inputs: prompt, ...params };
    
    // Log the request details
    logger.debug(`Request payload: ${JSON.stringify(payload, null, 2)}`);
    
    // Prepare the debug info
    const debugInfo: DebugInfo = {
      model: modelInfo,
      requestUrl: apiUrl,
      requestHeaders: { ...this.headers, 'Authorization': '***' }, // Hide the token
      requestPayload: payload,
      requestTime: 0,
      rawRequest: null,
      rawResponse: null,
      httpStatus: null
    };
    
    try {
      // Make the API request
      const config: AxiosRequestConfig = {
        headers: this.headers
      };
      
      const response = await axios.post(apiUrl, payload, config);
      
      // Calculate the request time
      const requestTime = (Date.now() - startTime) / 1000;
      debugInfo.requestTime = parseFloat(requestTime.toFixed(3));
      
      // Log the raw request
      debugInfo.rawRequest = {
        url: apiUrl,
        method: 'POST',
        headers: { ...this.headers, 'Authorization': '***' }, // Hide the token
        body: payload
      };
      
      debugInfo.httpStatus = response.status;
      
      // Parse the response
      const result = response.data;
      debugInfo.rawResponse = result;
      
      logger.debug(`Response status: ${response.status}`);
      logger.debug(`Response body: ${JSON.stringify(result, null, 2)}`);
      
      // Process the result based on the task
      const processedResult = this.processResult(result, task);
      
      return {
        success: true,
        result: processedResult,
        debugInfo
      };
      
    } catch (error) {
      // Handle request errors
      const err = error as AxiosError;
      logger.error(`API request error: ${err.message}`);
      
      let errorMessage = err.message;
      
      // Try to parse the error response if available
      if (err.response) {
        debugInfo.httpStatus = err.response.status;
        try {
          const errorJson = err.response.data as any;
          debugInfo.rawResponse = errorJson;
          errorMessage = errorJson.error || err.message;
        } catch (e) {
          debugInfo.rawResponse = err.response.data;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        debugInfo
      };
    }
  }

  /**
   * Process the API result based on the task type
   * 
   * @param result The raw API result
   * @param task The task type (text-generation, text2text-generation, etc.)
   * @returns Processed result string
   */
  private processResult(result: any, task: string): string {
    if (task === 'text-generation' || task === 'text2text-generation') {
      // For text generation models like GPT-2 or T5
      if (Array.isArray(result) && result.length > 0) {
        return result[0].generated_text || '';
      }
    }
    
    // Default fallback
    return JSON.stringify(result);
  }
}