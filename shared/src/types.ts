/**
 * Shared TypeScript types for AI Plagiarism Detector and Humanizer
 */

// Analysis Types
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

// Humanization Types
export type Tone = 'casual' | 'professional' | 'academic' | 'creative';
export type Intensity = 'light' | 'medium' | 'aggressive';

export interface HumanizationOptions {
  tone: Tone;
  intensity: Intensity;
  preserveTechnical: boolean;
  addPersonalTouches: boolean;
}

export interface HumanizationStatistics {
  wordsChanged: number;
  sentenceVariations: number;
  aiPhrasesRemoved: number;
}

export interface HumanizationResult {
  humanizedText: string;
  changesCount: number;
  patternsRemoved: string[];
  statistics: HumanizationStatistics;
}

// API Request/Response Types
export interface AnalyzeRequest {
  text: string;
}

export interface AnalyzeResponse extends AnalysisResult {}

export interface HumanizeRequest {
  text: string;
  options: HumanizationOptions;
}

export interface HumanizeResponse extends HumanizationResult {}

// UI Types
export interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: string;
  description: string;
  color: string;
}

export interface TextComparisonProps {
  originalText: string;
  modifiedText: string;
}

// Risk Level Calculation
export type RiskLevel = 'low' | 'medium' | 'high';

export function getRiskLevel(score: number): RiskLevel {
  if (score <= 30) return 'low';
  if (score <= 70) return 'medium';
  return 'high';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return '#22c55e'; // green
    case 'medium': return '#eab308'; // yellow
    case 'high': return '#ef4444'; // red
  }
}
