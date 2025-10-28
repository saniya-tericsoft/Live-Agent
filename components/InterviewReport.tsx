import React from 'react';
import { InterviewReport as InterviewReportType } from '../types';

interface InterviewReportProps {
  report: InterviewReportType;
  onClose: () => void;
}

export const InterviewReport: React.FC<InterviewReportProps> = ({ report, onClose }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBorderColor = (score: number) => {
    if (score >= 8) return 'border-green-500';
    if (score >= 6) return 'border-yellow-500';
    if (score >= 4) return 'border-orange-500';
    return 'border-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-300 mb-2">Interview Report</h1>
          <p className="text-gray-300 text-sm">
            Analysis for {report.candidateName || 'Candidate'} regarding the {report.jobRole} position
          </p>
          <div className="h-px bg-gray-600 mt-4"></div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Score Card */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Overall Score</h2>
            <div className="flex items-center justify-center">
              <div className={`w-40 h-40 rounded-full border-8 ${getScoreBorderColor(report.overallScore)} flex items-center justify-center`}>
                <span className={`text-5xl font-bold ${getScoreColor(report.overallScore)}`}>
                  {report.overallScore.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">Out of 10.0</p>
            </div>
          </div>

          {/* Evaluation Summary Card */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Evaluation Summary</h2>
            <div className="text-gray-300 text-sm leading-relaxed">
              <p>{report.evaluationSummary}</p>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            {report.company} • Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

