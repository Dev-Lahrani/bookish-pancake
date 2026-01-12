/**
 * PlagiarismChecker Component
 * Main component for analyzing text for AI detection
 */

import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  BarChart3,
  Brain,
  Sparkles,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import MetricsCard from './MetricsCard';
import { analyzeText, AnalysisResult } from '../services/api';

const PlagiarismChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleAnalyze = async () => {
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
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number): { color: string; label: string; bgColor: string } => {
    if (score <= 30) {
      return {
        color: 'text-green-600 dark:text-green-400',
        label: 'Low Risk - Likely Human',
        bgColor: 'bg-green-100 dark:bg-green-900',
      };
    }
    if (score <= 70) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        label: 'Medium Risk - Uncertain',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      };
    }
    return {
      color: 'text-red-600 dark:text-red-400',
      label: 'High Risk - Likely AI',
      bgColor: 'bg-red-100 dark:bg-red-900',
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold">AI Content Detection</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Paste your text below to analyze it for AI-generated content patterns.
        </p>
        
        <textarea
          className="input-textarea h-64"
          placeholder="Paste your text here (minimum 50 characters)...&#10;&#10;Tip: Press Ctrl+Enter to analyze quickly"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {text.length} characters
          </span>
          
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleAnalyze}
            disabled={loading || text.length < 50}
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

        {error && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* Overall Score */}
          <div className="card">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">AI Detection Score</h3>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - result.overallScore / 100)}`}
                    className={getRiskLevel(result.overallScore).color}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getRiskLevel(result.overallScore).color}`}>
                      {result.overallScore}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`inline-block px-6 py-3 rounded-full ${getRiskLevel(result.overallScore).bgColor}`}>
                <span className={`font-semibold ${getRiskLevel(result.overallScore).color}`}>
                  {getRiskLevel(result.overallScore).label}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricsCard
              title="Sentence Uniformity"
              value={result.metrics.sentenceUniformity}
              icon={BarChart3}
              description="Measures consistency in sentence structure. High = AI-like"
              color="text-purple-600 dark:text-purple-400"
            />
            <MetricsCard
              title="Perplexity"
              value={result.metrics.perplexity}
              icon={Brain}
              description="Word predictability. Low = more predictable = AI-like"
              color="text-blue-600 dark:text-blue-400"
            />
            <MetricsCard
              title="Burstiness"
              value={result.metrics.burstiness}
              icon={Sparkles}
              description="Sentence length variation. Low = less human-like"
              color="text-pink-600 dark:text-pink-400"
            />
            <MetricsCard
              title="AI Phrases"
              value={result.metrics.aiPhraseCount}
              icon={AlertTriangle}
              description="Common AI phrase count detected in text"
              color="text-orange-600 dark:text-orange-400"
            />
            <MetricsCard
              title="Vocabulary Diversity"
              value={result.metrics.vocabularyDiversity}
              icon={BookOpen}
              description="Lexical variety. Too high can indicate AI"
              color="text-teal-600 dark:text-teal-400"
            />
            <MetricsCard
              title="Readability Score"
              value={result.metrics.readabilityScore}
              icon={FileText}
              description="Flesch-Kincaid score. Consistency suggests AI"
              color="text-indigo-600 dark:text-indigo-400"
            />
          </div>

          {/* Detected Patterns */}
          {result.detectedPatterns.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Detected AI Patterns
              </h3>
              <div className="space-y-3">
                {result.detectedPatterns.slice(0, 10).map((pattern, index) => (
                  <div
                    key={index}
                    className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-orange-900 dark:text-orange-300">
                        "{pattern.pattern}"
                      </span>
                      <span className="px-3 py-1 bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-200 rounded-full text-sm font-semibold">
                        {pattern.count} occurrence{pattern.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {pattern.examples.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                        Example: {pattern.examples[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Sections */}
          {result.suspiciousSections.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Suspicious Sections
              </h3>
              <div className="space-y-2">
                {result.suspiciousSections.map((section, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      section.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                        : section.severity === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          section.severity === 'high'
                            ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-200'
                            : section.severity === 'medium'
                            ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-200'
                        }`}
                      >
                        {section.severity.toUpperCase()}
                      </span>
                      <span className="text-sm">{section.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PlagiarismChecker;
