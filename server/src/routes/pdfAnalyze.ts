import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { sendErrorResponse, sendSuccessResponse, classifyError } from '../utils/errorHandler';
import { extractTextFromPDF, validatePDFFile, extractPDFMetadata } from '../utils/pdfParser';
import { generateComprehensiveDetectionReport } from '../utils/advancedAnalyzer';
import { historyManager } from '../utils/historyManager';

const router = Router();

/**
 * POST /api/analyze-pdf
 * Upload and analyze PDF for plagiarism
 */
router.post('/analyze-pdf', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check if file exists in request
    const file = (req as any).file;
    if (!file) {
      return sendErrorResponse(res, 400, 'No file provided', 'NO_FILE');
    }

    // Validate PDF file
    const validation = validatePDFFile(file as Express.Multer.File);
    if (!validation.valid) {
      return sendErrorResponse(res, 400, validation.error || 'Invalid file', 'INVALID_FILE');
    }

    // Extract metadata
    const metadata = extractPDFMetadata(file.path);

    // Extract text from PDF
    const pdfContent = await extractTextFromPDF(file.path);

    // Perform plagiarism analysis
    const analysisResults = await generateComprehensiveDetectionReport(pdfContent.text);

    // Save to history
    const duration = Date.now() - startTime;
    historyManager.saveAnalysis({
      type: 'pdf',
      fileName: pdfContent.fileName,
      originalText: pdfContent.text,
      analysisResults,
      timestamp: new Date().toISOString(),
      duration,
      ipAddress: req.ip,
    });

    // Clean up uploaded file
    try {
      fs.unlinkSync(file.path);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Return results
    return sendSuccessResponse(res, {
      fileName: pdfContent.fileName,
      pageCount: pdfContent.pageCount,
      textExtracted: pdfContent.text.substring(0, 100) + '...',
      extractionConfidence: pdfContent.confidence,
      analysisResults,
      processingTime: `${duration}ms`,
      metadata,
    });
  } catch (error) {
    const { statusCode, code, message } = classifyError(error);
    return sendErrorResponse(res, statusCode, message, code);
  }
});


/**
 * POST /api/batch-analyze
 * Analyze multiple texts in batch
 */
router.post('/batch-analyze', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { texts } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return sendErrorResponse(res, 400, 'Texts array is required and must not be empty', 'INVALID_INPUT');
    }

    if (texts.length > 10) {
      return sendErrorResponse(res, 400, 'Maximum 10 texts allowed per batch', 'BATCH_SIZE_EXCEEDED');
    }

    // Analyze each text
    const results = await Promise.all(
      texts.map(async (text, index) => {
        try {
          if (typeof text !== 'string' || text.trim().length < 10) {
            return {
              index,
              success: false,
              error: 'Text must be at least 10 characters',
            };
          }

          const analysis = await generateComprehensiveDetectionReport(text);

          // Save to history
          historyManager.saveAnalysis({
            type: 'text',
            originalText: text,
            analysisResults: analysis,
            timestamp: new Date().toISOString(),
            duration: 0,
            ipAddress: req.ip,
          });

          return {
            index,
            success: true,
            analysis,
          };
        } catch (err) {
          return {
            index,
            success: false,
            error: (err as Error).message,
          };
        }
      })
    );

    const duration = Date.now() - startTime;

    return sendSuccessResponse(res, {
      totalTexts: texts.length,
      successfulAnalyses: results.filter((r) => r.success).length,
      failedAnalyses: results.filter((r) => !r.success).length,
      results,
      processingTime: `${duration}ms`,
    });
  } catch (error) {
    const { statusCode, code, message } = classifyError(error);
    return sendErrorResponse(res, statusCode, message, code);
  }
});

/**
 * GET /api/history
 * Get analysis history
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const records = historyManager.getAllAnalyses(limit, offset);
    const stats = historyManager.getStatistics();

    return sendSuccessResponse(res, {
      records,
      statistics: stats,
      pagination: { limit, offset },
    });
  } catch (error) {
    const { statusCode, code, message } = classifyError(error);
    return sendErrorResponse(res, statusCode, message, code);
  }
});

/**
 * GET /api/history/:id
 * Get specific analysis by ID
 */
router.get('/history/:id', (req: Request, res: Response) => {
  try {
    const record = historyManager.getAnalysis(req.params.id);

    if (!record) {
      return sendErrorResponse(res, 404, 'Analysis not found', 'NOT_FOUND');
    }

    return sendSuccessResponse(res, record);
  } catch (error) {
    const { statusCode, code, message } = classifyError(error);
    return sendErrorResponse(res, statusCode, message, code);
  }
});

/**
 * DELETE /api/history/:id
 * Delete analysis by ID
 */
router.delete('/history/:id', (req: Request, res: Response) => {
  try {
    const success = historyManager.deleteAnalysis(req.params.id);

    if (!success) {
      return sendErrorResponse(res, 500, 'Failed to delete analysis', 'DELETE_FAILED');
    }

    return sendSuccessResponse(res, { message: 'Analysis deleted successfully' });
  } catch (error) {
    const { statusCode, code, message } = classifyError(error);
    return sendErrorResponse(res, statusCode, message, code);
  }
});

/**
 * GET /api/statistics
 * Get usage statistics
 */
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const stats = historyManager.getStatistics();
    return sendSuccessResponse(res, stats);
  } catch (error) {
    const { statusCode, code, message } = classifyError(error);
    return sendErrorResponse(res, statusCode, message, code);
  }
});

export default router;
