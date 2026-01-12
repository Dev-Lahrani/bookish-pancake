/**
 * Text Analysis Utilities
 * Implements various algorithms to detect AI-generated content
 */

import natural from 'natural';
import compromise from 'compromise';
import { AnalysisMetrics, SuspiciousSection, DetectedPattern } from '../../../shared/src/types';

const tokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();

/**
 * Common AI phrases and patterns that frequently appear in AI-generated text
 */
const AI_PHRASES = [
  'it\'s important to note that',
  'it is important to note that',
  'it\'s worth noting',
  'it is worth noting',
  'delve into',
  'delves into',
  'delving into',
  'in today\'s digital age',
  'in this digital age',
  'in conclusion',
  'to conclude',
  'furthermore',
  'moreover',
  'additionally',
  'in addition',
  'it should be noted',
  'one must consider',
  'it is crucial to',
  'it is essential to',
  'plays a crucial role',
  'plays a vital role',
  'the realm of',
  'the landscape of',
  'tapestry of',
  'myriad of',
  'plethora of',
  'a testament to',
  'underscores the importance',
  'highlights the significance',
  'pivotal role in',
  'paramount importance',
  'navigate the complexities',
  'shed light on',
  'first and foremost',
  'at the end of the day',
  'when all is said and done'
];

/**
 * Calculate sentence uniformity score
 * Higher score indicates more uniform sentences (more AI-like)
 * @param text - Input text to analyze
 * @returns Score from 0-100
 */
export function calculateSentenceUniformity(text: string): number {
  const sentences = sentenceTokenizer.tokenize(text);
  
  if (sentences.length < 2) {
    return 0;
  }

  // Calculate sentence lengths
  const lengths = sentences.map(s => s.split(/\s+/).length);
  
  // Calculate mean
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  
  // Calculate standard deviation
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate coefficient of variation (CV)
  const cv = stdDev / mean;
  
  // Lower CV = more uniform = higher AI score
  // Normalize to 0-100 scale (typical human CV is 0.3-0.7, AI is 0.1-0.3)
  const uniformityScore = Math.max(0, Math.min(100, (1 - cv) * 150));
  
  return Math.round(uniformityScore);
}

/**
 * Calculate perplexity score (word predictability)
 * Lower perplexity = more predictable = more AI-like
 * @param text - Input text to analyze
 * @returns Score from 0-100
 */
export function calculatePerplexity(text: string): number {
  const words = tokenizer.tokenize(text.toLowerCase());
  
  if (words.length < 10) {
    return 0;
  }

  // Build bigram frequency map
  const bigramCounts = new Map<string, Map<string, number>>();
  const unigramCounts = new Map<string, number>();
  
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    
    // Update unigram counts
    unigramCounts.set(w1, (unigramCounts.get(w1) || 0) + 1);
    
    // Update bigram counts
    if (!bigramCounts.has(w1)) {
      bigramCounts.set(w1, new Map());
    }
    const w1Map = bigramCounts.get(w1)!;
    w1Map.set(w2, (w1Map.get(w2) || 0) + 1);
  }
  
  // Calculate average conditional probability
  let totalLogProb = 0;
  let count = 0;
  
  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i];
    const w2 = words[i + 1];
    
    const w1Count = unigramCounts.get(w1) || 0;
    const w1w2Count = bigramCounts.get(w1)?.get(w2) || 0;
    
    if (w1Count > 0) {
      const prob = w1w2Count / w1Count;
      // Add smoothing to avoid log(0)
      totalLogProb += Math.log(prob + 0.01);
      count++;
    }
  }
  
  const avgLogProb = totalLogProb / count;
  const perplexity = Math.exp(-avgLogProb);
  
  // Normalize to 0-100 scale (lower perplexity = higher AI score)
  // Typical range: human 50-200, AI 20-80
  const perplexityScore = Math.max(0, Math.min(100, (100 - perplexity / 2)));
  
  return Math.round(perplexityScore);
}

/**
 * Calculate burstiness score (sentence length variation)
 * Human writing has higher burstiness (more variation)
 * @param text - Input text to analyze
 * @returns Score from 0-100 (lower = more human-like)
 */
