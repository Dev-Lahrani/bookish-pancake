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

// Advanced Humanization Types
export interface AdvancedHumanizationResult {
  finalText: string;
  iterations: number;
  initialScore: number;
  finalScore: number;
  changesApplied: string[];
  confidence: 'UNDETECTABLE' | 'LOW_RISK' | 'MODERATE_RISK';
}

// Advanced Analysis Types
export type RiskLevelAdvanced = 'HUMAN' | 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI' | 'AI';

export interface AdvancedAnalysisMetrics {
  perplexity: {
    overallPerplexity: number;
    sentenceScores: Array<{ sentence: string; perplexity: number; flag: boolean }>;
    suspiciousSentenceCount: number;
    riskScore: number;
  };
  burstiness: {
    coefficientOfVariation: number;
    paragraphLengthVariance: number;
    sentenceLengthVariance: number;
    complexityVariance: number;
    riskScore: number;
    patterns: string[];
  };
  syntactic: {
    averageTreeDepth: number;
    treeDepthVariance: number;
    subordinateClauseRatio: number;
    parallelismScore: number;
    fragmentRatio: number;
    riskScore: number;
    patterns: string[];
  };
  coherence: {
    averageCoherence: number;
    coherenceVariance: number;
    smoothTransitionRatio: number;
    riskScore: number;
    patterns: string[];
  };
  aiPhrases: {
    totalPhraseCount: number;
    byCategory: { [key: string]: { count: number; examples: string[] } };
    riskScore: number;
  };
  structural: {
    detectedPatterns: string[];
    riskScore: number;
    severity: 'low' | 'medium' | 'high';
  };
  vocabulary: {
    typeTokenRatio: number;
    thesaurusRatio: number;
    formalityScore: number;
    riskScore: number;
    patterns: string[];
  };
  punctuation: {
    exclamationRatio: number;
    emDashRatio: number;
    semicolonRatio: number;
    ellipsisRatio: number;
    riskScore: number;
    patterns: string[];
  };
  consistency: {
    pronounAmbiguity: number;
    tenseMaintenance: number;
    voiceConsistency: number;
    povShifts: number;
    riskScore: number;
    patterns: string[];
  };
  depth: {
    specificityRatio: number;
    exampleCount: number;
    opinionStrength: number;
    balanceScore: number;
    riskScore: number;
    patterns: string[];
  };
}

export interface AdvancedAnalysisResult {
  overallScore: number;
  confidence: number;
  riskLevel: RiskLevelAdvanced;
  allMetrics: AdvancedAnalysisMetrics;
  evidenceHighlights: string[];
  recommendations: string[];
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
