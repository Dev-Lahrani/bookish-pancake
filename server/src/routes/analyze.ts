/**
 * API Routes for Text Analysis
 */

import express, { Request, Response } from 'express';
import {
  analyzeText,
  findSuspiciousSections,
  generateRecommendations
} from '../utils/analyzer';
import { AnalyzeRequest, AnalyzeResponse } from '../../../shared/src/types';
import { analyzeWithAI } from '../services/aiService';

const router = express.Router();

/**
 * POST /api/analyze
 * Analyze text for AI-generated content detection
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text }: AnalyzeRequest = req.body;
    
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
    
    // Perform analysis
    const { metrics, detectedPatterns } = analyzeText(text);
    
    // Find suspicious sections
    const suspiciousSections = findSuspiciousSections(text, metrics);
    
    // Generate recommendations
    const recommendations = generateRecommendations(metrics, detectedPatterns);
    
    // Calculate overall AI detection score
    // Weighted combination of metrics
    const overallScore = Math.round(
      metrics.sentenceUniformity * 0.20 +
      metrics.perplexity * 0.15 +
      metrics.burstiness * 0.20 +
      Math.min(metrics.aiPhraseCount * 5, 100) * 0.25 +
      metrics.vocabularyDiversity * 0.10 +
      (metrics.readabilityScore > 50 ? 20 : 0) * 0.10
    );
    
    // Optional: Get AI analysis if API is available
    let aiAnalysis;
    try {
      aiAnalysis = await analyzeWithAI(text);
      // Blend AI analysis with rule-based score
      const finalScore = Math.round(overallScore * 0.7 + aiAnalysis.aiLikelihood * 0.3);
      
      const response: AnalyzeResponse = {
        overallScore: Math.min(100, Math.max(0, finalScore)),
        metrics,
        suspiciousSections,
        detectedPatterns,
        recommendations: [
          ...recommendations,
          aiAnalysis.confidence > 50 ? `AI Analysis: ${aiAnalysis.reasoning}` : ''
        ].filter(Boolean)
      };
      
      return res.json(response);
    } catch (error) {
      // If AI analysis fails, just use rule-based score
      const response: AnalyzeResponse = {
        overallScore: Math.min(100, Math.max(0, overallScore)),
        metrics,
        suspiciousSections,
        detectedPatterns,
        recommendations
      };
      
      return res.json(response);
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    return res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message 
    });
  }
});

export default router;
