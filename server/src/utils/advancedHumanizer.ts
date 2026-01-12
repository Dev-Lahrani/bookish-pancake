/**
 * Advanced Anti-Detection Humanizer
 * Sophisticated rewriting engine designed to defeat AI detection while preserving meaning
 */

import OpenAI from 'openai';
import { HumanizationOptions } from '@shared/types';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ============================================================================
// ANTI-DETECTION REWRITING STRATEGIES
// ============================================================================

/**
 * Build advanced humanization prompt with anti-detection techniques
 */
export function buildAdvancedHumanizationPrompt(text: string, options: HumanizationOptions): string {
  const intensityTechniques = {
    light: `
REWRITE LEVEL: SUBTLE (30% changes)
Apply transformations minimally to maintain naturalness while adding slight variance.
Focus on vocabulary and contractions.
    `,
    medium: `
REWRITE LEVEL: MODERATE (50% changes)
Apply multiple techniques across sentences and paragraphs.
Mix structural changes with vocabulary updates.
    `,
    aggressive: `
REWRITE LEVEL: AGGRESSIVE (70%+ changes)
Apply ALL techniques maximally.
Make text clearly more human with obvious personal voice and opinions.
Prioritize undetectability over maintaining 100% original structure.
    `
  };

  return `You are an expert at rewriting AI-generated text to be COMPLETELY UNDETECTABLE by AI detection tools while maintaining meaning and quality.

CRITICAL ANTI-DETECTION TECHNIQUES (APPLY ALL):

1. DESTROY PERPLEXITY UNIFORMITY:
   - Replace 40% of sentences with unexpected but natural word choices
   - Use informal contractions throughout: don't, won't, it's, we're, can't, I'm, they've
   - Replace formal words: "utilize" → "use", "commence" → "start", "endeavor" → "try", "peruse" → "look at"
   - Add 2-3 casual phrases like "honestly", "you know", "look", "basically"
   - Include occasional colloquialisms appropriate to the tone
   - Make word choices less predictable - avoid obvious synonym patterns

2. MAXIMIZE BURSTINESS (CRITICAL):
   - Create dramatic, uneven sentence length variation
   - Include multiple very short sentences: "This matters. Really." (2-4 words)
   - Include complex sentences with multiple clauses (35-45 words with multiple ideas)
   - Alternate between simple and complex unpredictably
   - Break traditional grammar naturally: Start with "And" or "But" occasionally
   - Use fragments for emphasis: "Not just once. Multiple times."

3. ELIMINATE ALL AI PHRASES (MANDATORY - NEVER USE):
   Remove and replace ALL of these:
   - "delve into" → "look at", "examine", "understand", "dive into"
   - "it's important to note" → Just state the point directly without preamble
   - "moreover/furthermore" → "also", "plus", "and", or remove the transition entirely
   - "in today's digital age" → Be specific about time or remove entirely
   - "landscape/realm/tapestry" (in abstract contexts) → Use concrete, specific terms
   - "multifaceted/nuanced" → Explain what you actually mean in simple words
   - "plays a crucial role" → "matters", "is important", "counts"
   - "paradigm shift" → "big change", "new way", or describe specifically

4. ADD HUMAN IMPERFECTIONS (CRITICAL):
   - Include 1-2 minor grammatical looseness (NOT errors, but natural variation)
   - Use parenthetical asides for tangential thoughts: (and yes, I know this matters)
   - Add em-dashes for interrupted/trailing thoughts — like this — naturally
   - Include personal qualifiers: "in my experience", "honestly", "I think", "from what I've seen"
   - Add one brief relatable comment or mini-story ${options.addPersonalTouches ? '(even just a sentence)' : ''}
   - Use "you know?" and "right?" occasionally for conversational tone

5. DESTROY STRUCTURAL UNIFORMITY:
   - Make paragraph lengths wildly uneven (sometimes 2 sentences, sometimes 7)
   - DON'T start every paragraph with a topic sentence
   - DON'T transition smoothly between every single paragraph
   - Let thoughts flow into each other without perfect signposting
   - Delete some transition words entirely - just move to the next idea
   - Make sections feel organic, not perfectly structured

6. REDUCE ARTIFICIAL BALANCE:
   - Take clear stances rather than presenting both sides equally
   - Use decisive language occasionally: "clearly", "obviously", "definitely"
   - Don't use "on the other hand" constantly
   - Include subjective judgment: "in my view", "I believe", "the reality is"
   - Show preference, bias, opinion - humans have these naturally

7. ADD NATURAL VOICE MARKERS:
   - Use conversational bridges: "Now", "So", "But here's where it gets interesting"
   - Include thinking-out-loud phrases: "I mean", "Actually", "The thing is", "Look"
   - Add rhetorical questions (1-2 max): "Who hasn't experienced this?"
   - Use "seriously", "actually", "honestly" as genuine emphasizers
   ${options.tone === 'casual' ? '   - Add casual interjections: "lol", "literally", "like", "for real"' : ''}
   ${options.tone === 'professional' ? '   - Add professional but personable markers: "In my work", "I\'ve found", "based on my experience"' : ''}
   ${options.tone === 'academic' ? '   - Add scholarly personality: "I argue that", "My analysis shows", "It seems to me"' : ''}

8. INTENSITY LEVEL: ${options.intensity.toUpperCase()}
${intensityTechniques[options.intensity]}

${options.preserveTechnical ? `
IMPORTANT: PRESERVE technical terms and jargon exactly as written.
Only rewrite the surrounding context and general language.
` : ''}

FINAL CHECK:
- No two consecutive sentences should have similar structure
- No AI phrases should remain
- Meaning should be 100% preserved
- Should read like someone genuinely explaining this concept
- Should pass AI detection tools without question

ORIGINAL TEXT TO REWRITE:
${text}

REWRITTEN TEXT (provide ONLY the rewritten version with NO explanations, preambles, meta-commentary, or quotation marks):`;
}

