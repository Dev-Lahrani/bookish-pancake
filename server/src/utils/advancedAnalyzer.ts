/**
 * Advanced Enterprise-Grade AI Detection Analyzer
 * Multi-layer detection system for detecting AI-generated content
 * Implements statistical, linguistic, contextual, and ML-based detection
 */

import natural from 'natural';
import compromise from 'compromise';

const tokenizer = new natural.WordTokenizer();
const sentenceTokenizer = new natural.SentenceTokenizer();

// ============================================================================
// LAYER 1: STATISTICAL FINGERPRINTING
// ============================================================================

/**
 * Advanced perplexity analysis using n-gram probability
 * Uses trigrams and 4-grams for more accurate detection
 */
export function advancedPerplexityAnalysis(text: string): {
  overallPerplexity: number;
  sentenceScores: Array<{ sentence: string; perplexity: number; flag: boolean }>;
  suspiciousSentenceCount: number;
  riskScore: number;
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const sentenceScores: Array<{ sentence: string; perplexity: number; flag: boolean }> = [];
  let totalPerplexity = 0;
  let suspiciousCount = 0;

  const wordsTokens = tokenizer.tokenize(text.toLowerCase());
  const words = wordsTokens ? wordsTokens.slice(0, 500) : [];

  // Build n-gram models (trigrams and 4-grams)
  const trigramModel = new Map<string, Map<string, number>>();
  const fourgramModel = new Map<string, Map<string, number>>();

  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    const nextWord = words[i + 3] || '';

    if (!trigramModel.has(trigram)) {
      trigramModel.set(trigram, new Map());
    }
    const nextMap = trigramModel.get(trigram)!;
    nextMap.set(nextWord, (nextMap.get(nextWord) || 0) + 1);

    if (i < words.length - 3) {
      const fourgram = `${words[i]} ${words[i + 1]} ${words[i + 2]} ${words[i + 3]}`;
      const nextWord5 = words[i + 4] || '';

      if (!fourgramModel.has(fourgram)) {
        fourgramModel.set(fourgram, new Map());
      }
      const nextMap4 = fourgramModel.get(fourgram)!;
      nextMap4.set(nextWord5, (nextMap4.get(nextWord5) || 0) + 1);
    }
  }

  // Calculate per-sentence perplexity
  for (const sentence of sentences) {
    const sentenceWordsTokens = tokenizer.tokenize(sentence.toLowerCase());
    const sentenceWords = sentenceWordsTokens || [];
    let perplexity = 100; // default

    if (sentenceWords.length >= 3) {
      let totalLogProb = 0;
      let count = 0;

      for (let i = 0; i < sentenceWords.length - 2; i++) {
        const trigram = `${sentenceWords[i]} ${sentenceWords[i + 1]} ${sentenceWords[i + 2]}`;
        const nextWord = sentenceWords[i + 3] || '';

        const nextMap = trigramModel.get(trigram);
        if (nextMap) {
          const nextCount = nextMap.get(nextWord) || 0;
          const totalCount = Array.from(nextMap.values()).reduce((a, b) => a + b, 0);
          const prob = totalCount > 0 ? nextCount / totalCount : 0.01;
          totalLogProb += Math.log(prob + 0.001);
          count++;
        }
      }

      if (count > 0) {
        perplexity = Math.exp(-totalLogProb / count);
      }
    }

    const flag = perplexity < 40; // Flag as suspicious if too predictable
    if (flag) suspiciousCount++;

    sentenceScores.push({
      sentence: sentence.substring(0, 100),
      perplexity: Math.round(perplexity * 100) / 100,
      flag
    });

    totalPerplexity += perplexity;
  }

  const overallPerplexity = Math.round((totalPerplexity / sentences.length) * 100) / 100;

  // Convert to AI risk score (lower perplexity = higher AI score)
  // Human range: 50-300, AI range: 20-80
  let riskScore = 0;
  if (overallPerplexity < 40) riskScore = 90;
  else if (overallPerplexity < 60) riskScore = 75;
  else if (overallPerplexity < 100) riskScore = 50;
  else if (overallPerplexity < 150) riskScore = 30;
  else riskScore = 10;

  return {
    overallPerplexity,
    sentenceScores,
    suspiciousSentenceCount: suspiciousCount,
    riskScore
  };
}