export function calculateBurstiness(text: string): number {
  const sentences = sentenceTokenizer.tokenize(text);
  
  if (sentences.length < 3) {
    return 50; // Not enough data
  }

  // Calculate sentence complexities (word count and clause count)
  const complexities = sentences.map(s => {
    const wordCount = s.split(/\s+/).length;
    const clauseCount = (s.match(/[,;:]/g) || []).length + 1;
    return wordCount * (1 + clauseCount * 0.2);
  });
  
  // Calculate coefficient of variation
  const mean = complexities.reduce((a, b) => a + b, 0) / complexities.length;
  const variance = complexities.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / complexities.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / mean;
  
  // Higher CV = more bursty = more human-like = lower AI score
  // Typical human CV: 0.5-1.0, AI CV: 0.2-0.4
  const burstinessScore = Math.max(0, Math.min(100, (1 - cv) * 200));
  
  return Math.round(burstinessScore);
}

/**
 * Detect common AI phrases in text
 * @param text - Input text to analyze
 * @returns Array of detected patterns with examples
 */
export function detectAIPhrases(text: string): DetectedPattern[] {
  const lowerText = text.toLowerCase();
  const detectedPatterns: DetectedPattern[] = [];
  
  for (const phrase of AI_PHRASES) {
    const regex = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    
    if (matches && matches.length > 0) {
      // Find examples with context
      const examples: string[] = [];
      let lastIndex = 0;
      
      for (let i = 0; i < Math.min(matches.length, 3); i++) {
        const index = lowerText.indexOf(phrase, lastIndex);
        if (index !== -1) {
          const start = Math.max(0, index - 30);
          const end = Math.min(text.length, index + phrase.length + 30);
          const context = text.substring(start, end).replace(/\n/g, ' ');
          examples.push(`...${context}...`);
          lastIndex = index + 1;
        }
      }
      
      detectedPatterns.push({
        pattern: phrase,
        count: matches.length,
        examples
      });
    }
  }
  
  return detectedPatterns.sort((a, b) => b.count - a.count);
}

/**
 * Calculate vocabulary diversity using Type-Token Ratio
 * @param text - Input text to analyze
 * @returns Score from 0-100
 */
export function calculateVocabularyDiversity(text: string): number {
  const words = tokenizer.tokenize(text.toLowerCase());
  
  if (words.length < 50) {
    return 50; // Not enough data
  }

  // Calculate Type-Token Ratio (TTR)
  const uniqueWords = new Set(words);
  const ttr = uniqueWords.size / words.length;
  
  // Calculate lexical density (content words / total words)
  const doc = compromise(text);
  const nouns = doc.nouns().out('array').length;
  const verbs = doc.verbs().out('array').length;
  const adjectives = doc.adjectives().out('array').length;
  const contentWords = nouns + verbs + adjectives;
  const lexicalDensity = contentWords / words.length;
  
  // AI tends to have unnaturally high vocabulary diversity
  // Human TTR: 0.4-0.6, AI TTR: 0.6-0.8
  const diversityScore = Math.max(0, Math.min(100, (ttr - 0.4) * 250));
  
  // Combine with lexical density
  // Human lexical density: 0.4-0.5, AI: 0.5-0.6
  const densityScore = Math.max(0, Math.min(100, (lexicalDensity - 0.4) * 500));
  
  const finalScore = (diversityScore * 0.7 + densityScore * 0.3);
  
  return Math.round(finalScore);
}

/**
 * Calculate Flesch-Kincaid readability score
 * AI often produces consistent readability levels
 * @param text - Input text to analyze
 * @returns Score from 0-100
 */
export function calculateReadability(text: string): number {
  const sentences = sentenceTokenizer.tokenize(text);
  const words = tokenizer.tokenize(text);
  
  if (sentences.length === 0 || words.length === 0) {
    return 50;
  }

  // Count syllables
  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }
  
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;
  
  // Flesch Reading Ease formula
  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  // Normalize to 0-100 (we're looking for consistency, not the score itself)
  // AI tends to maintain consistent readability around 50-70
  const normalizedScore = Math.max(0, Math.min(100, fleschScore));
  
  // Check if score is in the "too consistent" range
  const consistencyPenalty = (normalizedScore > 40 && normalizedScore < 70) ? 30 : 0;
  
  return Math.round(normalizedScore + consistencyPenalty) % 100;
}

