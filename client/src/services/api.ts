/**
 * API Service
 * Handles all API calls to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds for AI operations
});

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
}

/**
 * Analyze text for AI detection
 */
export async function analyzeText(text: string): Promise<AnalysisResult> {
  try {
    const response = await api.post<AnalysisResult>('/api/analyze', { text });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Analysis failed');
  }
}

/**
 * Humanize AI-generated text
 */
export async function humanizeText(
  text: string,
  options: HumanizationOptions
): Promise<HumanizationResult> {
  try {
    const response = await api.post<HumanizationResult>('/api/humanize', {
      text,
      options,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.details || 'Humanization failed');
  }
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<{ status: string; apis: any }> {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Server is not responding');
  }
}