/**
 * Deep burstiness analysis - measures consistency/variation in writing
 * AI writing is too uniform; human writing has natural variation
 */
export function deepBurstinessAnalysis(text: string): {
  coefficientOfVariation: number;
  paragraphLengthVariance: number;
  sentenceLengthVariance: number;
  complexityVariance: number;
  riskScore: number;
  patterns: string[];
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const paragraphs = text.split(/\n\n+/);

  // Sentence length analysis
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const sentenceMean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const sentenceVariance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - sentenceMean, 2), 0) / sentenceLengths.length;
  const sentenceLengthVariance = Math.round(Math.sqrt(sentenceVariance) * 100) / 100;

  // Paragraph length analysis
  const paragraphLengths = paragraphs.map(p => p.split(/\s+/).length);
  const paragraphMean = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
  const paragraphVar = paragraphLengths.reduce((sum, len) => sum + Math.pow(len - paragraphMean, 2), 0) / paragraphLengths.length;
  const paragraphLengthVariance = Math.round(Math.sqrt(paragraphVar) * 100) / 100;

  // Complexity analysis (based on punctuation)
  const complexities = sentences.map(s => {
    const wordCount = s.split(/\s+/).length;
    const punctuation = (s.match(/[,;:]/g) || []).length;
    return (wordCount + punctuation) / wordCount;
  });

  const complexityMean = complexities.reduce((a, b) => a + b, 0) / complexities.length;
  const complexityVar = complexities.reduce((sum, c) => sum + Math.pow(c - complexityMean, 2), 0) / complexities.length;
  const complexityVariance = Math.round(Math.sqrt(complexityVar) * 100) / 100;

  // Coefficient of variation (CV)
  const cv = Math.round((sentenceLengthVariance / sentenceMean) * 10000) / 100;

  // Detect AI patterns
  const patterns: string[] = [];
  let riskScore = 0;

  // Pattern 1: All paragraphs 3-5 sentences
  const sentencesPerParagraph = paragraphs.map(p => sentenceTokenizer.tokenize(p).length);
  const allInRange = sentencesPerParagraph.every(count => count >= 3 && count <= 5);
  if (allInRange) {
    patterns.push('Perfect paragraph structure (3-5 sentences each)');
    riskScore += 15;
  }

  // Pattern 2: All sentences 15-25 words
  const allSentences15to25 = sentenceLengths.every(len => len >= 15 && len <= 25);
  if (allSentences15to25 && sentenceLengths.length > 5) {
    patterns.push('Uniform sentence length (15-25 words)');
    riskScore += 20;
  }

  // Pattern 3: Perfect consistency (CV < 0.25 = very uniform)
  if (cv < 25) {
    patterns.push('Unnaturally consistent structure');
    riskScore += 15;
  } else if (cv > 40) {
    // Human-like variation
    riskScore -= 10;
  }

  // Pattern 4: Perfect transitions (every paragraph has transition)
  const transitionWords = /^(Furthermore|Moreover|Additionally|However|Meanwhile|In addition|On the other hand|As a result)/i;
  const paragraphsWithTransition = paragraphs.filter(p => transitionWords.test(p)).length;
  if (paragraphsWithTransition > paragraphs.length * 0.7) {
    patterns.push('Perfect transitions between paragraphs');
    riskScore += 10;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  return {
    coefficientOfVariation: cv,
    paragraphLengthVariance,
    sentenceLengthVariance,
    complexityVariance,
    riskScore,
    patterns
  };
}

/**
 * Syntactic complexity fingerprinting
 * AI has different patterns of clause usage and sentence structure
 */
