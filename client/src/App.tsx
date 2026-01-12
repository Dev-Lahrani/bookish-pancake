/**
 * Main App Component - Enhanced with error boundaries and server connection handling
 */

import React, { useState, useEffect } from 'react';
import { Moon, Sun, FileSearch, Wand2, Github, AlertCircle, CheckCircle2, Wifi } from 'lucide-react';
import PlagiarismChecker from './components/PlagiarismChecker';
import Humanizer from './components/Humanizer';
import { checkHealth, ServerHealth } from './services/api';

type Tab = 'plagiarism' | 'humanizer';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('plagiarism');
  const [darkMode, setDarkMode] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerHealth | null>(null);
  const [serverError, setServerError] = useState<string>('');

  // Initialize dark mode and check server health
  useEffect(() => {
    // Dark mode setup
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Check server health
    checkServerHealth();
    const healthInterval = setInterval(checkServerHealth, 30000); // Check every 30 seconds
    return () => clearInterval(healthInterval);
  }, []);

  const checkServerHealth = async () => {
    try {
      const health = await checkHealth();
      setServerStatus(health);
      setServerError('');
    } catch (error: any) {
      setServerStatus(null);
      setServerError(error.message || 'Cannot connect to server');
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Plagiarism Detector & Humanizer
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Detect AI-generated content and humanize text with advanced NLP
              </p>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Dev-Lahrani/bookish-pancake"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="GitHub"
                title="View on GitHub"
              >
                <Github className="w-6 h-6" />
              </a>

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Server Status Indicator */}
          <div className="mb-4 flex items-center gap-2">
            {serverStatus ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Wifi className="w-4 h-4" />
                <span>Server connected</span>
                {serverStatus.apis.openai && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs">OpenAI ✓</span>}
                {serverStatus.apis.anthropic && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded text-xs">Anthropic ✓</span>}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>{serverError || 'Connecting...'}</span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('plagiarism')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'plagiarism'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <FileSearch className="w-5 h-5" />
              Plagiarism Checker
            </button>

            <button
              onClick={() => setActiveTab('humanizer')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'humanizer'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Wand2 className="w-5 h-5" />
              Humanizer
            </button>
          </div>
        </div>
      </header>

      {/* Server Connection Warning */}
      {serverError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3">
          <div className="container mx-auto flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">Server Connection Issue</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {serverError}. Make sure to run <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">npm run dev</code> from the project root.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'plagiarism' ? <PlagiarismChecker /> : <Humanizer />}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>
              Built with React, TypeScript, Tailwind CSS, Node.js, and AI APIs
            </p>
            <p className="mt-2">
              Processing time shown for each analysis • Results are cached for 5 minutes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
