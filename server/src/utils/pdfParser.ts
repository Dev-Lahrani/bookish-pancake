import * as fs from 'fs';
import * as path from 'path';

/**
 * PDF Parser Utility
 * Handles extraction of text from PDF files
 * Falls back to simple buffer reading if pdf-parse is not available
 */

export interface ParsedPDFContent {
  text: string;
  pageCount: number;
  fileName: string;
  fileSize: number;
  extractedAt: string;
  confidence: number;
}

/**
 * Extract text from PDF file
 * Uses a simple fallback approach if pdf-parse library is not available
 */
export async function extractTextFromPDF(filePath: string): Promise<ParsedPDFContent> {
  try {
    // Validate file exists and is readable
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    if (stats.size > 50 * 1024 * 1024) {
      // 50MB limit
      throw new Error('File size exceeds 50MB limit');
    }

    const fileName = path.basename(filePath);

    // Try to use pdf-parse if available
    try {
      // Dynamic import to avoid hard dependency
      // @ts-ignore - pdf-parse is optional
      const pdfParse = await import('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse.default(dataBuffer);

      // Extract and clean text
      let extractedText = '';
      if (data.text) {
        extractedText = data.text;
      } else if (data.version) {
        // Fallback: combine page texts
        extractedText = data.pages
          ?.map((page: any) => page.text || '')
          .join('\n') || '';
      }

      return {
        text: cleanExtractedText(extractedText),
        pageCount: data.numpages || 1,
        fileName,
        fileSize: stats.size,
        extractedAt: new Date().toISOString(),
        confidence: 0.95, // High confidence with pdf-parse
      };
    } catch (pdfParseError) {
      // Fallback: Extract text from PDF using a simple approach
      return extractTextFallback(filePath, fileName, stats.size);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fallback text extraction from PDF
 * Attempts to extract readable text from PDF binary content
 */
function extractTextFallback(filePath: string, fileName: string, fileSize: number): ParsedPDFContent {
  try {
    const buffer = fs.readFileSync(filePath);
    let extractedText = '';

    // Simple regex-based text extraction from PDF
    // PDFs often have text between certain markers
    const pdfContent = buffer.toString('binary');

    // Extract text between stream markers (common in PDFs)
    const streamRegex = /BT\s*(.*?)\s*ET/gs;
    const matches = pdfContent.match(streamRegex);

    if (matches) {
      matches.forEach((match) => {
        // Extract text between Tj and Td operators
        const textRegex = /\((.*?)\)\s*Tj/g;
        let textMatch;
        while ((textMatch = textRegex.exec(match)) !== null) {
          extractedText += textMatch[1] + ' ';
        }
      });
    }

    // Also try to extract text using simple UTF-8 filtering
    if (!extractedText || extractedText.length < 10) {
      extractedText = buffer
        .toString('utf8', 0, Math.min(buffer.length, 1000000))
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\s+/g, ' ');
    }

    return {
      text: cleanExtractedText(extractedText),
      pageCount: Math.ceil(fileSize / 4096), // Rough estimate
      fileName,
      fileSize,
      extractedAt: new Date().toISOString(),
      confidence: 0.6, // Lower confidence with fallback method
    };
  } catch (error) {
    throw new Error('Failed to extract text from PDF using fallback method');
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
    .trim()
    .substring(0, 50000); // Limit to 50K characters
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const allowedMimeTypes = [
    'application/pdf',
    'application/octet-stream', // Some systems report PDFs this way
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return { valid: false, error: `Invalid file type. Expected PDF, got ${file.mimetype}` };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Maximum size is 50MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB` };
  }

  if (file.size < 100) {
    return { valid: false, error: 'File too small or corrupted' };
  }

  return { valid: true };
}

/**
 * Extract metadata from PDF
 */
export function extractPDFMetadata(filePath: string): Record<string, any> {
  try {
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    const ext = path.extname(filePath);

    return {
      fileName,
      fileSize: stats.size,
      fileSizeFormatted: formatFileSize(stats.size),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      extension: ext,
      isValid: ext.toLowerCase() === '.pdf',
    };
  } catch (error) {
    return { error: 'Failed to extract metadata' };
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
