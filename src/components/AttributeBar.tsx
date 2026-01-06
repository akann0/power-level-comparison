import { useState } from 'react';
import { AttributeScore } from '../types';

interface AttributeBarProps {
  attribute: AttributeScore;
  index: number;
}

/* Animated comparison bar showing head-to-head attribute scores */
export function AttributeBar({ attribute, index }: AttributeBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const winner = attribute.scoreA > attribute.scoreB ? 'A' : 
                 attribute.scoreB > attribute.scoreA ? 'B' : 'tie';
  
  const maxScore = Math.max(attribute.scoreA, attribute.scoreB, 1);
  const widthA = (attribute.scoreA / 100) * 100;
  const widthB = (attribute.scoreB / 100) * 100;

  return (
    <div 
      className="py-3 cursor-pointer hover:bg-slate-800/50 rounded-lg px-3 transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-sm uppercase tracking-wider text-slate-300">
          {attribute.name}
        </span>
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className={winner === 'A' ? 'text-entity-blue font-bold' : 'text-slate-400'}>
            {attribute.scoreA}
          </span>
          <span className="text-slate-600">vs</span>
          <span className={winner === 'B' ? 'text-entity-red font-bold' : 'text-slate-400'}>
            {attribute.scoreB}
          </span>
        </div>
      </div>

      <div className="flex gap-1 h-3">
        {/* Entity A bar (grows from right to left) */}
        <div className="flex-1 flex justify-end bg-slate-700/50 rounded-l-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-l from-entity-blue to-blue-400 rounded-l-full bar-animate"
            style={{ '--fill-width': `${widthA}%`, width: `${widthA}%` } as React.CSSProperties}
          />
        </div>
        
        {/* Entity B bar (grows from left to right) */}
        <div className="flex-1 bg-slate-700/50 rounded-r-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-entity-red to-red-400 rounded-r-full bar-animate"
            style={{ '--fill-width': `${widthB}%`, width: `${widthB}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Confidence indicators */}
      <div className="flex justify-between mt-1 text-xs text-slate-500">
        <span>Confidence: {Math.round(attribute.confidenceA * 100)}%</span>
        <span>Confidence: {Math.round(attribute.confidenceB * 100)}%</span>
      </div>

      {/* Expanded evidence section */}
      {isExpanded && (
        <div className="mt-3 grid grid-cols-2 gap-4 text-xs animate-fadeIn">
          <div className="p-3 bg-slate-800 rounded-lg border border-entity-blue/30">
            <p className="text-entity-blue font-semibold mb-1">Evidence:</p>
            <p className="text-slate-300">
              {attribute.rawValueA || attribute.evidenceA || 'No specific data found'}
            </p>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg border border-entity-red/30">
            <p className="text-entity-red font-semibold mb-1">Evidence:</p>
            <p className="text-slate-300">
              {attribute.rawValueB || attribute.evidenceB || 'No specific data found'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

