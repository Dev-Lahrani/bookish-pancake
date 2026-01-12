/**
 * API Service - Enhanced with caching, retry logic, and better error handling
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Request/Response types
export interface AnalysisMetrics {
  sentenceUniformity: number;
  perplexity: number;
  burstiness: number;
  aiPhraseCount: number;
  vocabularyDiversity: number;
  readabilityScore: number;
}

export interface SuspiciousSection {
  start: number;
  end: number;
  reason: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DetectedPattern {
  pattern: string;
  count: number;
  examples: string[];
}

export interface AnalysisResult {
  overallScore: number;
  metrics: AnalysisMetrics;
  suspiciousSections: SuspiciousSection[];
  detectedPatterns: DetectedPattern[];
  recommendations: string[];
  processingTime?: number;
}

export interface HumanizationOptions {
  tone: 'casual' | 'professional' | 'academic' | 'creative';
  intensity: 'light' | 'medium' | 'aggressive';
  preserveTechnical: boolean;
  addPersonalTouches: boolean;
}

export interface HumanizationResult {
  humanizedText: string;
  changesCount: number;
  patternsRemoved: string[];
  statistics: {
    wordsChanged: number;
    sentenceVariations: number;
    aiPhrasesRemoved: number;
  };
  processingTime?: number;
}

export interface ServerHealth {
  status: string;
  timestamp: string;
  apis: {
    openai: boolean;
    anthropic: boolean;
  };
}

// Cache for analysis results
const analysisCache = new Map<string, { result: AnalysisResult; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// Create axios instance with retry logic
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds for AI operations
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 429) {
      return Promise.reject(new Error('Too many requests. Please wait a moment and try again.'));
    }
    if (error.response?.status === 503) {
      return Promise.reject(new Error('Server is temporarily unavailable. Please try again later.'));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. The analysis took too long. Please try with shorter text.'));
    }
    return Promise.reject(error);
  }
);

/**
 * Analyze text for AI detection with caching
 */
export async function analyzeText(text: string, useCache = true): Promise<AnalysisResult> {
  try {
    // Check cache first
    const cacheKey = text.substring(0, 100);
    if (useCache && analysisCache.has(cacheKey)) {
      const cached = analysisCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.result;
      }
      analysisCache.delete(cacheKey);
    }

    const startTime = Date.now();
    const response = await api.post<AnalysisResult>('/api/analyze', { text });
    const processingTime = Date.now() - startTime;

    const result = { ...response.data, processingTime };

    // Cache the result
    analysisCache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.response?.data?.error || 'Analysis failed. Please check your connection and try again.');
  }
}

/**
 * Humanize AI-generated text with retry logic
 */
export async function humanizeText(
  text: string,
  options: HumanizationOptions,
  retries = 2
): Promise<HumanizationResult> {
  try {
    const startTime = Date.now();
    const response = await api.post<HumanizationResult>('/api/humanize', {
      text,
      options,
    });
    const processingTime = Date.now() - startTime;

    return { ...response.data, processingTime };
  } catch (error: any) {
    // Retry logic for transient failures
    if (retries > 0 && error.code === 'ECONNRESET') {
      console.log(`Retrying humanization (${retries} attempts left)...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return humanizeText(text, options, retries - 1);
    }

    if (error instanceof Error) {
      throw error;
    }

    const errorMsg = error.response?.data?.error || error.response?.data?.details;
    throw new Error(
      errorMsg || 'Humanization failed. Please check your API key is configured and try again.'
    );
  }
}

/**
 * Check server health with connection validation
 */
export async function checkHealth(): Promise<ServerHealth> {
  try {
    const response = await api.get<ServerHealth>('/health');
    return response.data;
  } catch (error) {
    throw new Error('Cannot connect to server. Make sure it\'s running on port 3001.');
  }
}

/**
 * Analyze PDF file for plagiarism
 */
export async function analyzePDF(formData: FormData): Promise<AnalysisResult> {
  try {
    const startTime = Date.now();
    const response = await axios.post<any>(`${API_BASE_URL}/api/analyze-pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000,
    });
    const processingTime = Date.now() - startTime;

    // Extract analysis from response
    return {
      ...response.data.data.analysisResults,
      processingTime,
    };
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    const errorMsg = error.response?.data?.error || 'PDF analysis failed';
    throw new Error(errorMsg);
  }
}

/**
 * Analyze multiple texts in batch
 */
export async function batchAnalyzeTexts(texts: string[]): Promise<any> {
  try {
    const startTime = Date.now();
    const response = await api.post('/api/batch-analyze', { texts });
    const processingTime = Date.now() - startTime;

    return {
      ...response.data.data,
      processingTime,
    };
  } catch (error: any) {
    if (error instanceof Error) {
      throw error;
    }
    const errorMsg = error.response?.data?.error || 'Batch analysis failed';
    throw new Error(errorMsg);
  }
}

/**
 * Get analysis history
 */
export async function getAnalysisHistory(limit = 50, offset = 0): Promise<any> {
  try {
    const response = await api.get('/api/history', {
      params: { limit, offset },
    });
    return response.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || 'Failed to fetch history';
    throw new Error(errorMsg);
  }
}

/**
 * Get specific analysis by ID
 */
export async function getAnalysisById(id: string): Promise<any> {
  try {
    const response = await api.get(`/api/history/${id}`);
    return response.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || 'Analysis not found';
    throw new Error(errorMsg);
  }
}

/**
 * Delete analysis record
 */
export async function deleteAnalysis(id: string): Promise<any> {
  try {
    const response = await api.delete(`/api/history/${id}`);
    return response.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || 'Failed to delete analysis';
    throw new Error(errorMsg);
  }
}

/**
 * Get usage statistics
 */
export async function getStatistics(): Promise<any> {
  try {
    const response = await api.get('/api/statistics');
    return response.data.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || 'Failed to fetch statistics';
    throw new Error(errorMsg);
  }
}

/**
 */
export function clearCache(): void {
  analysisCache.clear();
}
