import { useState } from 'react';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Transcript cannot be empty. Please paste your transcript to analyze.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Analysis failed (${response.status}): ${errorText || response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        setError('Backend is offline. Please make sure the backend server is running on http://localhost:5000.');
      } else {
        setError(err.message || 'An unexpected error occurred while analyzing the transcript.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTranscript('');
    setResult(null);
    setError('');
  };

  const handleCopy = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  const syntaxHighlight = (json) => {
    if (!json) return '';
    const jsonStr = typeof json !== 'string' ? JSON.stringify(json, undefined, 2) : json;
    const escaped = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-blue-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-purple-400 font-semibold'; // key
        } else {
          cls = 'text-emerald-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-pink-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-slate-500'; // null
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4 pt-8 pb-4">
          <div className="inline-block p-1.5 px-4 rounded-full bg-slate-800/50 border border-slate-700/50 mb-2 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Phase 2 Dashboard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 drop-shadow-sm">
            AI Transcript Analyzer
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Instantly process your transcripts with advanced AI. Paste your text below to extract insights, identify key themes, and analyze communication gaps.
          </p>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-5 flex flex-col h-full">
            <div className="flex-grow flex flex-col bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden transition-all hover:border-slate-600/50">
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/40 flex justify-between items-center">
                <label htmlFor="transcript" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Input Transcript
                </label>
                <button 
                  onClick={handleClear}
                  className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-700/50 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Clear All
                </button>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <textarea
                  id="transcript"
                  className="w-full flex-grow min-h-[350px] lg:min-h-[500px] bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none text-[14px] leading-relaxed custom-scrollbar"
                  placeholder="Paste your meeting or call transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
              </div>
            </div>
            
            {/* Error Message Card */}
            {error && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 backdrop-blur-sm shadow-lg flex items-start gap-3 animate-in fade-in duration-300">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <div className="text-sm text-red-200 font-medium leading-relaxed">
                  {error}
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`group w-full py-4 px-6 rounded-xl font-bold text-white shadow-xl transition-all duration-300 flex justify-center items-center gap-3
                ${loading 
                  ? 'bg-slate-800 border border-slate-700 cursor-not-allowed text-slate-400' 
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:shadow-purple-500/25 active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing Transcript...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">Analyze Transcript</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 space-y-4 flex flex-col h-full">
            <div className="flex-grow flex flex-col bg-slate-800/30 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden transition-all hover:border-slate-600/50 relative">
              
              {/* Output Header */}
              <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-800/40 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    Analysis Result
                  </h2>
                  {result && (
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 shadow-sm">
                      Success
                    </span>
                  )}
                </div>
                
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  disabled={!result || loading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${!result || loading 
                      ? 'text-slate-500 cursor-not-allowed opacity-50' 
                      : copied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600/50'
                    }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      Copy JSON
                    </>
                  )}
                </button>
              </div>

              {/* Output Content Area */}
              <div className="flex-grow p-5 overflow-auto relative bg-[#090b0f]/80 custom-scrollbar">
                
                {/* Empty State */}
                {!result && !loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center animate-in fade-in duration-500">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center border border-slate-700/50 shadow-inner">
                      <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    </div>
                    <p className="text-sm">Analysis results will be displayed here.</p>
                  </div>
                )}

                {/* Loading State */}
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090b0f]/80 backdrop-blur-sm z-10 animate-in fade-in duration-300">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-slate-700/50 rounded-full"></div>
                      <div className="w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0 shadow-[0_0_15px_rgba(168,85,247,0.3)]"></div>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-1.5">
                      <span className="text-purple-400 font-medium tracking-wide animate-pulse">Processing via AI...</span>
                      <span className="text-xs text-slate-500">This might take a few seconds</span>
                    </div>
                  </div>
                )}

                {/* JSON Result State */}
                {result && !loading && (
                  <pre 
                    className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-words animate-in slide-in-from-bottom-2 fade-in duration-500"
                    dangerouslySetInnerHTML={{ __html: syntaxHighlight(result) }}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
