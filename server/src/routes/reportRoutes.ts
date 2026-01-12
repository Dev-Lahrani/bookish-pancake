/**
 * PDF Report Download Route
 * Generates and serves comprehensive PDF reports
 */

import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { createReportData, saveHTMLReport } from '../utils/reportGenerator';
import { sendErrorResponse, sendSuccessResponse } from '../utils/errorHandler';

const router = Router();

/**
 * POST /api/generate-report
 * Generate comprehensive report from analysis
 */
router.post('/generate-report', async (req: Request, res: Response) => {
  try {
    const { analysisResults, sourceText, fileName } = req.body;

    // Validate required fields
    if (!analysisResults) {
      return sendErrorResponse(res, 400, 'Analysis results are required', 'MISSING_DATA');
    }

    if (!sourceText || sourceText.length < 10) {
      return sendErrorResponse(res, 400, 'Source text is required', 'MISSING_DATA');
    }

    // Create report data
    const reportData = createReportData(analysisResults, sourceText, fileName);

    // Save HTML report
    const reportPath = saveHTMLReport(reportData);

    // Read the generated report
    const htmlContent = fs.readFileSync(reportPath, 'utf8');

    return sendSuccessResponse(res, {
      success: true,
      message: 'Report generated successfully',
      reportPath,
      htmlContent, // Send HTML that can be converted to PDF on client
      fileName: path.basename(reportPath)
    });
  } catch (error: any) {
    return sendErrorResponse(
      res,
      500,
      error.message || 'Failed to generate report',
      'REPORT_GENERATION_ERROR'
    );
  }
});

/**
 * GET /api/reports/:fileName
 * Download a previously generated report
 */
router.get('/reports/:fileName', (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const reportsDir = './reports';

    // Validate filename (prevent directory traversal)
    if (fileName.includes('..') || fileName.includes('/')) {
      return sendErrorResponse(res, 400, 'Invalid file name', 'INVALID_FILE');
    }

    const filePath = path.join(reportsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return sendErrorResponse(res, 404, 'Report not found', 'NOT_FOUND');
    }

    // Send file
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.send(fileContent);
  } catch (error: any) {
    return sendErrorResponse(
      res,
      500,
      error.message || 'Failed to download report',
      'DOWNLOAD_ERROR'
    );
  }
});

/**
 * GET /api/reports
 * List all available reports
 */
router.get('/reports', (req: Request, res: Response) => {
  try {
    const reportsDir = './reports';

    if (!fs.existsSync(reportsDir)) {
      return sendSuccessResponse(res, { reports: [], total: 0 });
    }

    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return sendSuccessResponse(res, {
      reports: files,
      total: files.length
    });
  } catch (error: any) {
    return sendErrorResponse(
      res,
      500,
      error.message || 'Failed to list reports',
      'LIST_ERROR'
    );
  }
});

/**
 * DELETE /api/reports/:fileName
 * Delete a report
 */
router.delete('/reports/:fileName', (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const reportsDir = './reports';

    // Validate filename
    if (fileName.includes('..') || fileName.includes('/')) {
      return sendErrorResponse(res, 400, 'Invalid file name', 'INVALID_FILE');
    }

    const filePath = path.join(reportsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return sendErrorResponse(res, 404, 'Report not found', 'NOT_FOUND');
    }

    // Delete file
    fs.unlinkSync(filePath);

    return sendSuccessResponse(res, { message: 'Report deleted successfully' });
  } catch (error: any) {
    return sendErrorResponse(
      res,
      500,
      error.message || 'Failed to delete report',
      'DELETE_ERROR'
    );
  }
});

export default router;
