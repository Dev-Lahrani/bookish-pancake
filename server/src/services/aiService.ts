/**
 * AI Service Integration
 * Handles communication with OpenAI and Anthropic APIs
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { localHumanize } from '../utils/humanizer';

// Lazy initialize clients to ensure env vars are loaded
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;
let initialized = false;

function initializeClients() {
  if (!initialized) {
    // Only initialize OpenAI if key is valid (not placeholder)
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && !openaiKey.includes('your_') && openaiKey.length > 10) {
      try {
        openai = new OpenAI({ apiKey: openaiKey });
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error);
        openai = null;
      }
    }

    // Only initialize Anthropic if key is valid (not placeholder)
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey && !anthropicKey.includes('your_') && anthropicKey.length > 10) {
      try {
        anthropic = new Anthropic({ apiKey: anthropicKey });
      } catch (error) {
        console.error('Failed to initialize Anthropic:', error);
        anthropic = null;
      }
    }
    
    initialized = true;
    console.log(`[AI Service] OpenAI: ${openai ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`[AI Service] Anthropic: ${anthropic ? '✓ Configured' : '✗ Not configured'}`);
  }
}

/**
 * Determine which AI service to use
 * Prefer Anthropic first as it may be more responsive
 */
function getAvailableService(): 'openai' | 'anthropic' | null {
  initializeClients();
  if (anthropic) return 'anthropic';
  if (openai) return 'openai';
  return null;
}

/**
 * Humanize text using AI API with timeout and fallback
 * @param text - Text to humanize
 * @param prompt - Full humanization prompt
 * @param options - Humanization options
 * @returns Humanized text
 */
export async function humanizeWithAI(
  text: string,
  prompt: string,
  options?: any
): Promise<string> {
  const service = getAvailableService();
  
  // If no API service, use local humanizer
  if (!service) {
    console.log('Using local humanizer (no API keys configured)');
    return localHumanize(text, options || { tone: 'professional', intensity: 'medium' });
  }
  
  try {
    // Add timeout of 30 seconds
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('API request timeout after 30 seconds')), 30000);
    });
    
    const apiPromise =
      service === 'openai'
        ? humanizeWithOpenAI(prompt)
        : humanizeWithAnthropic(prompt);
    
    return await Promise.race([apiPromise, timeoutPromise]);
  } catch (error: any) {
    console.error('AI humanization error:', error);
    
    // Fallback to local humanizer on API error
    console.log('Falling back to local humanizer due to API error');
    return localHumanize(text, options || { tone: 'professional', intensity: 'medium' });
  }
}

/**
 * Humanize text using OpenAI
 */
async function humanizeWithOpenAI(prompt: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // Using latest GPT-4 model (gpt-4o)
    messages: [
      {
        role: 'system',
        content: `You are a human writer, not an AI. Your task is to completely rewrite text to bypass AI detection tools like GPTZero, Originality.ai, and StealthWriter.

CRITICAL ANTI-AI-DETECTION RULES:
1. NEVER use these AI-typical words/phrases:
   - "delve", "tapestry", "landscape", "realm", "testament", "robust", "leverage", "facilitate"
   - "it's important to note", "it's worth noting", "in conclusion", "in summary"
   - "furthermore", "moreover", "additionally", "consequently"
   - "in today's digital age", "in the modern era", "cutting-edge", "state-of-the-art"

2. ALWAYS use irregular patterns:
   - Mix very short sentences (2-5 words) with very long ones (30+ words)
   - Start sentences differently - avoid patterns
   - Use fragments sometimes. Like this.
   - Add unexpected punctuation — dashes, ellipses...
   - Vary paragraph length wildly (1 sentence vs 6+ sentences)

3. ADD human imperfections:
   - Use contractions constantly (don't, can't, won't, it's)
   - Include casual transitions (but, so, and, now, well)
   - Add filler words occasionally (actually, basically, just, really, kind of)
   - Use rhetorical questions
   - Include brief tangents or asides

4. CHANGE sentence structure completely:
   - Passive to active voice (or vice versa)
   - Break complex sentences into fragments
   - Combine short sentences into complex ones
   - Rearrange information order
   - Use different sentence types (questions, commands, statements)

5. ADD personality:
   - Personal opinions ("I think", "seems to me")
   - Casual observations
   - Unexpected analogies
   - Brief examples from "experience"

ONLY return the rewritten text. No explanations. No meta-commentary. Write like a real human, not an AI trying to sound human.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 1.2, // Maximum variation for creativity
    max_tokens: 4000,
    presence_penalty: 1.0, // Maximum penalty to avoid repetitive topics
    frequency_penalty: 1.0, // Maximum penalty to avoid repetitive words
    top_p: 0.95 // Nucleus sampling for more natural variation
  });
  
  const humanizedText = response.choices[0]?.message?.content?.trim();
  
  if (!humanizedText) {
    throw new Error('No response from OpenAI');
  }
  
  return humanizedText;
}

/**
 * Humanize text using Anthropic Claude
 */
async function humanizeWithAnthropic(prompt: string): Promise<string> {
  if (!anthropic) {
    throw new Error('Anthropic client not initialized');
  }

  const response = await (anthropic as any).messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 4000,
    temperature: 0.9,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic');
  }

  const humanizedText = content.text.trim();

  if (!humanizedText) {
    throw new Error('No response from Anthropic');
  }

  return humanizedText;
}

/**
 * Analyze text with AI for additional insights
 * @param text - Text to analyze
 * @returns AI analysis insights
 */
export async function analyzeWithAI(text: string): Promise<{
  aiLikelihood: number;
  confidence: number;
  reasoning: string;
}> {
  const service = getAvailableService();
  
  if (!service) {
    // Return neutral result if no API available
    return {
      aiLikelihood: 50,
      confidence: 0,
      reasoning: 'AI analysis unavailable - no API key configured'
    };
  }
  
  const analysisPrompt = `Analyze the following text and determine if it was likely written by AI.

Provide your analysis in this exact JSON format:
{
  "aiLikelihood": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<brief explanation>"
}

Text to analyze:
${text}`;
  
  try {
    let response: string;
    
    if (service === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o', // Using latest GPT-4 model (gpt-4o)
        messages: [
          {
            role: 'system',
            content: 'You are an expert at detecting AI-generated text. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      response = completion.choices[0]?.message?.content || '{}';
    } else if (service === 'anthropic' && anthropic) {
      const completion = await (anthropic as any).messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      });
      
      const content = completion.content[0];
      response = content.type === 'text' ? content.text : '{}';
    } else {
      throw new Error('No AI service available');
    }
    
    // Parse JSON response
    const analysis = JSON.parse(response);
    
    return {
      aiLikelihood: analysis.aiLikelihood || 50,
      confidence: analysis.confidence || 50,
      reasoning: analysis.reasoning || 'Unable to analyze'
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      aiLikelihood: 50,
      confidence: 0,
      reasoning: 'Analysis failed'
    };
  }
}
