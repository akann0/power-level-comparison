interface LoadingScreenProps {
  entityA: string;
  entityB: string;
}

/* Animated loading screen shown during comparison analysis */
export function LoadingScreen({ entityA, entityB }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Animated VS icon */}
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-entity-blue animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full border-4 border-entity-red animate-ping opacity-20 animation-delay-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display font-black text-3xl text-white">VS</span>
            </div>
          </div>
        </div>

        <h2 className="font-display font-bold text-2xl text-white mb-2">
          Analyzing Power Levels
        </h2>
        
        <p className="text-slate-400 mb-6">
          <span className="text-entity-blue">{entityA}</span>
          {' vs '}
          <span className="text-entity-red">{entityB}</span>
        </p>

        <div className="flex flex-col gap-2 text-sm text-slate-500">
          <p className="animate-pulse">Fetching Wikipedia data...</p>
          <p className="animate-pulse" style={{ animationDelay: '200ms' }}>Extracting attributes...</p>
          <p className="animate-pulse" style={{ animationDelay: '400ms' }}>Calculating scores...</p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 h-2 bg-slate-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-entity-blue via-purple-500 to-entity-red animate-progressBar" />
        </div>
      </div>
    </div>
  );
}

