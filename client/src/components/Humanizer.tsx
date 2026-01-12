/**
 * Humanizer Component
 * Main component for humanizing AI-generated text
 */

import React, { useState } from 'react';
import {
  Wand2,
  Copy,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  TrendingUp,
} from 'lucide-react';
import TextComparison from './TextComparison';
import { humanizeText, HumanizationOptions, HumanizationResult } from '../services/api';

const Humanizer: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizationResult | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const [options, setOptions] = useState<HumanizationOptions>({
    tone: 'professional',
    intensity: 'medium',
    preserveTechnical: false,
    addPersonalTouches: false,
  });

  const handleHumanize = async () => {
    if (text.trim().length < 50) {
      setError('Please enter at least 50 characters of text to humanize.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const humanizationResult = await humanizeText(text, options);
      setResult(humanizationResult);
    } catch (err: any) {
      setError(err.message || 'Humanization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.humanizedText) {
      await navigator.clipboard.writeText(result.humanizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRehumanize = () => {
    if (result?.humanizedText) {
      setText(result.humanizedText);
      setResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold">AI Text Humanizer</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Transform AI-generated text into natural, human-sounding content.
        </p>

        <textarea
          className="input-textarea h-64"
          placeholder="Paste AI-generated text here (minimum 50 characters)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">{text.length} characters</span>

          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleHumanize}
            disabled={loading || text.length < 50}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Humanizing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Humanize Text
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

      {/* Options Panel */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold">Humanization Options</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tone Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tone
            </label>
            <select
              className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none bg-white dark:bg-gray-700"
              value={options.tone}
              onChange={(e) =>
                setOptions({ ...options, tone: e.target.value as HumanizationOptions['tone'] })
              }
            >
              <option value="casual">Casual - Conversational and relaxed</option>
              <option value="professional">Professional - Clear and business-like</option>
              <option value="academic">Academic - Scholarly and analytical</option>
              <option value="creative">Creative - Vivid and engaging</option>
            </select>
          </div>

          {/* Intensity Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Intensity: {options.intensity.charAt(0).toUpperCase() + options.intensity.slice(1)}
            </label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Light</span>
              <input
                type="range"
                min="0"
                max="2"
                step="1"
                value={options.intensity === 'light' ? 0 : options.intensity === 'medium' ? 1 : 2}
                onChange={(e) => {
                  const intensities: HumanizationOptions['intensity'][] = [
                    'light',
                    'medium',
                    'aggressive',
                  ];
                  setOptions({ ...options, intensity: intensities[parseInt(e.target.value)] });
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-500">Aggressive</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {options.intensity === 'light' &&
                'Minimal changes, focus on removing obvious AI patterns'}
              {options.intensity === 'medium' &&
                'Moderate restructuring, add noticeable personality'}
              {options.intensity === 'aggressive' &&
                'Extensive rewriting, maximum humanization'}
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.preserveTechnical}
                onChange={(e) =>
                  setOptions({ ...options, preserveTechnical: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Preserve technical terms
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={options.addPersonalTouches}
                onChange={(e) =>
                  setOptions({ ...options, addPersonalTouches: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Add personal touches
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {result.statistics.wordsChanged}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Words Changed</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {result.statistics.sentenceVariations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Sentence Variations
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {result.statistics.aiPhrasesRemoved}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">AI Phrases Removed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Patterns Removed */}
          {result.patternsRemoved.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">AI Patterns Removed</h3>
              <div className="flex flex-wrap gap-2">
                {result.patternsRemoved.map((pattern, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    "{pattern}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Text Comparison */}
          <TextComparison originalText={text} modifiedText={result.humanizedText} />

          {/* Actions */}
          <div className="flex gap-4">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Humanized Text
                </>
              )}
            </button>

            <button
              className="btn-secondary flex items-center gap-2"
              onClick={handleRehumanize}
            >
              <RefreshCw className="w-5 h-5" />
              Re-humanize
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Humanizer;
