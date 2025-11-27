import React from 'react';
import { AnalysisResult } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) return null;

  // Simple Markdown-like formatter since we can't use external markdown libraries freely
  // This splits by headers and paragraphs to provide structure.
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={index} className="ml-4 pl-1 text-slate-700 mb-1 list-disc marker:text-blue-500">
             <span dangerouslySetInnerHTML={{ __html: formatBold(line.replace(/^[\*\-]\s/, '')) }} />
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
         return (
          <li key={index} className="ml-4 pl-1 text-slate-700 mb-1 list-decimal marker:text-blue-500">
             <span dangerouslySetInnerHTML={{ __html: formatBold(line.replace(/^\d+\.\s/, '')) }} />
          </li>
         )
      }
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      // Standard Paragraph
      return <p key={index} className="text-slate-700 leading-relaxed mb-2" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />;
    });
  };

  // Helper to bold text wrapped in **
  const formatBold = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Compliance Report
        </h2>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
          AI Generated
        </span>
      </div>
      
      <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
        <div className="prose prose-sm max-w-none text-slate-600">
          {formatText(result.text)}
        </div>

        {/* Grounding Sources Section */}
        {result.groundingChunks && result.groundingChunks.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Source References
            </h4>
            <div className="grid gap-2">
              {result.groundingChunks.map((chunk, idx) => {
                if (chunk.web?.uri) {
                  return (
                    <a 
                      key={idx} 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="bg-white p-1.5 rounded-md border border-slate-200 group-hover:border-blue-200">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">
                          {chunk.web.title || "Reference Source"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {chunk.web.uri}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;
