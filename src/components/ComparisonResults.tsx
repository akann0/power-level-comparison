import { ComparisonResult } from '../types';
import { ProfileCard } from './ProfileCard';
import { AttributeBar } from './AttributeBar';

interface ComparisonResultsProps {
  result: ComparisonResult;
  onNewComparison: () => void;
}

/* Full comparison results display with profiles, bars, and winner */
export function ComparisonResults({ result, onNewComparison }: ComparisonResultsProps) {
  const { entityA, entityB, attributes, overallScoreA, overallScoreB, winner } = result;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fadeIn">
      {/* VS Header */}
      <div className="text-center mb-8">
        <h1 className="font-display font-black text-4xl md:text-6xl tracking-tight">
          <span className="text-entity-blue">{entityA.title}</span>
          <span className="text-slate-500 mx-4">VS</span>
          <span className="text-entity-red">{entityB.title}</span>
        </h1>
      </div>

      {/* Profile Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ProfileCard 
          entity={entityA} 
          side="left" 
          overallScore={overallScoreA} 
          isWinner={winner === 'A'}
        />
        <ProfileCard 
          entity={entityB} 
          side="right" 
          overallScore={overallScoreB} 
          isWinner={winner === 'B'}
        />
      </div>

      {/* Attribute Comparison Bars */}
      <div className="bg-slate-900/80 rounded-2xl p-6 backdrop-blur border border-slate-700">
        <h3 className="font-display font-bold text-lg uppercase tracking-wider text-slate-300 mb-4">
          Attribute Breakdown
        </h3>
        <p className="text-sm text-slate-500 mb-4">Click any attribute for details</p>
        
        <div className="space-y-2">
          {attributes.map((attr, index) => (
            <AttributeBar key={attr.name} attribute={attr} index={index} />
          ))}
        </div>
      </div>

      {/* Overall Winner Banner */}
      <div className="mt-8 text-center">
        {winner !== 'tie' ? (
          <div className="inline-block px-8 py-4 bg-gradient-to-r from-winner-gold/20 via-winner-gold/40 to-winner-gold/20 rounded-2xl border-2 border-winner-gold glow-gold">
            <p className="text-sm uppercase tracking-widest text-winner-gold font-display mb-1">Overall Winner</p>
            <p className="font-display font-black text-3xl text-white">
              {winner === 'A' ? entityA.title : entityB.title}
            </p>
            <p className="font-mono text-winner-gold mt-1">
              {Math.abs(overallScoreA - overallScoreB)} point advantage
            </p>
          </div>
        ) : (
          <div className="inline-block px-8 py-4 bg-slate-800 rounded-2xl border-2 border-slate-600">
            <p className="font-display font-black text-3xl text-white">IT'S A TIE!</p>
            <p className="font-mono text-slate-400 mt-1">Both scored {overallScoreA}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={onNewComparison}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-display font-bold transition-colors"
        >
          New Comparison
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="px-6 py-3 bg-entity-blue hover:bg-blue-600 rounded-xl font-display font-bold transition-colors"
        >
          Share Link
        </button>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-slate-600 max-w-xl mx-auto">
        For entertainment purposes only. Scores are derived from Wikipedia data using NLP analysis 
        and should not be taken as definitive rankings. 
        <a href="https://wikipedia.org" target="_blank" rel="noopener" className="underline ml-1">
          Powered by Wikipedia
        </a>
      </p>
    </div>
  );
}

