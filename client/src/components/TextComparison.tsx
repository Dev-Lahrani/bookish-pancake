/**
 * TextComparison Component
 * Side-by-side diff view of original and humanized text
 */

import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface TextComparisonProps {
  originalText: string;
  modifiedText: string;
}

const TextComparison: React.FC<TextComparisonProps> = ({
  originalText,
  modifiedText,
}) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Text Comparison</h3>
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <ReactDiffViewer
          oldValue={originalText}
          newValue={modifiedText}
          splitView={true}
          showDiffOnly={false}
          leftTitle="Original"
          rightTitle="Humanized"
          styles={{
            variables: {
              dark: {
                diffViewerBackground: '#1f2937',
                diffViewerColor: '#f3f4f6',
                addedBackground: '#064e3b',
                addedColor: '#d1fae5',
                removedBackground: '#7f1d1d',
                removedColor: '#fee2e2',
                wordAddedBackground: '#065f46',
                wordRemovedBackground: '#991b1b',
                addedGutterBackground: '#065f46',
                removedGutterBackground: '#991b1b',
                gutterBackground: '#374151',
                gutterBackgroundDark: '#1f2937',
                highlightBackground: '#4b5563',
                highlightGutterBackground: '#374151',
              },
              light: {
                diffViewerBackground: '#ffffff',
                diffViewerColor: '#1f2937',
                addedBackground: '#d1fae5',
                addedColor: '#065f46',
                removedBackground: '#fee2e2',
                removedColor: '#991b1b',
                wordAddedBackground: '#a7f3d0',
                wordRemovedBackground: '#fecaca',
                addedGutterBackground: '#a7f3d0',
                removedGutterBackground: '#fecaca',
                gutterBackground: '#f3f4f6',
                gutterBackgroundDark: '#e5e7eb',
                highlightBackground: '#fef3c7',
                highlightGutterBackground: '#fde68a',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default TextComparison;
