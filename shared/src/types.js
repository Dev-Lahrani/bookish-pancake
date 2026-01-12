"use strict";
/**
 * Shared TypeScript types for AI Plagiarism Detector and Humanizer
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRiskLevel = getRiskLevel;
exports.getRiskColor = getRiskColor;
function getRiskLevel(score) {
    if (score <= 30)
        return 'low';
    if (score <= 70)
        return 'medium';
    return 'high';
}
function getRiskColor(level) {
    switch (level) {
        case 'low': return '#22c55e'; // green
        case 'medium': return '#eab308'; // yellow
        case 'high': return '#ef4444'; // red
    }
}