/**
 * Target pattern removal - programmatically remove known AI patterns before AI processing
 */
export function targetedPatternRemoval(text: string): string {
  let result = text;

  // Common AI patterns to replace or remove
  const replacements: { [key: string]: string } = {
    "it's important to note that": 'Importantly, ',
    'it is important to note that': 'Importantly, ',
    'it is worth noting that': '',
    "it's worth noting that": '',
    'in today\'s digital age': 'today',
    'in this digital age': 'now',
    'in this day and age': 'these days',
    'in conclusion,': 'So,',
    'to conclude,': 'ultimately,',
    'in summary,': 'simply put,',
    'delve into': 'understand',
    'delves into': 'explores',
    'moreover,': 'also,',
    'furthermore,': 'and',
    'additionally,': 'plus,',
    'in addition to this,': 'also,',
    'the realm of': 'the world of',
    'the landscape of': 'the field of',
    'a multifaceted issue': 'a complex problem',
    'multifaceted': 'complex',
    'nuanced approach': 'careful approach',
    'plays a crucial role': 'matters',
    'plays a vital role': 'is important',
    'of paramount importance': 'very important',
    'paramount importance': 'key',
    'cannot be overstated': 'is really important',
    'shed light on': 'show',
    'shed light upon': 'reveal',
    'elucidate': 'explain',
    'navigate the complexities': 'deal with the complexity',
    'first and foremost': 'first',
    'when all is said and done': 'ultimately',
    'at the end of the day': 'ultimately',
    'one must consider': 'consider',
    'it is crucial to': 'you need to'
  };

  // Apply replacements (case insensitive but preserve original case)
  for (const [pattern, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    result = result.replace(regex, replacement);
  }

  return result;
}

/**
 * Sentence restructuring engine
 * Randomly restructure sentences to avoid patterns
 */
export function sentenceRestructuringEngine(text: string): string {
  const natural = require('natural');
  const sentenceTokenizer = new natural.SentenceTokenizer();
  const sentences = sentenceTokenizer.tokenize(text);

  const restructured = sentences.map((sentence: string, index: number) => {
    // Skip very short sentences
    if (sentence.split(/\s+/).length < 5) {
      return sentence;
    }

    // Only restructure 40% of sentences to avoid over-processing
    if (Math.random() > 0.4) {
      return sentence;
    }

    let result = sentence;

    // Technique 1: Move clauses around
    if (sentence.includes(',') && Math.random() > 0.5) {
      const parts = sentence.split(',');
      if (parts.length === 2) {
        // Move dependent clause to end occasionally
        if (Math.random() > 0.5 && parts[1].match(/^s+(although|because|if|when|while|since|though)/i)) {
          result = parts[1].trim() + ', ' + parts[0].trim();
        }
      }
    }

    // Technique 2: Vary sentence opening
    if (Math.random() > 0.6 && sentence.match(/^(The|A|An|It|This|That|These|Those)/)) {
      const words = sentence.split(/\s+/);
      if (words.length > 4) {
        // Occasionally move subject-verb to middle
        if (Math.random() > 0.7) {
          const ending = words.slice(2).join(' ');
          result = ending.substring(0, 1).toUpperCase() + ending.substring(1) + ', ' + words[0] + ' ' + words[1];
        }
      }
    }

    // Technique 3: Add qualifying phrases
    if (Math.random() > 0.7) {
      const qualifiers = ['honestly,', 'really,', 'truthfully,', 'look,', 'basically,', 'simply put,'];
      result = qualifiers[Math.floor(Math.random() * qualifiers.length)] + ' ' + result.substring(0, 1).toLowerCase() + result.substring(1);
    }

    return result;
  });

  return restructured.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Vocabulary naturalization
 * Replace overly formal vocabulary with common equivalents
 */
export function vocabularyNaturalization(text: string, tone: string): string {
  let result = text;

  const replacements: { [key: string]: string } = {
    // Formal to casual
    'utilize': 'use',
    'utilise': 'use',
    'commence': 'start',
    'endeavor': 'try',
    'peruse': 'read',
    'pursuant': 'following',
    'aforementioned': 'mentioned',
    'herein': 'here',
    'therein': 'there',
    'ascertain': 'find out',
    'facilitate': 'help',
    'demonstrate': 'show',
    'illustrate': 'show',
    'elucidate': 'explain',
    'expound': 'explain',
    'propound': 'suggest',
    'advocate': 'support',
    'substantial': 'significant',
    'ubiquitous': 'everywhere',
    'ameliorate': 'improve',
    'exacerbate': 'make worse',
    'obfuscate': 'confuse',
    'obfuscation': 'confusion',
    'efficacious': 'effective',
    'dubious': 'doubtful',
    'innocuous': 'harmless',
    'egregious': 'terrible',
    'ephemeral': 'temporary',
    'erratic': 'unpredictable',
    'esoteric': 'specialized',
    'exiguous': 'small',
    'felicitous': 'lucky',
    'fortuitous': 'lucky'
  };

  // Apply replacements
  for (const [formal, casual] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${formal}\\b`, 'gi');
    result = result.replace(regex, casual);
  }

  // Add contractions if not present
  if (tone === 'casual' || tone === 'professional') {
    result = result.replace(/\sis not\b/gi, " isn't");
    result = result.replace(/\bcan not\b/gi, "can't");
    result = result.replace(/\bwill not\b/gi, "won't");
    result = result.replace(/\bdo not\b/gi, "don't");
    result = result.replace(/\bdoes not\b/gi, "doesn't");
    result = result.replace(/\bwould not\b/gi, "wouldn't");
    result = result.replace(/\bshould not\b/gi, "shouldn't");
    result = result.replace(/\bI am\b/gi, "I'm");
    result = result.replace(/\byou are\b/gi, "you're");
    result = result.replace(/\bwe are\b/gi, "we're");
    result = result.replace(/\bthey are\b/gi, "they're");
    result = result.replace(/\bit is\b/gi, "it's");
    result = result.replace(/\blet us\b/gi, "let's");
  }

  return result;
}

/**
 * Personal voice injection
 * Add personality and human voice markers
 */
export function personalVoiceInjection(text: string, intensity: string): string {
  let result = text;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  const personalQualifiers = [
    'Honestly,',
    'In my view,',
    'From what I\'ve seen,',
    'In my experience,',
    'I think',
    'I believe',
    'The way I see it,',
    'Truthfully,',
    'Look,',
    'Actually,',
    'The thing is,',
    'Here\'s the reality:',
    'From my perspective,'
  ];

  const conversationalBridges = [
    'Now,',
    'So,',
    'But here\'s the thing:',
    'The point is,',
    'Here\'s what matters:',
    'And frankly,',
    'But honestly,',
    'The reality is,'
  ];

  const rhetoricalQuestions = [
    'Right?',
    'You know?',
    'Get what I mean?',
    'See?',
    'Make sense?'
  ];

  if (intensity === 'light') {
    // Add 1 personal qualifier
    if (Math.random() > 0.6 && sentences.length > 3) {
      const insertPoint = Math.floor(sentences.length / 2);
      sentences[insertPoint] = personalQualifiers[Math.floor(Math.random() * personalQualifiers.length)] + ' ' + sentences[insertPoint];
    }
  } else if (intensity === 'medium') {
    // Add 2-3 personal qualifiers
    for (let i = 0; i < Math.min(2, Math.floor(sentences.length / 3)); i++) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      if (Math.random() > 0.4) {
        sentences[randomIndex] = personalQualifiers[Math.floor(Math.random() * personalQualifiers.length)] + ' ' + sentences[randomIndex];
      }
    }

    // Add 1 rhetorical question
    if (sentences.length > 4) {
      sentences[sentences.length - 2] = sentences[sentences.length - 2] + ' ' + rhetoricalQuestions[0];
    }
  } else if (intensity === 'aggressive') {
    // Add many personal markers
    sentences.forEach((sentence, index) => {
      if (Math.random() > 0.5 && index > 0 && index < sentences.length - 1) {
        if (Math.random() > 0.5) {
          sentences[index] = personalQualifiers[Math.floor(Math.random() * personalQualifiers.length)] + ' ' + sentence;
        } else {
          sentences[index] = sentence + ' ' + rhetoricalQuestions[Math.floor(Math.random() * rhetoricalQuestions.length)];
        }
      }
    });
  }

  return sentences.join('. ').replace(/\s+/g, ' ').trim();
}

/**
 * Perplexity boosting
 * Replace predictable words with less common but natural alternatives
 */
export function perplexityBooster(text: string): string {
  const tokenizer = new (require('natural')).WordTokenizer();
  const words = tokenizer.tokenize(text);

  // Map of common words to less common alternatives
  const unpredictableReplacements: { [key: string]: string[] } = {
    'good': ['solid', 'sound', 'compelling', 'strong'],
    'bad': ['problematic', 'flawed', 'concerning', 'troubling'],
    'thing': ['matter', 'element', 'aspect', 'factor'],
    'very': ['quite', 'remarkably', 'exceptionally', 'particularly'],
    'really': ['genuinely', 'actually', 'truly', 'certainly'],
    'also': ['equally', 'likewise', 'similarly', 'as well'],
    'great': ['significant', 'substantial', 'considerable', 'noteworthy'],
    'big': ['substantial', 'considerable', 'major', 'significant'],
    'said': ['noted', 'observed', 'remarked', 'indicated'],
    'showed': ['demonstrated', 'indicated', 'revealed', 'illustrated']
  };

  let boosted: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    if (unpredictableReplacements[word] && Math.random() > 0.6) {
      const alternatives = unpredictableReplacements[word];
      boosted.push(alternatives[Math.floor(Math.random() * alternatives.length)]);
    } else {
      boosted.push(words[i]);
    }
  }

  return boosted.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Multi-pass humanization
 * Apply all techniques in sequence for maximum anti-detection
 */
export async function multiPassHumanization(text: string, options: HumanizationOptions): Promise<string> {
  if (!openai) {
    // Fallback to local techniques if no API
    let result = text;
    result = targetedPatternRemoval(result);
    result = vocabularyNaturalization(result, options.tone);
    result = sentenceRestructuringEngine(result);
    result = personalVoiceInjection(result, options.intensity);
    result = perplexityBooster(result);
    return result;
  }

  try {
    const prompt = buildAdvancedHumanizationPrompt(text, options);

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at making AI-generated text undetectable while preserving all meaning. Apply ALL anti-detection techniques provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.95,
      max_tokens: 4000,
      presence_penalty: 0.8,
      frequency_penalty: 0.5
    });

    let humanized = response.choices[0]?.message?.content?.trim() || text;

    // Additional local processing
    humanized = vocabularyNaturalization(humanized, options.tone);
    humanized = personalVoiceInjection(humanized, options.intensity);

    return humanized;
  } catch (error) {
    console.error('Error in multi-pass humanization:', error);
    // Fallback to local techniques
    let result = text;
    result = targetedPatternRemoval(result);
    result = vocabularyNaturalization(result, options.tone);
    result = sentenceRestructuringEngine(result);
    result = personalVoiceInjection(result, options.intensity);
    return result;
  }
}

/**
 * Post-processing validation
 */
export async function postProcessingValidation(original: string, humanized: string, options: HumanizationOptions): Promise<{
  isValid: boolean;
  meaningPreserved: boolean;
  aiDetectionScore: number;
  needsRefinement: boolean;
}> {
  // Validate meaning preservation (simple similarity check)
  const originalWords = new Set((original.match(/\b\w+\b/g) || []).map(w => w.toLowerCase()));
  const humanizedWords = new Set((humanized.match(/\b\w+\b/g) || []).map(w => w.toLowerCase()));

  const intersection = new Set([...originalWords].filter(x => humanizedWords.has(x)));
  const union = new Set([...originalWords, ...humanizedWords]);
  const jaccardSimilarity = intersection.size / union.size;

  const meaningPreserved = jaccardSimilarity > 0.65;

  // Estimate AI detection (would call actual analyzer in production)
  // For now, use simple heuristics
  const hasContractions = /\b(don't|can't|won't|it's|we're|they're|i'm|haven't|doesn't|isn't|aren't|wasn't|weren't|won't|wouldn't|shouldn't|couldn't|mightn't)\b/i.test(humanized);
  const hasCasualMarkers = /\b(honestly|look|basically|you know|right|really|actually|the thing is|seriously|literally)\b/i.test(humanized);
  const aiPhraseCount = (humanized.match(/\b(moreover|furthermore|delve into|in today's digital age|it is important to note|plays a crucial role)\b/gi) || []).length;

  const aiDetectionScore = Math.max(0, 100 - (hasContractions ? 20 : 0) - (hasCasualMarkers ? 20 : 0) - (aiPhraseCount * 10));

  return {
    isValid: meaningPreserved && aiDetectionScore < 30,
    meaningPreserved,
    aiDetectionScore,
    needsRefinement: aiDetectionScore > 35
  };
}

/**
 * Iterative humanization with refinement
 */
export async function iterativeHumanization(text: string, options: HumanizationOptions, maxIterations: number = 3): Promise<{
  finalText: string;
  iterations: number;
  initialScore: number;
  finalScore: number;
  changesApplied: string[];
  confidence: 'UNDETECTABLE' | 'LOW_RISK' | 'MODERATE_RISK';
}> {
  let currentText = text;
  let iteration = 0;
  const changesApplied: string[] = [];

  // Initial score
  const initialWords = (text.match(/\b\w+\b/g) || []).length;
  const initialScore = 50; // Placeholder

  for (iteration = 0; iteration < maxIterations; iteration++) {
    // Apply humanization
    const humanized = await multiPassHumanization(currentText, options);

    // Validate
    const validation = await postProcessingValidation(text, humanized, options);

    if (validation.isValid) {
      return {
        finalText: humanized,
        iterations: iteration + 1,
        initialScore,
        finalScore: validation.aiDetectionScore,
        changesApplied,
        confidence: validation.aiDetectionScore < 20 ? 'UNDETECTABLE' : 'LOW_RISK'
      };
    }

    if (!validation.needsRefinement) {
      return {
        finalText: humanized,
        iterations: iteration + 1,
        initialScore,
        finalScore: validation.aiDetectionScore,
        changesApplied,
        confidence: validation.aiDetectionScore < 35 ? 'LOW_RISK' : 'MODERATE_RISK'
      };
    }

    // Continue iterating with increased intensity
    currentText = humanized;
    changesApplied.push(`Iteration ${iteration + 1}: Applied ${options.intensity} humanization`);

    // Increase intensity for next iteration
    if (options.intensity === 'light') {
      options.intensity = 'medium';
    } else if (options.intensity === 'medium') {
      options.intensity = 'aggressive';
    }
  }

  // Return best result
  const finalValidation = await postProcessingValidation(text, currentText, options);

  return {
    finalText: currentText,
    iterations: maxIterations,
    initialScore,
    finalScore: finalValidation.aiDetectionScore,
    changesApplied,
    confidence: finalValidation.aiDetectionScore < 35 ? 'LOW_RISK' : 'MODERATE_RISK'
  };
}