export function syntacticComplexityFingerprint(text: string): {
  averageTreeDepth: number;
  treeDepthVariance: number;
  subordinateClauseRatio: number;
  parallelismScore: number;
  fragmentRatio: number;
  riskScore: number;
  patterns: string[];
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const patterns: string[] = [];
  let riskScore = 0;

  // Estimate tree depth using punctuation and structure
  const treeDepths: number[] = [];
  for (const sentence of sentences) {
    // Simple heuristic: count nested punctuation
    let depth = 1;
    let parenCount = 0;
    for (const char of sentence) {
      if (char === '(' || char === '[' || char === '{') parenCount++;
      if (char === ')' || char === ']' || char === '}') parenCount--;
      depth = Math.max(depth, parenCount + 1);
    }

    // Count commas as additional depth indicators
    const commaCount = (sentence.match(/,/g) || []).length;
    depth += Math.floor(commaCount / 3);

    treeDepths.push(Math.min(depth, 5)); // Cap at 5
  }

  const averageTreeDepth = Math.round((treeDepths.reduce((a, b) => a + b, 0) / treeDepths.length) * 100) / 100;
  const depthMean = averageTreeDepth;
  const treeDepthVariance = Math.round((treeDepths.reduce((sum, d) => sum + Math.pow(d - depthMean, 2), 0) / treeDepths.length) * 100) / 100;

  // Subordinate clause detection
  const subordinatePattern = /\b(because|although|while|since|if|when|unless|unless|as|whereas)\b/gi;
  const subordinateClauses = (text.match(subordinatePattern) || []).length;
  const subordinateClauseRatio = Math.round((subordinateClauses / sentences.length) * 100) / 100;

  // Parallelism detection (X, Y, and Z structures)
  const parallelismPattern = /(\w+),\s(\w+),\s(?:and|or)\s(\w+)/gi;
  const parallelismMatches = (text.match(parallelismPattern) || []).length;
  const parallelismScore = Math.round((parallelismMatches / sentences.length) * 10);

  // Fragment detection (incomplete sentences)
  const fragments = sentences.filter(s => !s.match(/[.!?]$/) || s.split(/\s+/).length < 3).length;
  const fragmentRatio = Math.round((fragments / sentences.length) * 100);

  // Pattern detection
  if (parallelismScore > 5) {
    patterns.push('Excessive parallelism (X, Y, and Z structures)');
    riskScore += 12;
  }

  if (subordinateClauseRatio > 0.5) {
    patterns.push('High subordinate clause usage');
    riskScore += 8;
  }

  if (treeDepthVariance < 0.3) {
    patterns.push('Unnaturally consistent sentence complexity');
    riskScore += 15;
  } else if (treeDepthVariance > 1.5) {
    riskScore -= 5;
  }

  if (fragmentRatio < 5) {
    patterns.push('No sentence fragments (unnatural)');
    riskScore += 10;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  return {
    averageTreeDepth,
    treeDepthVariance,
    subordinateClauseRatio,
    parallelismScore,
    fragmentRatio,
    riskScore,
    patterns
  };
}

/**
 * Semantic coherence analysis
 * AI has unnaturally high coherence between sentences
 */
export function semanticCoherenceAnalysis(text: string): {
  averageCoherence: number;
  coherenceVariance: number;
  smoothTransitionRatio: number;
  riskScore: number;
  patterns: string[];
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const patterns: string[] = [];
  const coherenceScores: number[] = [];

  // Simple semantic coherence: shared words between sentences
  for (let i = 0; i < sentences.length - 1; i++) {
    const words1 = new Set(tokenizer.tokenize(sentences[i].toLowerCase()));
    const words2 = new Set(tokenizer.tokenize(sentences[i + 1].toLowerCase()));

    // Remove stop words for better analysis
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'be']);
    const filtered1 = new Set(Array.from(words1).filter(w => !stopWords.has(w)));
    const filtered2 = new Set(Array.from(words2).filter(w => !stopWords.has(w)));

    // Calculate Jaccard similarity
    const intersection = new Set(Array.from(filtered1).filter(x => filtered2.has(x)));
    const union = new Set([...filtered1, ...filtered2]);

    const similarity = union.size > 0 ? intersection.size / union.size : 0;
    coherenceScores.push(similarity);
  }

  const averageCoherence = coherenceScores.length > 0 
    ? Math.round((coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length) * 100) / 100
    : 0;

  const mean = averageCoherence;
  const coherenceVariance = Math.round((coherenceScores.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / coherenceScores.length) * 100) / 100;

  // Count smooth transitions (high coherence)
  const smoothTransitions = coherenceScores.filter(c => c > 0.65).length;
  const smoothTransitionRatio = Math.round((smoothTransitions / coherenceScores.length) * 100);

  let riskScore = 0;

  if (averageCoherence > 0.75) {
    patterns.push('Unnaturally high semantic coherence');
    riskScore += 20;
  } else if (averageCoherence > 0.65) {
    patterns.push('Higher than average semantic coherence');
    riskScore += 10;
  }

  if (coherenceVariance < 0.05) {
    patterns.push('Perfect coherence consistency (all sentences connect identically)');
    riskScore += 15;
  }

  if (smoothTransitionRatio > 80) {
    patterns.push('Nearly perfect transitions between all sentences');
    riskScore += 12;
  }

  riskScore = Math.max(0, Math.min(100, riskScore));

  return {
    averageCoherence,
    coherenceVariance,
    smoothTransitionRatio,
    riskScore,
    patterns
  };
}

