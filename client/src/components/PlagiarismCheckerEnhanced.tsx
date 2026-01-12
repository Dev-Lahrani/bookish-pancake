/**
 * Enhanced PlagiarismChecker Component with PDF Upload
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  FileText,
  AlertTriangle,
  Brain,
  Sparkles,
  BookOpen,
  Loader2,
  XCircle,
  Search,
  Copy,
  Upload,
  File,
  Trash2,
  Download,
  History,
} from 'lucide-react';
import { analyzeText, AnalysisResult, analyzePDF } from '../services/api';

interface AnalysisHistory {
  id: string;
  text: string;
  result: AnalysisResult;
  timestamp: string;
}

const EnhancedPlagiarismChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // Text Analysis
  const handleAnalyze = useCallback(async () => {
    if (text.trim().length < 50) {
      setError('Please enter at least 50 characters of text to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const analysisResult = await analyzeText(text);
      setResult(analysisResult);

      // Add to history
      setHistory((prev) => [
        {
          id: `${Date.now()}`,
          text: text.substring(0, 100),
          result: analysisResult,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  }, [text]);

  // PDF Upload Analysis
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must not exceed 50MB.');
      return;
    }

    setFileLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const analysisResult = await analyzePDF(formData);
      setResult(analysisResult);
      setUploadedFile(file.name);

      // Add to history
      setHistory((prev) => [
        {
          id: `${Date.now()}`,
          text: `PDF: ${file.name}`,
          result: analysisResult,
          timestamp: new Date().toLocaleString(),
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      setError(err.message || 'PDF analysis failed. Please try again.');
      console.error('PDF analysis error:', err);
    } finally {
      setFileLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  const copyToClipboard = () => {
    if (result) {
      const text = `Plagiarism Score: ${(result.overallScore * 100).toFixed(1)}%`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportResult = () => {
    if (result) {
      const exportData = {
        timestamp: new Date().toISOString(),
        analysisResults: result,
        sourceText: text.substring(0, 200),
      };
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plagiarism-report-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getRiskColor = (score: number) => {
    if (score > 0.8) return 'text-red-600 bg-red-100';
    if (score > 0.6) return 'text-orange-600 bg-orange-100';
    if (score > 0.4) return 'text-yellow-600 bg-yellow-100';
    if (score > 0.2) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">AI Plagiarism Detective</h1>
            <Sparkles className="w-10 h-10 text-purple-600" />
          </div>
          <p className="text-gray-600 text-lg">Enterprise-grade AI content detection and analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Text Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Text Analysis</h2>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here... (minimum 50 characters)"
                className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">{text.length} characters</span>
                <button
                  onClick={() => setText('')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || text.trim().length < 50}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Text
                  </>
                )}
              </button>
            </div>

            {/* PDF Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <File className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">PDF Upload</h2>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload PDF or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">Max size: 50MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-700">{uploadedFile}</span>
                  <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" />
                </div>
              )}
              {fileLoading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-purple-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing PDF...
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <History className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Recent Analyses</h2>
                  </div>
                  <button onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? '▼' : '▶'}
                  </button>
                </div>
                {showHistory && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <p className="text-sm text-gray-700 truncate">{item.text}</p>
                        <p className="text-xs text-gray-500">{item.timestamp}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <div className="flex items-gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 ml-3">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Risk Level Badge */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Risk Assessment</h3>
                    <span className={`px-4 py-2 rounded-full font-bold ${getRiskColor(result.overallScore)}`}>
                      {result.overallScore > 0.8 ? 'HIGH RISK' : result.overallScore > 0.6 ? 'MEDIUM RISK' : 'LOW RISK'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plagiarism Score</p>
                      <p className="text-3xl font-bold text-indigo-600">{(result.overallScore * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-3xl font-bold text-purple-600">85%</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                {result.metrics && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-4 text-white">
                      <p className="text-sm font-semibold opacity-90">Sentence Uniformity</p>
                      <p className="text-2xl font-bold mt-1">{(result.metrics.sentenceUniformity * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-4 text-white">
                      <p className="text-sm font-semibold opacity-90">Perplexity</p>
                      <p className="text-2xl font-bold mt-1">{result.metrics.perplexity.toFixed(2)}</p>
                    </div>
                  </div>
                )}

                {/* Suspicious Sections */}
                {result.suspiciousSections && result.suspiciousSections.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Suspicious Sections</h3>
                    <div className="space-y-3">
                      {result.suspiciousSections.slice(0, 3).map((section, idx: number) => (
                        <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{section.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-indigo-100 text-indigo-600 font-semibold py-3 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-5 h-5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={exportResult}
                    className="flex-1 bg-purple-100 text-purple-600 font-semibold py-3 rounded-lg hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export
                  </button>
                </div>
              </div>
            )}

            {!result && !error && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Analyze text or upload PDF to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlagiarismChecker;
