/**
 * Text Humanization Utilities
 * Builds prompts and processes text to make AI-generated content sound more human
 */

import { HumanizationOptions } from '@shared/types';

/**
 * Build a detailed humanization prompt for AI API
 * @param text - Text to humanize
 * @param options - Humanization options
 * @returns Formatted prompt string
 */
export function buildHumanizationPrompt(text: string, options: HumanizationOptions): string {
  const toneInstructions = getToneInstructions(options.tone);
  const intensityInstructions = getIntensityInstructions(options.intensity);
  
  const prompt = `Rewrite the following text to sound naturally human-written while maintaining its core message and information.

CRITICAL REQUIREMENTS:
1. Add natural imperfections:
   - Use contractions (it's, don't, can't, etc.)
   - Include casual transitions and fillers where appropriate
   - Vary punctuation naturally (mix commas, dashes, semicolons)
   - Allow for minor grammatical variations

2. Dramatically vary sentence structure:
   - Mix very short sentences (3-5 words) with long, complex ones (25+ words)
   - Use different sentence types (declarative, interrogative, exclamatory)
   - Start sentences differently (avoid repetitive patterns)
   - Create uneven paragraph lengths

3. Remove AI-typical phrases and replace with natural alternatives:
   - Replace "it's important to note that" → use direct statements
   - Replace "delve into" → use "explore", "look at", "examine"
   - Remove "furthermore", "moreover" → use simpler transitions
   - Avoid "realm of", "landscape of", "tapestry" metaphors
   - Remove "in today's digital age" and similar clichés

4. Add unexpected elements:
   - Use surprising word choices occasionally
   - Include brief examples or analogies
   - Add rhetorical questions where appropriate
   - Use active voice predominantly

5. Tone and Style (${options.tone}):
${toneInstructions}

6. Humanization Intensity (${options.intensity}):
${intensityInstructions}

${options.preserveTechnical ? '7. PRESERVE all technical terms, jargon, and specialized vocabulary exactly as written.\n' : ''}
${options.addPersonalTouches ? '8. ADD brief personal touches like "I think", "in my experience", or casual observations where natural.\n' : ''}

IMPORTANT: 
- DO NOT add explanations or meta-commentary
- DO NOT use phrases like "Here's the rewritten version"
- ONLY return the humanized text itself
- Ensure the rewritten text is substantially different from the original
- Maintain all factual information and key points

Original text to humanize:

${text}`;

  return prompt;
}

/**
 * Get tone-specific instructions
 * @param tone - Target tone
 * @returns Instruction string
 */
function getToneInstructions(tone: string): string {
  switch (tone) {
    case 'casual':
      return `   - Use conversational language and informal expressions
   - Include colloquialisms and everyday phrases
   - Write as if talking to a friend
   - Use "you" to address the reader directly
   - Keep it relaxed and approachable`;
    
    case 'professional':
      return `   - Maintain professional vocabulary
   - Use clear, direct business language
   - Keep formality balanced (not too stiff)
   - Focus on clarity and precision
   - Avoid overly casual expressions`;
    
    case 'academic':
      return `   - Use scholarly tone but avoid excessive formality
   - Include analytical language where appropriate
   - Maintain intellectual rigor
   - Use discipline-appropriate terminology
   - Balance formality with readability`;
    
    case 'creative':
      return `   - Use vivid, descriptive language
   - Include metaphors and creative comparisons (but not AI clichés)
   - Vary rhythm and pacing dramatically
   - Use sensory details
   - Make it engaging and imaginative`;
    
    default:
      return '   - Use natural, balanced language';
  }
}

/**
 * Get intensity-specific instructions
 * @param intensity - Humanization intensity level
 * @returns Instruction string
 */
