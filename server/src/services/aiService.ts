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
    openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    anthropic = process.env.ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : null;
    
    initialized = true;
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
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at rewriting AI-generated text to sound naturally human. Follow the instructions precisely and only return the rewritten text without any explanations or meta-commentary.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.9, // Higher temperature for more variation
    max_tokens: 4000,
    presence_penalty: 0.6, // Encourage diverse language
    frequency_penalty: 0.3 // Reduce repetition
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
        model: 'gpt-4-turbo',
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
