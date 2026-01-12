/**
 * API Routes for Text Humanization
 */

import express, { Request, Response } from 'express';
import { HumanizeRequest, HumanizeResponse } from '../../../shared/src/types';
import {
  buildHumanizationPrompt,
  compareTexts,
  detectRemovedPatterns,
  countSentenceVariations,
  validateHumanizedText
} from '../utils/humanizer';
import { humanizeWithAI } from '../services/aiService';
import { detectAIPhrases } from '../utils/analyzer';

const router = express.Router();

/**
 * POST /api/humanize
 * Humanize AI-generated text
 */
router.post('/humanize', async (req: Request, res: Response) => {
  try {
    const { text, options }: HumanizeRequest = req.body;
    
    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }
    
    if (text.trim().length < 50) {
      return res.status(400).json({ error: 'Text must be at least 50 characters long' });
    }
    
    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text must be less than 50,000 characters' });
    }
    
    if (!options) {
      return res.status(400).json({ error: 'Options are required' });
    }
    
    // Validate options
    const validTones = ['casual', 'professional', 'academic', 'creative'];
    const validIntensities = ['light', 'medium', 'aggressive'];
    
    if (!validTones.includes(options.tone)) {
      return res.status(400).json({ error: 'Invalid tone. Must be: casual, professional, academic, or creative' });
    }
    
    if (!validIntensities.includes(options.intensity)) {
      return res.status(400).json({ error: 'Invalid intensity. Must be: light, medium, or aggressive' });
    }
    
    // Build humanization prompt
    const prompt = buildHumanizationPrompt(text, options);
    
    // Call AI service to humanize
    const humanizedText = await humanizeWithAI(text, prompt);
    
    // Validate the humanized text
    const validation = validateHumanizedText(text, humanizedText);
    if (!validation.isValid) {
      return res.status(500).json({ 
        error: 'Humanization quality check failed', 
        reason: validation.reason 
      });
    }
    
    // Compare texts and calculate statistics
    const comparison = compareTexts(text, humanizedText);
    const patternsRemoved = detectRemovedPatterns(text, humanizedText);
    const sentenceVariations = countSentenceVariations(text, humanizedText);
    
    // Count AI phrases in original vs humanized
    const originalAIPhrases = detectAIPhrases(text);
    const humanizedAIPhrases = detectAIPhrases(humanizedText);
    const aiPhrasesRemoved = originalAIPhrases.length - humanizedAIPhrases.length;
    
    // Build response
    const response: HumanizeResponse = {
      humanizedText,
      changesCount: comparison.changesCount,
      patternsRemoved,
      statistics: {
        wordsChanged: comparison.wordsChanged,
        sentenceVariations,
        aiPhrasesRemoved: Math.max(0, aiPhrasesRemoved)
      }
    };
    
    return res.json(response);
  } catch (error: any) {
    console.error('Humanization error:', error);
    
    // Check if it's an API key error
    if (error.message.includes('API key')) {
      return res.status(503).json({ 
        error: 'AI service unavailable', 
        details: 'Please configure OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file'
      });
    }
    
    return res.status(500).json({ 
      error: 'Humanization failed', 
      details: error.message 
    });
  }
});

export default router;
