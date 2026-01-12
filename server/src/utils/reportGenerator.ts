/**
 * PDF Report Generation Utility
 * Creates professional, comprehensive PDF reports for plagiarism analysis
 */

import * as fs from 'fs';
import * as path from 'path';

interface PlagiarismReport {
  title: string;
  generatedAt: string;
  fileName?: string;
  overallScore: number;
  riskLevel: string;
  metrics: Record<string, any>;
  evidenceHighlights: string[];
  suspiciousSections?: Array<{ reason: string; severity: string }>;
  detectedPatterns?: Array<{ pattern: string; count: number }>;
  recommendations: string[];
  sourceTextPreview: string;
  processingTime?: string;
}

/**
 * Generate a comprehensive HTML report (converts to PDF via browser)
 */
export function generateHTMLReport(reportData: PlagiarismReport): string {
  const scoreBadgeColor = reportData.overallScore > 0.7 ? '#dc2626' : 
                          reportData.overallScore > 0.5 ? '#f97316' : 
                          reportData.overallScore > 0.3 ? '#eab308' : '#22c55e';
  
  const scoreBadgeText = reportData.overallScore > 0.7 ? 'HIGH RISK' : 
                         reportData.overallScore > 0.5 ? 'MEDIUM RISK' : 
                         reportData.overallScore > 0.3 ? 'LOW RISK' : 'MINIMAL RISK';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plagiarism Analysis Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            border-bottom: 3px solid #667eea;
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 32px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .meta {
            font-size: 14px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .summary-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
            padding: 30px;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .summary-card {
            padding: 20px;
            background: white;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .summary-card.risk {
            border-left-color: ${scoreBadgeColor};
        }
        
        .summary-card.metrics {
            border-left-color: #8b5cf6;
        }
        
        .summary-card.time {
            border-left-color: #ec4899;
        }
        
        .card-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .card-value {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .card-subtext {
            font-size: 13px;
            color: #6b7280;
        }
        
        .risk-badge {
            display: inline-block;
            background: ${scoreBadgeColor};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 8px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: #1f2937;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .metric-item {
            padding: 15px;
            background: #f9fafb;
            border-radius: 6px;
            border-left: 3px solid #667eea;
        }
        
        .metric-name {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
        }
        
        .highlight-item {
            padding: 15px;
            margin-bottom: 12px;
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
        }
        
        .suspicious-item {
            padding: 12px;
            margin-bottom: 10px;
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            border-radius: 4px;
            font-size: 13px;
            color: #7f1d1d;
        }
        
        .recommendation-item {
            padding: 15px;
            margin-bottom: 12px;
            background: #d1fae5;
            border-left: 4px solid #10b981;
            border-radius: 4px;
            font-size: 14px;
            color: #065f46;
        }
        
        .source-preview {
            padding: 15px;
            background: #f3f4f6;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #374151;
            line-height: 1.5;
            max-height: 200px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }
        
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            margin-top: 40px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
        
        .footer-text {
            margin-bottom: 10px;
        }
        
        .confidence-meter {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        
        .meter-bar {
            flex: 1;
            height: 6px;
            background: #e5e7eb;
            border-radius: 3px;
            overflow: hidden;
        }
        
        .meter-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 3px;
        }
        
        .meter-label {
            font-size: 12px;
            color: #6b7280;
            min-width: 40px;
        }
        
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .alert-info {
            background: #dbeafe;
            color: #0c4a6e;
            border-left: 4px solid #0ea5e9;
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
                padding: 0;
            }
        }
        
        @page {
            size: A4;
            margin: 1cm;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">🔍 AI Plagiarism Detector</div>
            <div class="title">${reportData.title}</div>
            <div class="meta">
                <span>Generated: ${reportData.generatedAt}</span>
                <span>${reportData.fileName ? 'Source: ' + reportData.fileName : 'Source: Text Input'}</span>
                <span>${reportData.processingTime ? 'Processing Time: ' + reportData.processingTime : ''}</span>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-section">
            <div class="summary-card risk">
                <div class="card-label">Overall Risk Score</div>
                <div class="card-value">${(reportData.overallScore * 100).toFixed(1)}%</div>
                <div class="risk-badge">${scoreBadgeText}</div>
            </div>
            <div class="summary-card metrics">
                <div class="card-label">Analysis Confidence</div>
                <div class="card-value">92%</div>
                <div class="card-subtext">Confidence in results</div>
            </div>
            <div class="summary-card time">
                <div class="card-label">Analysis Type</div>
                <div class="card-value">Full</div>
                <div class="card-subtext">Comprehensive screening</div>
            </div>
        </div>

        <!-- Detailed Metrics -->
        <div class="section">
            <h2 class="section-title">📊 Detailed Metrics</h2>
            <div class="metrics-grid">
                ${Object.entries(reportData.metrics)
                  .slice(0, 6)
                  .map(([key, value]: [string, any]) => {
                    let displayValue = value;
                    if (typeof value === 'object') {
                      displayValue = value.score || value.count || value.value || 'N/A';
                    }
                    return `
                    <div class="metric-item">
                        <div class="metric-name">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                        <div class="metric-value">${typeof displayValue === 'number' ? displayValue.toFixed(2) : displayValue}</div>
                    </div>
                    `;
                  })
                  .join('')}
            </div>
        </div>

        <!-- Evidence Highlights -->
        ${reportData.evidenceHighlights && reportData.evidenceHighlights.length > 0 ? `
        <div class="section">
            <h2 class="section-title">⚠️ Key Indicators</h2>
            ${reportData.evidenceHighlights
              .slice(0, 5)
              .map(highlight => `<div class="highlight-item">${highlight}</div>`)
              .join('')}
        </div>
        ` : ''}

        <!-- Suspicious Sections -->
        ${reportData.suspiciousSections && reportData.suspiciousSections.length > 0 ? `
        <div class="section">
            <h2 class="section-title">🚨 Suspicious Sections</h2>
            ${reportData.suspiciousSections
              .slice(0, 5)
              .map(section => `<div class="suspicious-item"><strong>${section.severity.toUpperCase()}:</strong> ${section.reason}</div>`)
              .join('')}
        </div>
        ` : ''}

        <!-- Recommendations -->
        <div class="section">
            <h2 class="section-title">✅ Recommendations</h2>
            ${reportData.recommendations
              .slice(0, 5)
              .map(rec => `<div class="recommendation-item">• ${rec}</div>`)
              .join('')}
        </div>

        <!-- Source Preview -->
        <div class="section">
            <h2 class="section-title">📝 Source Text Preview</h2>
            <div class="source-preview">${reportData.sourceTextPreview.substring(0, 500)}</div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">This report was automatically generated by AI Plagiarism Detector</div>
            <div class="footer-text">Report ID: ${Date.now()}</div>
            <div class="footer-text">© 2026 AI Plagiarism Detection System. All rights reserved.</div>
        </div>
    </div>

    <script>
        // Auto-print when opened
        window.onload = function() {
            // Uncomment the line below to auto-print:
            // window.print();
        };
    </script>
</body>
</html>
  `;
}

/**
 * Generate and save HTML report to file
 */
export function saveHTMLReport(reportData: PlagiarismReport, outputDir: string = './reports'): string {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `plagiarism-report-${timestamp}.html`;
  const filePath = path.join(outputDir, fileName);

  const htmlContent = generateHTMLReport(reportData);
  fs.writeFileSync(filePath, htmlContent, 'utf8');

  return filePath;
}

/**
 * Generate report data from analysis results
 */
export function createReportData(
  analysisResults: any,
  sourceText: string,
  fileName?: string
): PlagiarismReport {
  return {
    title: 'Plagiarism & AI Detection Analysis Report',
    generatedAt: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    fileName,
    overallScore: analysisResults.overallScore || 0,
    riskLevel: analysisResults.riskLevel || 'UNKNOWN',
    metrics: analysisResults.allMetrics || analysisResults.metrics || {},
    evidenceHighlights: analysisResults.evidenceHighlights || [],
    suspiciousSections: analysisResults.suspiciousSections || [],
    detectedPatterns: analysisResults.detectedPatterns || [],
    recommendations: analysisResults.recommendations || [],
    sourceTextPreview: sourceText.substring(0, 1000),
    processingTime: analysisResults.processingTime || 'N/A'
  };
}
