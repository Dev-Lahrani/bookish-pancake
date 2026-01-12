import * as fs from 'fs';
import * as path from 'path';

/**
 * Analysis History Storage
 * Stores and retrieves analysis results for audit trail and user review
 */

export interface AnalysisRecord {
  id: string;
  type: 'text' | 'pdf';
  fileName?: string;
  originalText: string;
  analysisResults: any;
  humanizedText?: string;
  timestamp: string;
  duration: number; // milliseconds
  userId?: string;
  ipAddress?: string;
}

class HistoryManager {
  private historyDir: string;
  private maxRecords: number = 1000;
  private recordsFile: string;

  constructor(dataDir: string = './data') {
    this.historyDir = path.join(dataDir, 'history');
    this.recordsFile = path.join(this.historyDir, 'records.json');

    // Create directory if it doesn't exist
    if (!fs.existsSync(this.historyDir)) {
      fs.mkdirSync(this.historyDir, { recursive: true });
    }
  }

  /**
   * Save analysis result to history
   */
  saveAnalysis(record: Omit<AnalysisRecord, 'id'>): AnalysisRecord {
    try {
      const id = this.generateId();
      const fullRecord: AnalysisRecord = { ...record, id };

      // Keep only original text reference in memory, full text in file
      const textFile = path.join(this.historyDir, `${id}.txt`);
      fs.writeFileSync(textFile, record.originalText, 'utf8');

      // Store metadata
      const metadata = {
        ...fullRecord,
        originalText: `[Stored in ${id}.txt]`, // Reference instead of full text
      };

      // Read existing records
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        try {
          records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
        } catch {
          records = [];
        }
      }

      // Add new record and keep only maxRecords
      records.unshift(metadata);
      records = records.slice(0, this.maxRecords);

      // Write back
      fs.writeFileSync(this.recordsFile, JSON.stringify(records, null, 2), 'utf8');

      return fullRecord;
    } catch (error) {
      console.error('Failed to save analysis:', error);
      throw error;
    }
  }

  /**
   * Get analysis by ID
   */
  getAnalysis(id: string): AnalysisRecord | null {
    try {
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
      }

      const record = records.find((r) => r.id === id);
      if (!record) return null;

      // Load full text from file
      const textFile = path.join(this.historyDir, `${id}.txt`);
      if (fs.existsSync(textFile)) {
        record.originalText = fs.readFileSync(textFile, 'utf8');
      }

      return record;
    } catch (error) {
      console.error('Failed to get analysis:', error);
      return null;
    }
  }

  /**
   * Get all analyses with pagination
   */
  getAllAnalyses(limit: number = 50, offset: number = 0): AnalysisRecord[] {
    try {
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
      }

      return records.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get analyses:', error);
      return [];
    }
  }

  /**
   * Delete analysis by ID
   */
  deleteAnalysis(id: string): boolean {
    try {
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
      }

      records = records.filter((r) => r.id !== id);
      fs.writeFileSync(this.recordsFile, JSON.stringify(records, null, 2), 'utf8');

      // Delete text file
      const textFile = path.join(this.historyDir, `${id}.txt`);
      if (fs.existsSync(textFile)) {
        fs.unlinkSync(textFile);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete analysis:', error);
      return false;
    }
  }

  /**
   * Get statistics
   */
  getStatistics(): Record<string, any> {
    try {
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
      }

      const textAnalyses = records.filter((r) => r.type === 'text').length;
      const pdfAnalyses = records.filter((r) => r.type === 'pdf').length;
      const avgDuration = records.length > 0 ? records.reduce((sum, r) => sum + r.duration, 0) / records.length : 0;

      return {
        totalAnalyses: records.length,
        textAnalyses,
        pdfAnalyses,
        averageDuration: Math.round(avgDuration),
        oldestAnalysis: records[records.length - 1]?.timestamp || null,
        newestAnalysis: records[0]?.timestamp || null,
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return {};
    }
  }

  /**
   * Clear old records (older than days)
   */
  clearOldRecords(olderThanDays: number = 30): number {
    try {
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const initialCount = records.length;
      records = records.filter((r) => new Date(r.timestamp) > cutoffDate);
      const deletedCount = initialCount - records.length;

      fs.writeFileSync(this.recordsFile, JSON.stringify(records, null, 2), 'utf8');

      return deletedCount;
    } catch (error) {
      console.error('Failed to clear old records:', error);
      return 0;
    }
  }

  /**
   * Export history as JSON
   */
  exportAsJSON(): string {
    try {
      let records: AnalysisRecord[] = [];
      if (fs.existsSync(this.recordsFile)) {
        records = JSON.parse(fs.readFileSync(this.recordsFile, 'utf8'));
      }

      return JSON.stringify(records, null, 2);
    } catch (error) {
      console.error('Failed to export history:', error);
      return '[]';
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    // Simple ID generation (in production, use better UUID)
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();
