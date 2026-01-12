/**
 * Advanced Humanization Route
 * Provides iterative anti-detection humanization
 */

import { Router, Request, Response } from 'express';
import { iterativeHumanization } from '../utils/advancedHumanizer';
import { generateComprehensiveDetectionReport } from '../utils/advancedAnalyzer';
import { HumanizationOptions, AdvancedHumanizationResult } from '@shared/types';

const router = Router();

/**
 * POST /api/humanize-advanced
 * Advanced humanization with iterative refinement and AI detection scoring
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, options } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!options || typeof options !== 'object') {
      return res.status(400).json({ error: 'Options are required' });
    }

    if (text.length > 50000) {
      return res.status(400).json({ error: 'Text exceeds maximum length of 50,000 characters' });
    }

    console.log(`[Advanced Humanizer] Starting humanization - ${text.length} chars, intensity: ${options.intensity}`);

    // Run iterative humanization
    const result = await iterativeHumanization(text, options as HumanizationOptions);

    // Run advanced analysis on final result to get AI score
    const finalAnalysis = generateComprehensiveDetectionReport(result.finalText);

    const response: AdvancedHumanizationResult & { detectionAfterHumanization: number } = {
      ...result,
      detectionAfterHumanization: finalAnalysis.overallScore
    };

    console.log(`[Advanced Humanizer] Complete - Iterations: ${result.iterations}, Final AI Score: ${response.detectionAfterHumanization}`);

    return res.json(response);
  } catch (error: any) {
    console.error('[Advanced Humanizer] Error:', error);
    return res.status(500).json({
      error: 'Humanization failed',
      message: error.message
    });
  }
});

export default router;
