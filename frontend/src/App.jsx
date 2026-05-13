import { useState } from 'react';

function App() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError('Please enter a transcript.');
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
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">
            AI Transcript Analyzer
          </h1>
          <p className="text-slate-400">Test the API endpoint directly from the browser</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 flex flex-col h-full">
            <div className="space-y-2 flex-grow flex flex-col">
              <label htmlFor="transcript" className="block text-sm font-medium text-slate-300">
                Input Transcript
              </label>
              <textarea
                id="transcript"
                className="w-full flex-grow min-h-[400px] p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none shadow-inner"
                placeholder="Paste the transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex justify-center items-center gap-2
                ${loading 
                  ? 'bg-slate-700 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 hover:shadow-purple-500/25 active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </button>
          </div>

          <div className="space-y-4 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">Returned JSON</h2>
              {result && (
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                  Success
                </span>
              )}
            </div>
            <div className="w-full flex-grow min-h-[400px] p-4 rounded-xl bg-[#0d1117] border border-slate-700/50 overflow-auto shadow-inner relative group">
              {!result && !loading && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm italic">
                  Results will appear here
                </div>
              )}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]/80 backdrop-blur-sm z-10 rounded-xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <span className="text-sm font-medium text-purple-400 animate-pulse">Awaiting AI...</span>
                  </div>
                </div>
              )}
              {result && (
                <pre className="text-[13px] leading-relaxed text-indigo-300 font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
