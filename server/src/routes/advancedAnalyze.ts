/**
 * Advanced Analysis Route
 * Provides enterprise-grade AI detection analysis
 */

import { Router, Request, Response } from 'express';
import { generateComprehensiveDetectionReport } from '../utils/advancedAnalyzer';
import { AdvancedAnalysisResult } from '@shared/types';

const router = Router();

/**
 * POST /api/analyze-advanced
 * Comprehensive multi-layer AI detection analysis
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 50,000 characters' });
    }

    console.log(`[Advanced Analysis] Analyzing ${text.length} characters`);

    // Run comprehensive analysis
    const report = generateComprehensiveDetectionReport(text);

    const result: AdvancedAnalysisResult = {
      overallScore: report.overallScore,
      confidence: report.confidence,
      riskLevel: report.riskLevel,
      allMetrics: report.allMetrics,
      evidenceHighlights: report.evidenceHighlights,
      recommendations: report.recommendations
    };

    console.log(`[Advanced Analysis] Complete - Score: ${result.overallScore}, Risk: ${result.riskLevel}`);

    return res.json(result);
  } catch (error: any) {
    console.error('[Advanced Analysis] Error:', error);
    return res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

export default router;
