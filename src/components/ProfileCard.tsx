import { Entity } from '../types';

interface ProfileCardProps {
  entity: Entity;
  side: 'left' | 'right';
  overallScore: number;
  isWinner: boolean;
}

/* Displays entity profile with image, name, and overall score */
export function ProfileCard({ entity, side, overallScore, isWinner }: ProfileCardProps) {
  const accentColor = side === 'left' ? 'bg-entity-blue' : 'bg-entity-red';
  const textColor = side === 'left' ? 'text-entity-blue' : 'text-entity-red';
  const glowClass = isWinner ? 'glow-gold ring-4 ring-winner-gold' : '';

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-2xl bg-slate-800/60 backdrop-blur ${glowClass}`}>
      {isWinner && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-winner-gold text-black font-display font-bold text-sm rounded-full">
          WINNER
        </div>
      )}
      
      <div className={`relative w-32 h-32 rounded-2xl overflow-hidden border-4 ${side === 'left' ? 'border-entity-blue' : 'border-entity-red'}`}>
        {entity.thumbnail ? (
          <img src={entity.thumbnail} alt={entity.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-700 flex items-center justify-center text-4xl text-slate-500">
            {entity.title.charAt(0)}
          </div>
        )}
      </div>

      <h2 className="mt-4 font-display font-bold text-xl text-white text-center">
        {entity.title}
      </h2>
      
      <p className="mt-1 text-sm text-slate-400 text-center line-clamp-2 max-w-[200px]">
        {entity.extract?.split('.')[0] || 'Wikipedia entity'}
      </p>

      <div className="mt-4 flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-display">Power Level</span>
        <span className={`font-mono font-bold text-4xl ${textColor}`}>{overallScore}</span>
      </div>
    </div>
  );
}