function getIntensityInstructions(intensity: string): string {
  switch (intensity) {
    case 'light':
      return `   - Make minimal changes to structure
   - Focus primarily on removing obvious AI phrases
   - Keep most sentences similar to original
   - Change 20-30% of the text
   - Maintain original flow mostly intact`;
    
    case 'medium':
      return `   - Moderate restructuring of sentences
   - Add noticeable personality and variation
   - Change sentence patterns significantly
   - Change 40-60% of the text
   - Balance preservation with transformation`;
    
    case 'aggressive':
      return `   - Extensively rewrite and restructure
   - Maximum humanization and personality
   - Completely rework sentence patterns
   - Change 70-90% of the text
   - Prioritize human-like quality over similarity`;
    
    default:
      return '   - Apply moderate humanization';
  }
}

/**
 * Calculate the difference between two texts
 * @param original - Original text
 * @param humanized - Humanized text
 * @returns Statistics about changes
 */
export function compareTexts(original: string, humanized: string): {
  wordsChanged: number;
  changesCount: number;
  changePercentage: number;
} {
  const originalWords = original.toLowerCase().split(/\s+/);
  const humanizedWords = humanized.toLowerCase().split(/\s+/);
  
  // Simple word-level comparison
  let changedWords = 0;
  const maxLength = Math.max(originalWords.length, humanizedWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (originalWords[i] !== humanizedWords[i]) {
      changedWords++;
    }
  }
  
  const changePercentage = (changedWords / originalWords.length) * 100;
  
  return {
    wordsChanged: changedWords,
    changesCount: Math.abs(humanizedWords.length - originalWords.length),
    changePercentage: Math.round(changePercentage)
  };
}

/**
 * Detect which AI patterns were removed
 * @param original - Original text
 * @param humanized - Humanized text
 * @returns Array of removed patterns
 */
export function detectRemovedPatterns(original: string, humanized: string): string[] {
  const AI_PATTERNS = [
    'it\'s important to note',
    'it is important to note',
    'delve into',
    'furthermore',
    'moreover',
    'additionally',
    'in today\'s digital age',
    'in conclusion',
    'it\'s worth noting',
    'the realm of',
    'the landscape of',
    'tapestry',
    'myriad',
    'plethora',
    'navigate the complexities',
    'shed light on',
    'paramount importance'
  ];
  
  const removed: string[] = [];
  const originalLower = original.toLowerCase();
  const humanizedLower = humanized.toLowerCase();
  
  for (const pattern of AI_PATTERNS) {
    const inOriginal = originalLower.includes(pattern);
    const inHumanized = humanizedLower.includes(pattern);
    
    if (inOriginal && !inHumanized) {
      removed.push(pattern);
    }
  }
  
  return removed;
}

/**
 * Count sentence variations added
 * @param original - Original text
 * @param humanized - Humanized text
 * @returns Number of variations
 */
export function countSentenceVariations(original: string, humanized: string): number {
  const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Calculate length variety in original vs humanized
  const originalLengths = originalSentences.map(s => s.split(/\s+/).length);
  const humanizedLengths = humanizedSentences.map(s => s.split(/\s+/).length);
  
  const originalVariety = Math.max(...originalLengths) - Math.min(...originalLengths);
  const humanizedVariety = Math.max(...humanizedLengths) - Math.min(...humanizedLengths);
  
  // Return the increase in variety
  return Math.max(0, humanizedVariety - originalVariety);
}

/**
 * Validate humanized text quality
 * @param original - Original text
 * @param humanized - Humanized text
 * @returns Validation result
 */
export function validateHumanizedText(original: string, humanized: string): {
  isValid: boolean;
  reason?: string;
} {
  // Check if text was actually changed
  if (original === humanized) {
    return { isValid: false, reason: 'Text was not modified' };
  }
  
  // Check if humanized text is too short
  if (humanized.length < original.length * 0.5) {
    return { isValid: false, reason: 'Humanized text is too short' };
  }
  
  // Check if humanized text is suspiciously long
  if (humanized.length > original.length * 2) {
    return { isValid: false, reason: 'Humanized text is too long' };
  }
  
  // Check for minimum changes
  const { changePercentage } = compareTexts(original, humanized);
  
  // For very short texts, be more lenient
  const minChangeRequired = original.length < 100 ? 5 : 8;
  
  if (changePercentage < minChangeRequired) {
    return { isValid: false, reason: `Not enough changes made (${changePercentage.toFixed(1)}% < ${minChangeRequired}%)` };
  }
  
  return { isValid: true };
}