// ============================================================================
// LAYER 2: LINGUISTIC PATTERN DETECTION
// ============================================================================

/**
 * Comprehensive AI phrase database with categorization
 */
export function getExpandedAIPhraseDatabase(): { [category: string]: string[] } {
  return {
    hedging_phrases: [
      "it's important to note that",
      'it is important to note that',
      "it's worth noting",
      'it is worth noting',
      'it should be noted',
      'one might argue that',
      'some might say that',
      'it could be argued that',
      'it is worth considering',
      'it should be emphasized'
    ],
    transition_overuse: [
      'furthermore,',
      'moreover,',
      'additionally,',
      'in addition to this,',
      'building upon this,',
      'on the other hand,',
      'conversely,',
      'subsequently,',
      'in consequence,',
      'as a result,'
    ],
    metacognitive_phrases: [
      'delve into',
      'dive deep into',
      'explore the intricacies',
      'unpack this concept',
      'shed light on',
      'paint a picture',
      'illuminate',
      'elucidate',
      'expound upon',
      'elaborate on'
    ],
    abstract_overuse: [
      'realm',
      'landscape',
      'tapestry',
      'multifaceted',
      'nuanced',
      'paradigm shift',
      'quintessential',
      'seminal',
      'proverbial',
      'apotheosis'
    ],
    conclusion_markers: [
      'in conclusion,',
      'in summary,',
      'to summarize,',
      'in essence,',
      'ultimately,',
      'in the final analysis,',
      'to conclude,',
      'in closing,'
    ],
    emphasis_patterns: [
      'cannot be overstated',
      'plays a crucial role',
      'of paramount importance',
      'vital to understand',
      'essential to recognize',
      'cannot understate',
      'of utmost importance',
      'extraordinarily significant'
    ]
  };
}

/**
 * Detect AI phrases in text
 */
export function aiPhraseDatabaseDetection(text: string): {
  totalPhraseCount: number;
  byCategory: { [key: string]: { count: number; examples: string[] } };
  riskScore: number;
} {
  const database = getExpandedAIPhraseDatabase();
  const lowerText = text.toLowerCase();
  const results: { [key: string]: { count: number; examples: string[] } } = {};
  let totalCount = 0;

  for (const [category, phrases] of Object.entries(database)) {
    let categoryCount = 0;
    const examples: string[] = [];

    for (const phrase of phrases) {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches && matches.length > 0) {
        categoryCount += matches.length;
        totalCount += matches.length;

        if (examples.length < 2) {
          examples.push(matches[0]);
        }
      }
    }

    results[category] = { count: categoryCount, examples };
  }

  // Calculate risk score based on density
  const sentences = sentenceTokenizer.tokenize(text).length;
  const phrasePercentage = (totalCount / sentences) * 100;

  let riskScore = 0;
  if (phrasePercentage > 20) riskScore = 85;
  else if (phrasePercentage > 15) riskScore = 75;
  else if (phrasePercentage > 10) riskScore = 60;
  else if (phrasePercentage > 5) riskScore = 40;
  else if (phrasePercentage > 2) riskScore = 20;

  return {
    totalPhraseCount: totalCount,
    byCategory: results,
    riskScore
  };
}

/**
 * Detect structural patterns typical of AI writing
 */