/**
 * Count syllables in a word (approximation)
 * @param word - Word to count syllables in
 * @returns Number of syllables
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  
  return matches ? matches.length : 1;
}

/**
 * Find suspicious sections in the text
 * @param text - Input text to analyze
 * @param metrics - Analysis metrics
 * @returns Array of suspicious sections
 */
export function findSuspiciousSections(text: string, metrics: AnalysisMetrics): SuspiciousSection[] {
  const sections: SuspiciousSection[] = [];
  const paragraphs = text.split(/\n\n+/);
  let currentPos = 0;
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim().length < 50) {
      currentPos += paragraph.length + 2;
      continue;
    }
    
    const sentences = sentenceTokenizer.tokenize(paragraph);
    
    // Check for perfect grammar (few or no punctuation variations)
    const punctuationVariety = new Set(paragraph.match(/[.,!?;:]/g) || []).size;
    if (punctuationVariety <= 2 && sentences.length > 3) {
      sections.push({
        start: currentPos,
        end: currentPos + paragraph.length,
        reason: 'Suspiciously perfect grammar and punctuation',
        severity: 'medium'
      });
    }
    
    // Check for repetitive sentence structure
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const lengthVariation = Math.max(...sentenceLengths) - Math.min(...sentenceLengths);
    if (lengthVariation < 5 && sentences.length > 3) {
      sections.push({
        start: currentPos,
        end: currentPos + paragraph.length,
        reason: 'Repetitive sentence structure',
        severity: 'high'
      });
    }
    
    // Check for high AI phrase density
    const aiPhraseCount = AI_PHRASES.filter(phrase => 
      paragraph.toLowerCase().includes(phrase)
    ).length;
    
    if (aiPhraseCount >= 2) {
      sections.push({
        start: currentPos,
        end: currentPos + paragraph.length,
        reason: `Contains ${aiPhraseCount} common AI phrases`,
        severity: 'high'
      });
    }
    
    currentPos += paragraph.length + 2;
  }
  
  return sections;
}

/**
 * Generate recommendations based on analysis
 * @param metrics - Analysis metrics
 * @param detectedPatterns - Detected AI patterns
 * @returns Array of recommendations
 */
export function generateRecommendations(
  metrics: AnalysisMetrics,
  detectedPatterns: DetectedPattern[]
): string[] {
  const recommendations: string[] = [];
  
  if (metrics.sentenceUniformity > 60) {
    recommendations.push('Vary your sentence lengths more - mix short, punchy sentences with longer, more complex ones.');
  }
  
  if (metrics.burstiness < 40) {
    recommendations.push('Add more variation in sentence complexity. Humans naturally write with inconsistent patterns.');
  }
  
  if (detectedPatterns.length > 0) {
    recommendations.push(`Remove or rephrase common AI phrases like "${detectedPatterns[0].pattern}".`);
  }
  
  if (metrics.vocabularyDiversity > 70) {
    recommendations.push('Use more natural, everyday vocabulary. Avoid overly formal or varied word choices.');
  }
  
  if (metrics.perplexity > 60) {
    recommendations.push('Make your writing less predictable. Use unexpected transitions and word choices.');
  }
  
  recommendations.push('Add personal anecdotes, opinions, or examples to make the text more authentic.');
  recommendations.push('Include some minor imperfections like contractions, casual phrases, or conversational asides.');
  
  return recommendations;
}

/**
 * Perform complete text analysis
 * @param text - Input text to analyze
 * @returns Complete analysis metrics
 */
export function analyzeText(text: string): {
  metrics: AnalysisMetrics;
  detectedPatterns: DetectedPattern[];
} {
  const metrics: AnalysisMetrics = {
    sentenceUniformity: calculateSentenceUniformity(text),
    perplexity: calculatePerplexity(text),
    burstiness: calculateBurstiness(text),
    aiPhraseCount: 0,
    vocabularyDiversity: calculateVocabularyDiversity(text),
    readabilityScore: calculateReadability(text)
  };
  
  const detectedPatterns = detectAIPhrases(text);
  metrics.aiPhraseCount = detectedPatterns.reduce((sum, p) => sum + p.count, 0);
  
  return { metrics, detectedPatterns };
}
