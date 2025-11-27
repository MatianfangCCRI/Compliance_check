import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultDisplay from './components/ResultDisplay';
import { analyzeCompliance } from './services/geminiService';
import { AnalysisResult, ComplianceStatus, UploadedFile } from './types';

function App() {
  const [currentFile, setCurrentFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<ComplianceStatus>(ComplianceStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [focusArea, setFocusArea] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = (uploadedFile: UploadedFile) => {
    setCurrentFile(uploadedFile);
    setStatus(ComplianceStatus.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!currentFile) return;

    setStatus(ComplianceStatus.ANALYZING);
    setErrorMsg(null);

    try {
      const data = await analyzeCompliance(currentFile.file, focusArea);
      setResult(data);
      setStatus(ComplianceStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setStatus(ComplianceStatus.ERROR);
      setErrorMsg(err.message || "An unexpected error occurred during analysis.");
    }
  };

  const handleReset = () => {
    setCurrentFile(null);
    setStatus(ComplianceStatus.IDLE);
    setResult(null);
    setFocusArea('');
    setErrorMsg(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar / Left Panel */}
      <aside className="w-[400px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full z-10">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">ComplianceGuard</h1>
          </div>
          <p className="text-xs text-slate-500 ml-11">
            AI-Powered Regulatory Check
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* Step 1: Upload */}
          <section>
            <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              1. Input Source
            </h2>
            {!currentFile ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img 
                  src={currentFile.previewUrl} 
                  alt="Preview" 
                  className="w-full h-auto object-cover max-h-[300px]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={handleReset}
                    className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Step 2: Configuration */}
          <section className={!currentFile ? 'opacity-50 pointer-events-none' : ''}>
             <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
              2. Compliance Context
            </h2>
            <div className="space-y-3">
              <label className="block text-sm text-slate-600">
                Specific Regulation Focus (Optional)
              </label>
              <input
                type="text"
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                placeholder="e.g. Advertising Law, Traffic Safety..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 placeholder:text-slate-400 bg-white shadow-sm transition-all"
              />
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini will search specifically for recent amendments regarding your focus area. If left blank, it will infer the context.
              </p>
            </div>
          </section>
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleAnalyze}
            disabled={!currentFile || status === ComplianceStatus.ANALYZING}
            className={`
              w-full py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all
              ${!currentFile || status === ComplianceStatus.ANALYZING
                ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30 hover:-translate-y-0.5'
              }
            `}
          >
            {status === ComplianceStatus.ANALYZING ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Regulations...
              </>
            ) : (
              <>
                Run Compliance Check
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content / Result Area */}
      <main className="flex-1 h-full relative flex flex-col">
        {status === ComplianceStatus.IDLE && !result && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-600">Ready to Analyze</h3>
            <p className="max-w-md text-center mt-2 text-sm text-slate-400">
              Upload a screenshot and click "Run Compliance Check" to verify content against the latest web-sourced regulations.
            </p>
          </div>
        )}

        {status === ComplianceStatus.ERROR && (
           <div className="flex-1 flex flex-col items-center justify-center p-8">
             <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-lg w-full text-center">
                <svg className="w-10 h-10 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-bold text-lg mb-1">Analysis Failed</h3>
                <p className="text-sm opacity-90">{errorMsg}</p>
             </div>
           </div>
        )}

        {(status === ComplianceStatus.COMPLETED || status === ComplianceStatus.ANALYZING) && (
          <div className="flex-1 p-6 h-full overflow-hidden">
             {status === ComplianceStatus.ANALYZING ? (
               <div className="h-full w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <p className="mt-8 text-sm text-slate-400 font-medium">Consulting current regulations...</p>
               </div>
             ) : (
                <ResultDisplay result={result} />
             )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
