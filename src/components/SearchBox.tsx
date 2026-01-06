import { useState, useEffect, useRef } from 'react';
import { WikiSearchResult } from '../types';
import { searchWikipedia } from '../services/wikipediaApi';

interface SearchBoxProps {
  side: 'left' | 'right';
  onSelect: (result: WikiSearchResult) => void;
  selected: WikiSearchResult | null;
}

/* Autocomplete search box for finding Wikipedia entities */
export function SearchBox({ side, onSelect, selected }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Wikipedia search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const searchResults = await searchWikipedia(query);
      setResults(searchResults);
      setIsLoading(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const accentColor = side === 'left' ? 'entity-blue' : 'entity-red';
  const borderClass = side === 'left' ? 'border-entity-blue' : 'border-entity-red';
  const glowClass = side === 'left' ? 'glow-blue' : 'glow-red';

  return (
    <div ref={containerRef} className="relative w-full">
      {selected ? (
        <div className={`flex items-center gap-3 p-4 rounded-xl bg-slate-800/80 border-2 ${borderClass} ${glowClass}`}>
          {selected.thumbnail && (
            <img src={selected.thumbnail.source} alt="" className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-white truncate">{selected.title}</p>
            <p className="text-sm text-slate-400 truncate">{selected.description}</p>
          </div>
          <button
            onClick={() => { onSelect(null as unknown as WikiSearchResult); setQuery(''); }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={side === 'left' ? 'Search first entity...' : 'Search second entity...'}
            className={`w-full px-5 py-4 rounded-xl bg-slate-800/80 border-2 border-slate-600 
              focus:${borderClass} focus:outline-none transition-all font-body text-lg
              placeholder:text-slate-500`}
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </>
      )}

      {isOpen && results.length > 0 && !selected && (
        <ul className="absolute z-50 w-full mt-2 bg-slate-800 rounded-xl border border-slate-600 shadow-2xl overflow-hidden">
          {results.map((result) => (
            <li key={result.pageid}>
              <button
                onClick={() => { onSelect(result); setIsOpen(false); setQuery(result.title); }}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors text-left"
              >
                {result.thumbnail ? (
                  <img src={result.thumbnail.source} alt="" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center text-slate-400">?</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{result.title}</p>
                  <p className="text-xs text-slate-400 truncate">{result.description || 'Wikipedia page'}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

