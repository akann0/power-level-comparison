import { useState } from 'react';
import { WikiSearchResult, Entity, ComparisonResult } from './types';
import { SearchBox } from './components/SearchBox';
import { ComparisonResults } from './components/ComparisonResults';
import { LoadingScreen } from './components/LoadingScreen';
import { fetchWikipediaPage } from './services/wikipediaApi';
import { extractAttributes, calculateOverallScore } from './services/attributeExtractor';

/* Featured matchup suggestions for the landing page */
const FEATURED_MATCHUPS = [
  { a: 'LeBron James', b: 'Michael Jordan' },
  { a: 'Napoleon', b: 'Julius Caesar' },
  { a: 'Albert Einstein', b: 'Isaac Newton' },
  { a: 'Mike Tyson', b: 'Muhammad Ali' },
];

/* Main App component handling state and comparison logic */
function App() {
  const [selectedA, setSelectedA] = useState<WikiSearchResult | null>(null);
  const [selectedB, setSelectedB] = useState<WikiSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Runs the full comparison between two selected entities
  async function runComparison() {
    if (!selectedA || !selectedB) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const [entityA, entityB] = await Promise.all([
        fetchWikipediaPage(selectedA.pageid),
        fetchWikipediaPage(selectedB.pageid),
      ]);

      if (!entityA || !entityB) {
        throw new Error('Failed to fetch entity data');
      }

      const attributes = extractAttributes(entityA, entityB);
      const { scoreA, scoreB } = calculateOverallScore(attributes);
      
      const result: ComparisonResult = {
        entityA,
        entityB,
        attributes,
        overallScoreA: scoreA,
        overallScoreB: scoreB,
        winner: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie',
        timestamp: Date.now(),
      };

      setComparison(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  }

  // Resets state for a new comparison
  function resetComparison() {
    setSelectedA(null);
    setSelectedB(null);
    setComparison(null);
    setError(null);
  }

  // Show results if comparison is complete
  if (comparison) {
    return (
      <div className="min-h-screen py-12 px-4">
        <ComparisonResults result={comparison} onNewComparison={resetComparison} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {isLoading && selectedA && selectedB && (
        <LoadingScreen entityA={selectedA.title} entityB={selectedB.title} />
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-entity-blue/10 via-transparent to-entity-red/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-entity-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-entity-red/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight mb-4">
              <span className="bg-gradient-to-r from-entity-blue via-purple-400 to-entity-red bg-clip-text text-transparent">
                POWER LEVEL
              </span>
            </h1>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mb-4">
              COMPARISON GENERATOR
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Compare any two entities—athletes, historical figures, fictional characters—and 
              discover who comes out on top with AI-powered Wikipedia analysis.
            </p>
          </div>

          {/* Dual Search Interface */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block font-display text-sm uppercase tracking-wider text-entity-blue mb-2">
                First Entity
              </label>
              <SearchBox side="left" onSelect={setSelectedA} selected={selectedA} />
            </div>
            <div>
              <label className="block font-display text-sm uppercase tracking-wider text-entity-red mb-2">
                Second Entity
              </label>
              <SearchBox side="right" onSelect={setSelectedB} selected={selectedB} />
            </div>
          </div>

          {/* VS Divider & Compare Button */}
          <div className="flex flex-col items-center gap-4">
            <div className="font-display font-black text-4xl text-slate-600">VS</div>
            
            <button
              onClick={runComparison}
              disabled={!selectedA || !selectedB || isLoading}
              className={`px-10 py-4 rounded-xl font-display font-bold text-xl uppercase tracking-wider
                transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
                disabled:hover:scale-100 ${
                  selectedA && selectedB
                    ? 'bg-gradient-to-r from-entity-blue to-entity-red text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-700 text-slate-400'
                }`}
            >
              {isLoading ? 'Analyzing...' : 'Compare Power Levels'}
            </button>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Featured Matchups */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h3 className="font-display font-bold text-lg uppercase tracking-wider text-slate-500 text-center mb-6">
          Featured Matchups
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURED_MATCHUPS.map((matchup, i) => (
            <button
              key={i}
              onClick={() => {
                // Set these as search hints (user would need to search)
              }}
              className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700 
                hover:border-slate-600 transition-all text-left group"
            >
              <span className="text-entity-blue group-hover:text-blue-400 transition-colors">
                {matchup.a}
              </span>
              <span className="text-slate-600 mx-2">vs</span>
              <span className="text-entity-red group-hover:text-red-400 transition-colors">
                {matchup.b}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-4xl mx-auto px-4 py-12 border-t border-slate-800">
        <h3 className="font-display font-bold text-lg uppercase tracking-wider text-slate-500 text-center mb-8">
          How It Works
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-entity-blue/20 flex items-center justify-center text-entity-blue font-display font-bold">
              1
            </div>
            <h4 className="font-display font-bold text-white mb-2">Search Entities</h4>
            <p className="text-sm text-slate-400">Find any person, character, or object with Wikipedia data</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-display font-bold">
              2
            </div>
            <h4 className="font-display font-bold text-white mb-2">AI Analysis</h4>
            <p className="text-sm text-slate-400">Our system extracts and compares attributes using NLP</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-entity-red/20 flex items-center justify-center text-entity-red font-display font-bold">
              3
            </div>
            <h4 className="font-display font-bold text-white mb-2">See Results</h4>
            <p className="text-sm text-slate-400">Get detailed breakdowns and declare a winner</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <p className="text-sm text-slate-600">
          For entertainment purposes only. 
          <a href="https://wikipedia.org" target="_blank" rel="noopener" className="underline ml-1 hover:text-slate-400">
            Powered by Wikipedia
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