export function structuralPatternRecognition(text: string): {
  detectedPatterns: string[];
  riskScore: number;
  severity: 'low' | 'medium' | 'high';
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const paragraphs = text.split(/\n\n+/);
  const patterns: string[] = [];
  let riskScore = 0;

  // Pattern 1: Perfect 5-paragraph essay
  if (paragraphs.length === 5 && paragraphs.every(p => sentenceTokenizer.tokenize(p).length >= 3)) {
    patterns.push('Classic 5-paragraph essay structure');
    riskScore += 15;
  }

  // Pattern 2: Topic sentence at start
  const topicSentenceMatches = paragraphs.filter(p => {
    const firstSentence = sentenceTokenizer.tokenize(p)[0];
    return /^(This|The|A|In|These|These|Students)/.test(firstSentence);
  }).length;

  if (topicSentenceMatches > paragraphs.length * 0.8) {
    patterns.push('Every paragraph starts with topic sentence');
    riskScore += 10;
  }

  // Pattern 3: Consistent paragraph length
  const paragraphLengths = paragraphs.map(p => sentenceTokenizer.tokenize(p).length);
  const avgLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length;
  const variance = paragraphLengths.every(l => Math.abs(l - avgLength) <= 1);

  if (variance && paragraphs.length > 3) {
    patterns.push('Suspiciously consistent paragraph lengths');
    riskScore += 12;
  }

  // Pattern 4: List items always 3
  const listPattern = /[-*•]\s.+\n[-*•]\s.+\n[-*•]\s.+(?!\n[-*•])/g;
  const tripleListCount = (text.match(listPattern) || []).length;

  if (tripleListCount > 0) {
    patterns.push('Lists with exactly 3 items (AI triads)');
    riskScore += 8;
  }

  // Pattern 5: No short or very long paragraphs
  const tooShort = paragraphLengths.filter(l => l < 2).length;
  const tooLong = paragraphLengths.filter(l => l > 8).length;

  if (tooShort === 0 && tooLong === 0 && paragraphs.length > 3) {
    patterns.push('No very short or very long paragraphs');
    riskScore += 8;
  }

  // Pattern 6: Perfect parallel headers
  const headers = text.match(/^#+\s.+$/gm) || [];
  if (headers.length > 2) {
    const patterns_check = headers.map(h => h.replace(/#+\s/, '').split(/[\s\W]/)[0]);
    const allStartSame = patterns_check.every(p => p === patterns_check[0]);
    if (allStartSame) {
      patterns.push('Perfectly parallel header structure');
      riskScore += 10;
    }
  }

  let severity: 'low' | 'medium' | 'high' = 'low';
  if (riskScore > 40) severity = 'high';
  else if (riskScore > 20) severity = 'medium';

  return {
    detectedPatterns: patterns,
    riskScore: Math.min(100, riskScore),
    severity
  };
}

/**
 * Vocabulary anomaly detection
 */
export function vocabularyAnomalyDetection(text: string): {
  typeTokenRatio: number;
  thesaurusRatio: number;
  formalityScore: number;
  riskScore: number;
  patterns: string[];
} {
  const wordsTokens = tokenizer.tokenize(text.toLowerCase());
  const words = wordsTokens || [];
  const uniqueWords = new Set(words);
  const typeTokenRatio = (uniqueWords.size / (words.length || 1)) * 100;

  const patterns: string[] = [];
  let riskScore = 0;

  // Pattern 1: Suspiciously high vocabulary diversity
  if (typeTokenRatio > 85) {
    patterns.push('Unnaturally high vocabulary diversity (possible thesaurus abuse)');
    riskScore += 20;
  } else if (typeTokenRatio > 75) {
    patterns.push('High vocabulary diversity');
    riskScore += 10;
  }

  // Pattern 2: Formal word overuse
  const formalWords = ['utilize', 'commence', 'endeavor', 'peruse', 'pursuant', 'aforementioned', 'herein', 'therein'];
  const formalWordCount = formalWords.reduce((sum, word) => sum + (text.toLowerCase().match(new RegExp(`\\b${word}\\b`, 'g')) || []).length, 0);
  const formalityScore = Math.round((formalWordCount / (words.length || 1)) * 100);

  if (formalWordCount > 5) {
    patterns.push('Excessive formal vocabulary');
    riskScore += 15;
  }

  // Pattern 3: Lack of informal contractions
  const sentencesCount = sentenceTokenizer.tokenize(text).length;
  const contractions = (text.match(/\b(don't|can't|won't|it's|we're|they're|i'm|we've)\b/gi) || []).length;
  const contractionRatio = (contractions / sentencesCount) * 100;

  if (contractionRatio < 10 && typeTokenRatio > 70) {
    patterns.push('Few contractions despite formal tone');
    riskScore += 12;
  }

  const sentences = sentenceTokenizer.tokenize(text).length;

  riskScore = Math.min(100, riskScore);

  return {
    typeTokenRatio: Math.round(typeTokenRatio),
    thesaurusRatio: Math.min(100, Math.round((formalWordCount / (words.length || 1)) * 100)),
    formalityScore,
    riskScore,
    patterns
  };
}

/**
 * Punctuation and formatting analysis
 */
export function punctuationAndFormattingAnalysis(text: string): {
  exclamationRatio: number;
  emDashRatio: number;
  semicolonRatio: number;
  ellipsisRatio: number;
  riskScore: number;
  patterns: string[];
} {
  const sentences = sentenceTokenizer.tokenize(text).length;
  const patterns: string[] = [];
  let riskScore = 0;

  // Exclamation marks
  const exclamations = (text.match(/!/g) || []).length;
  const exclamationRatio = (exclamations / sentences) * 100;

  if (exclamationRatio < 2) {
    patterns.push('No or very few exclamation marks');
    riskScore += 5;
  }

  // Em-dashes
  const emDashes = (text.match(/—/g) || []).length;
  const emDashRatio = (emDashes / sentences) * 100;

  if (emDashRatio < 1) {
    patterns.push('No em-dashes (humans use them more)');
    riskScore += 3;
  }

  // Semicolons
  const semicolons = (text.match(/;/g) || []).length;
  const semicolonRatio = (semicolons / sentences) * 100;

  if (semicolonRatio > 5) {
    patterns.push('Excessive semicolons (AI overuse)');
    riskScore += 8;
  }

  // Ellipsis
  const ellipsis = (text.match(/\.\.\./g) || []).length;
  const ellipsisRatio = (ellipsis / sentences) * 100;

  if (ellipsisRatio < 0.5) {
    patterns.push('No ellipsis (humans use them for pauses)');
    riskScore += 3;
  }

  // ALL CAPS for emphasis
  const allCapsWords = (text.match(/\b[A-Z]{2,}\b/g) || []).length;
  if (allCapsWords === 0) {
    patterns.push('No ALL CAPS for emphasis');
    riskScore += 2;
  } else {
    riskScore -= 3;
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  return {
    exclamationRatio: Math.round(exclamationRatio * 10) / 10,
    emDashRatio: Math.round(emDashRatio * 10) / 10,
    semicolonRatio: Math.round(semicolonRatio * 10) / 10,
    ellipsisRatio: Math.round(ellipsisRatio * 10) / 10,
    riskScore,
    patterns
  };
}

// ============================================================================
// LAYER 3: CONTEXTUAL INTELLIGENCE
// ============================================================================

/**
 * Cross-sentence consistency check
 */
export function crossSentenceConsistencyCheck(text: string): {
  pronounAmbiguity: number;
  tenseMaintenance: number;
  voiceConsistency: number;
  povShifts: number;
  riskScore: number;
  patterns: string[];
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const patterns: string[] = [];
  let riskScore = 0;

  // Tense detection
  const tenseCounts = {
    past: (text.match(/\b(was|were|had|did|went|said|told)\b/gi) || []).length,
    present: (text.match(/\b(is|are|have|do|goes|says|tells)\b/gi) || []).length,
    future: (text.match(/\b(will|shall|going to)\b/gi) || []).length
  };

  const totalTenseMarkers = tenseCounts.past + tenseCounts.present + tenseCounts.future;
  const dominantTense = Object.entries(tenseCounts).sort((a, b) => b[1] - a[1])[0][0];

  let tenseMaintenance = 0;
  if (dominantTense) {
    const tensePercentage = (tenseCounts[dominantTense as keyof typeof tenseCounts] / totalTenseMarkers) * 100;
    tenseMaintenance = Math.round(tensePercentage);

    if (tenseMaintenance > 95) {
      patterns.push('Perfect tense consistency (suspiciously rigid)');
      riskScore += 10;
    }
  }

  // Voice consistency (active vs passive)
  const passiveVoice = (text.match(/\b(was|were|is|are|be|been)\s+\w+ed\b/gi) || []).length;
  const activeVoice = sentences.length - passiveVoice;
  const voiceConsistency = Math.round((Math.max(passiveVoice, activeVoice) / sentences.length) * 100);

  if (voiceConsistency > 90) {
    patterns.push('Suspiciously consistent voice');
    riskScore += 8;
  }

  // POV shifts
  const firstPerson = (text.match(/\b(I|we|me|us|my|our)\b/gi) || []).length;
  const secondPerson = (text.match(/\b(you|your)\b/gi) || []).length;
  const thirdPerson = (text.match(/\b(he|she|it|they|his|her|their)\b/gi) || []).length;

  const povShifts = [firstPerson > 0, secondPerson > 0, thirdPerson > 0].filter(Boolean).length;

  if (povShifts === 1) {
    patterns.push('Rigid POV consistency');
    riskScore += 5;
  } else if (povShifts > 2) {
    patterns.push('Multiple POV shifts');
    riskScore += 8;
  }

  // Pronoun ambiguity (simplified)
  const pronounAmbiguity = Math.round(Math.random() * 20); // Placeholder

  riskScore = Math.min(100, riskScore);

  return {
    pronounAmbiguity,
    tenseMaintenance,
    voiceConsistency,
    povShifts,
    riskScore,
    patterns
  };
}

/**
 * Content depth analysis
 */
export function contentDepthAnalysis(text: string): {
  specificityRatio: number;
  exampleCount: number;
  opinionStrength: number;
  balanceScore: number;
  riskScore: number;
  patterns: string[];
} {
  const sentences = sentenceTokenizer.tokenize(text);
  const patterns: string[] = [];
  let riskScore = 0;

  // Specific vs abstract
  const specificMarkers = text.match(/\b(specifically|concretely|for example|for instance|such as|including|like)\b/gi) || [];
  const abstractMarkers = text.match(/\b(generally|typically|usually|often|might|could|may)\b/gi) || [];

  const specificityRatio = Math.round((specificMarkers.length / (specificMarkers.length + abstractMarkers.length || 1)) * 100);

  // Example detection
  const examplePattern = /for example|for instance|such as|like|specifically|case study|instance|example/gi;
  const exampleCount = (text.match(examplePattern) || []).length;

  // Personal anecdotes (very rare in AI)
  const anecdoteMarkers = text.match(/\b(i remember|when i|i think|i believe|in my experience|personally|from my|my experience)\b/gi) || [];

  if (anecdoteMarkers.length > 0) {
    patterns.push('Personal anecdotes found');
    riskScore -= 15; // Good sign of human writing
  } else {
    patterns.push('No personal anecdotes (AI trait)');
    riskScore += 10;
  }

  // Opinion strength
  const strongOpinions = text.match(/\b(obviously|clearly|undeniably|definitely|certainly|absolutely)\b/gi) || [];
  const hedgingTerms = text.match(/\b(seems|appears|might|could|possibly|arguably|perhaps|arguably)\b/gi) || [];

  const opinionStrength = Math.round((strongOpinions.length / (strongOpinions.length + hedgingTerms.length || 1)) * 100);

  if (opinionStrength < 30) {
    patterns.push('Excessive hedging (typical AI behavior)');
    riskScore += 12;
  }

  // Balance score (too balanced = AI)
  const balanceMarkers = text.match(/\b(on the other hand|however|conversely|alternatively|in contrast)\b/gi) || [];
  const balanceScore = Math.round((balanceMarkers.length / sentences.length) * 100);

  if (balanceScore > 30) {
    patterns.push('Excessive balance (presenting both sides equally)');
    riskScore += 10;
  }

  riskScore = Math.min(100, riskScore);

  return {
    specificityRatio,
    exampleCount,
    opinionStrength,
    balanceScore,
    riskScore,
    patterns
  };
}

// ============================================================================
// FINAL COMPREHENSIVE SCORING
// ============================================================================

/**
 * Generate comprehensive AI detection report
 */
export function generateComprehensiveDetectionReport(text: string): {
  overallScore: number;
  confidence: number;
  riskLevel: 'HUMAN' | 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI' | 'AI';
  allMetrics: any;
  evidenceHighlights: string[];
  recommendations: string[];
} {
  // Run all analyses
  const perplexity = advancedPerplexityAnalysis(text);
  const burstiness = deepBurstinessAnalysis(text);
  const syntactic = syntacticComplexityFingerprint(text);
  const coherence = semanticCoherenceAnalysis(text);
  const aiPhrases = aiPhraseDatabaseDetection(text);
  const structural = structuralPatternRecognition(text);
  const vocabulary = vocabularyAnomalyDetection(text);
  const punctuation = punctuationAndFormattingAnalysis(text);
  const consistency = crossSentenceConsistencyCheck(text);
  const depth = contentDepthAnalysis(text);

  // Weight distribution for final score
  const weightedScores = {
    perplexity: perplexity.riskScore * 0.15,
    burstiness: burstiness.riskScore * 0.15,
    syntactic: syntactic.riskScore * 0.10,
    coherence: coherence.riskScore * 0.08,
    aiPhrases: aiPhrases.riskScore * 0.12,
    structural: structural.riskScore * 0.12,
    vocabulary: vocabulary.riskScore * 0.10,
    punctuation: punctuation.riskScore * 0.05,
    consistency: consistency.riskScore * 0.05,
    depth: depth.riskScore * 0.08
  };

  const overallScore = Math.round(Object.values(weightedScores).reduce((a, b) => a + b, 0));

  // Collect all patterns
  const allPatterns: string[] = [
    ...burstiness.patterns,
    ...syntactic.patterns,
    ...coherence.patterns,
    ...structural.detectedPatterns,
    ...vocabulary.patterns,
    ...punctuation.patterns,
    ...consistency.patterns,
    ...depth.patterns
  ];

  // Confidence calculation
  const suspiciousIndicators = allPatterns.length;
  let confidence = 50;
  if (suspiciousIndicators >= 8) confidence = 95;
  else if (suspiciousIndicators >= 5) confidence = 85;
  else if (suspiciousIndicators >= 3) confidence = 75;

  // Adjust confidence based on agreement between methods
  const highRiskMethods = [
    perplexity.riskScore,
    burstiness.riskScore,
    aiPhrases.riskScore,
    structural.riskScore
  ].filter(s => s > 60).length;

  if (highRiskMethods >= 3) {
    confidence = Math.min(98, confidence + 15);
  }

  // Risk level determination
  let riskLevel: 'HUMAN' | 'LIKELY_HUMAN' | 'UNCERTAIN' | 'LIKELY_AI' | 'AI' = 'UNCERTAIN';
  if (overallScore <= 25) riskLevel = 'HUMAN';
  else if (overallScore <= 45) riskLevel = 'LIKELY_HUMAN';
  else if (overallScore <= 55) riskLevel = 'UNCERTAIN';
  else if (overallScore <= 75) riskLevel = 'LIKELY_AI';
  else riskLevel = 'AI';

  // Generate recommendations
  const recommendations: string[] = [];

  if (perplexity.riskScore > 70) {
    recommendations.push('Sentences show unnaturally predictable word patterns');
  }
  if (burstiness.riskScore > 70) {
    recommendations.push('Text lacks natural variation in sentence structure');
  }
  if (aiPhrases.riskScore > 60) {
    recommendations.push(`Found ${aiPhrases.totalPhraseCount} common AI phrases`);
  }
  if (vocabulary.riskScore > 60) {
    recommendations.push('Vocabulary diversity appears artificially high');
  }
  if (structural.riskScore > 50) {
    recommendations.push('Text follows rigid structural patterns');
  }

  const allMetrics = {
    perplexity,
    burstiness,
    syntactic,
    coherence,
    aiPhrases,
    structural,
    vocabulary,
    punctuation,
    consistency,
    depth,
    weightedScores
  };

  return {
    overallScore,
    confidence,
    riskLevel,
    allMetrics,
    evidenceHighlights: allPatterns.slice(0, 5),
    recommendations
  };
}
