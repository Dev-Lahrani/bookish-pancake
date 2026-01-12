/**
 * MetricsCard Component
 * Displays individual metric with icon and description
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description: string;
  color: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  color,
}) => {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </h3>
          </div>
          <div className={`text-3xl font-bold mb-2 ${color}`}>
            {typeof value === 'number' ? `${value}%` : value}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      
      {/* Progress bar for numeric values */}
      {typeof value === 'number' && (
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, value)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
