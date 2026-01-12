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
  
  const prompt = `You're a human writer rewriting this text to completely bypass AI detection (GPTZero, Originality.ai, StealthWriter). Make it 100% undetectable.

🚫 BANNED AI PHRASES - NEVER USE THESE:
delve, tapestry, landscape, realm, testament, robust, leverage, facilitate, streamline, paradigm, synergy, holistic, 
multifaceted, comprehensive, innovative, cutting-edge, state-of-the-art, groundbreaking, revolutionary, game-changing,
it's important to note, it's worth noting, in conclusion, in summary, furthermore, moreover, additionally, consequently,
in today's digital age, in the modern era, the fact that, the reality is, at the end of the day

✅ MANDATORY TECHNIQUES:
1. EXTREME sentence variation:
   - Minimum: 3 very short sentences (2-5 words). Maximum: 2+ very long sentences (35+ words)
   - Mix fragments. Complete thoughts. Run-ons with commas.
   - Start with different words: But, So, And, Now, Well, Actually, Look, Here's the thing
   - Use punctuation variety: periods, dashes — em dashes too, ellipses..., semicolons;

2. ADD human errors/imperfections:
   - Contractions EVERYWHERE (don't, won't, can't, it's, you're, we're, they're, should've, could've)
   - Filler words: actually, basically, really, pretty much, kind of, sort of, just, honestly
   - Casual connectors: but, so, and, anyway, now, well, plus
   - Colloquialisms: stuff, things, a bunch of, tons of, loads of

3. INJECT personality (${options.tone} style):
${toneInstructions}
   - Add opinions: "I think", "seems to me", "in my view", "personally"
   - Brief tangents or asides (in parentheses or with dashes)
   - Rhetorical questions: "What does this mean?", "Why does it matter?"
   - Direct address: "you", "we", "let's"

4. RESTRUCTURE completely:
   - Change word order dramatically
   - Split long sentences → fragments
   - Combine short sentences → complex ones
   - Move ideas around (conclusion first, then explanation)
   - Use different voice: passive ↔ active

5. Intensity Level (${options.intensity}):
${intensityInstructions}

6. VARY paragraph structure:
   - One-sentence paragraphs for impact.
   - Then longer paragraphs with 5-7 sentences that flow together with different structures and ideas building on each other naturally.
   - Mix it up constantly.

${options.preserveTechnical ? '⚠️ PRESERVE technical terms/jargon exactly.\n' : ''}
${options.addPersonalTouches ? '💡 ADD personal touches: brief stories, observations, "in my experience", casual asides.\n' : ''}

📝 CRITICAL:
- Rewrite EVERYTHING - change 80%+ of wording
- Make it sound like a human wrote it casually
- NO AI-typical formal structure
- NO explanations/meta-commentary
- ONLY output the rewritten text

Original text:
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
      return `   - Write like you're texting a friend
   - Use slang, colloquialisms: "stuff", "things", "a bunch of", "tons of", "pretty much"
   - Contractions in EVERY sentence possible
   - Start sentences with: But, So, And, Plus, Also, Anyway
   - Super relaxed: "honestly", "like", "you know", "I mean"
   - Questions to reader: "Right?", "You know what I mean?", "Make sense?"`;
    
    case 'professional':
      return `   - Clear, direct — but still human
   - Use contractions: "we're", "it's", "don't", "won't"
   - Avoid corporate jargon (synergy, leverage, etc.)
   - Short sentences. Then longer explanatory ones.
   - Active voice mostly
   - Personal but professional: "I think", "we've found", "in our experience"`;
    
    case 'academic':
      return `   - Scholarly but readable (not AI-stiff)
   - Use "we" not "it is noted that"
   - Mix complex and simple sentences
   - Contractions okay: "we're", "it's", "don't"
   - Questions for engagement: "What does this mean?", "Why matters?"
   - Direct: "This shows..." not "It can be observed that..."`;
    
    case 'creative':
      return `   - Vivid, punchy language
   - Real metaphors (not AI clichés like "tapestry")
   - Sentence fragments for drama. Like this. Powerful.
   - Sensory words, unexpected comparisons
   - Vary rhythm wildly: short. Medium length. Then something much longer that flows and builds.
   - Make it memorable and engaging`;
    
    default:
      return '   - Natural, conversational, human tone';
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
      return `   - Change 40-50% of text (minimum to bypass detection)
   - Remove all AI-typical phrases
   - Add contractions and casual transitions
   - Mix sentence lengths (short + long)
   - Keep core structure recognizable`;
    
    case 'medium':
      return `   - Change 65-75% of text
   - Completely restructure most sentences
   - Add personality and casual tone
   - Inject filler words and contractions heavily
   - Use fragments and varied punctuation
   - Make it conversational and natural`;
    
    case 'aggressive':
      return `   - Change 85-95% of text (maximum humanization)
   - Completely rewrite - barely recognizable
   - Maximum personality injection
   - Tons of contractions, fillers, casual language
   - Fragments everywhere. Short punchy sentences. Then long rambling ones with commas.
   - Add opinions, questions, asides
   - Write like you're explaining to a friend over coffee`;
    
    default:
      return '   - Apply heavy humanization (70%+ changes)';
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
  
  // Phase 1: AGGRESSIVELY replace AI-typical phrases (expanded list)
  const aiPhrases: { [key: string]: string[] } = {
    "it's important to note that": ["look", "here's the thing", "basically", "check this out"],
    "it is important to note that": ["note", "remember", "here's what matters"],
    "in today's digital age": ["nowadays", "these days", "now", "right now"],
    "in the modern era": ["today", "currently", "now"],
    "the landscape of": ["the world of", "in", "when it comes to"],
    "realm of": ["world of", "area of", "field of"],
    "tapestry of": ["mix of", "combination of", "blend of"],
    "furthermore": ["plus", "also", "and", "on top of that"],
    "moreover": ["also", "plus", "and", "what's more"],
    "additionally": ["also", "plus", "and", "on top of that"],
    "consequently": ["so", "that's why", "because of this"],
    "therefore": ["so", "that's why", "which means"],
    "delve into": ["look at", "check out", "explore", "dig into"],
    "significantly": ["a lot", "really", "pretty much", "way more"],
    "substantially": ["a lot", "really", "way more"],
    "indicates that": ["shows", "means", "tells us"],
    "demonstrates that": ["shows", "proves", "means"],
    "it can be seen that": ["you can see", "clearly"],
    "it is evident that": ["clearly", "obviously", "you can see"],
    "utilizes": ["uses"],
    "utilize": ["use"],
    "facilitate": ["help", "make easier", "allow"],
    "robust": ["strong", "solid", "powerful"],
    "leverage": ["use", "tap into", "make use of"],
    "paradigm": ["model", "approach", "way"],
    "synergy": ["teamwork", "working together"],
    "holistic": ["complete", "whole", "full"],
    "multifaceted": ["complex", "many-sided"],
    "comprehensive": ["complete", "full", "thorough"],
    "innovative": ["new", "fresh", "creative"],
    "cutting-edge": ["latest", "new", "modern"],
    "state-of-the-art": ["latest", "modern", "top-notch"],
    "groundbreaking": ["new", "revolutionary", "game-changing"],
    "at the end of the day": ["basically", "in the end", "ultimately"],
    "the fact that": ["that", ""],
    "in order to": ["to"],
    "due to the fact that": ["because", "since"],
  };
  
  for (const [phrase, replacements] of Object.entries(aiPhrases)) {
    const regex = new RegExp(phrase, 'gi');
    if (regex.test(result)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(regex, replacement);
    }
  }
  
  // Phase 2: Add contractions EVERYWHERE
  result = result.replace(/ is not /gi, " isn't ");
  result = result.replace(/ are not /gi, " aren't ");
  result = result.replace(/ do not /gi, " don't ");
  result = result.replace(/ does not /gi, " doesn't ");
  result = result.replace(/ did not /gi, " didn't ");
  result = result.replace(/ can not /gi, " can't ");
  result = result.replace(/ cannot /gi, " can't ");
  result = result.replace(/ could not /gi, " couldn't ");
  result = result.replace(/ would not /gi, " wouldn't ");
  result = result.replace(/ should not /gi, " shouldn't ");
  result = result.replace(/ will not /gi, " won't ");
  result = result.replace(/ have not /gi, " haven't ");
  result = result.replace(/ has not /gi, " hasn't ");
  result = result.replace(/ had not /gi, " hadn't ");
  result = result.replace(/ it is /gi, " it's ");
  result = result.replace(/ that is /gi, " that's ");
  result = result.replace(/ there is /gi, " there's ");
  result = result.replace(/ what is /gi, " what's ");
  result = result.replace(/ who is /gi, " who's ");
  result = result.replace(/ we are /gi, " we're ");
  result = result.replace(/ they are /gi, " they're ");
  result = result.replace(/ you are /gi, " you're ");
  result = result.replace(/ we have /gi, " we've ");
  result = result.replace(/ they have /gi, " they've ");
  result = result.replace(/ you have /gi, " you've ");
  result = result.replace(/ I have /gi, " I've ");
  result = result.replace(/ I will /gi, " I'll ");
  result = result.replace(/ you will /gi, " you'll ");
  result = result.replace(/ we will /gi, " we'll ");
  
  // Phase 3: Add casual transitions and fillers (intensity-dependent)
  if (intensity >= 2) {
    const sentences = result.split(/([.!?])\s+/);
    let modified: string[] = [];
    
    for (let i = 0; i < sentences.length; i += 2) {
      let sentence = sentences[i].trim();
      
      if (sentence.length > 15) {
        // Add transition words at start (50% chance)
        if (Math.random() > 0.5) {
          const transitions = ["But ", "So ", "And ", "Well, ", "Look, ", "Now, ", "Actually, ", "Honestly, ", "Plus, ", "Anyway, "];
          sentence = transitions[Math.floor(Math.random() * transitions.length)] + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
        
        // Add filler words (30% chance)
        if (Math.random() > 0.7 && intensity >= 3) {
          const fillers = [" really", " actually", " basically", " pretty much", " just", " kind of"];
          const words = sentence.split(' ');
          const insertPos = Math.floor(words.length / 2);
          words.splice(insertPos, 0, fillers[Math.floor(Math.random() * fillers.length)]);
          sentence = words.join(' ');
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