/**
 * Local fallback humanizer - works without API calls
 * Applies text transformations to make AI-generated text more human-like
 * @param text - Text to humanize
 * @param options - Humanization options
 * @returns Humanized text
 */
export function localHumanize(text: string, options: HumanizationOptions): string {
  let result = text;
  const intensity = options.intensity === 'aggressive' ? 3 : options.intensity === 'medium' ? 2 : 1;
  
  // Phase 1: Replace common AI phrases
  const aiPhrases: { [key: string]: string[] } = {
    "it's important to note that": ["note that", "it's worth noting"],
    "in today's digital age": ["nowadays", "these days", "in modern times"],
    "the landscape of": ["the world of", "in"],
    "realm of": ["world of", "area of"],
    "furthermore": ["also", "plus"],
    "moreover": ["additionally", "also"],
    "delve into": ["explore", "look at"],
    "significantly": ["a lot", "greatly"],
    "indicates that": ["shows", "means"],
    "utilizes": ["uses"],
    "utilize": ["use"],
    "facilitate": ["help with", "enable"],
  };
  
  for (const [phrase, replacements] of Object.entries(aiPhrases)) {
    const regex = new RegExp(phrase, 'gi');
    if (regex.test(result)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(regex, replacement);
    }
  }
  
  // Phase 2: Add contractions
  result = result.replace(/ is not /gi, " isn't ");
  result = result.replace(/ do not /gi, " don't ");
  result = result.replace(/ does not /gi, " doesn't ");
  result = result.replace(/ can not /gi, " can't ");
  result = result.replace(/ will not /gi, " won't ");
  result = result.replace(/ have not /gi, " haven't ");
  result = result.replace(/ it is /gi, " it's ");
  result = result.replace(/ that is /gi, " that's ");
  result = result.replace(/ we have /gi, " we've ");
  
  // Phase 3: Break up long sentences and add variety
  if (intensity >= 2) {
    const sentences = result.split(/([.!?])\s+/);
    let modified: string[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      let sentence = sentences[i].trim();
      
      if (sentence.length > 20) {
        // Randomly add transition words at start
        if (Math.random() > 0.5) {
          const transitions = ["Well, ", "Look, ", "Actually, ", "Honestly, ", "You see, "];
          sentence = transitions[Math.floor(Math.random() * transitions.length)] + sentence;
        }
        
        // Sometimes move adverbs around
        if (Math.random() > 0.6) {
          sentence = sentence.replace(/^(([A-Z][a-z]+\s)+)/, (match) => {
            const words = match.trim().split(' ');
            if (words.length > 2) {
              return words.slice(1).join(' ') + ' ' + words[0] + ', ';
            }
            return match;
          });
        }
      }
      
      modified.push(sentence);
      if (i + 1 < sentences.length) {
        modified.push(sentences[i + 1]);
      }
    }
    
    result = modified.join(' ').replace(/\s+/g, ' ').trim();
  }
  
  // Phase 4: Add personality markers for aggressive mode
  if (intensity === 3 && options.addPersonalTouches) {
    const sentences = result.split(/([.!?])\s+/);
    if (sentences.length > 4) {
      const personality = [" Personally, I think ", " In my opinion, ", " What I've found is that "];
      const randomPersonality = personality[Math.floor(Math.random() * personality.length)];
      const insertPoint = Math.floor(sentences.length / 3);
      sentences.splice(insertPoint, 0, randomPersonality);
      result = sentences.join(' ').replace(/\s+/g, ' ').trim();
    }
  }
  
  return result;
}
