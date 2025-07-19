import React from 'react';
import type { KnockoutState } from '../types';

interface KnockoutScreenProps {
  knockoutState: KnockoutState | null;
  onSimulateNext: () => void;
  onRestart: () => void;
  isLoading: boolean;
}

const KnockoutScreen: React.FC<KnockoutScreenProps> = ({ knockoutState, onSimulateNext, onRestart, isLoading }) => {
  if (!knockoutState) {
    return (
      <div className="text-center p-8">
        <p className="text-xl text-slate-400">Loading knockout stage...</p>
      </div>
    );
  }

  const { matches, stage, results } = knockoutState;
  const currentMatch = stage < matches.length ? matches[stage] : null;
  const champion = results.length > 0 && matches.length === 1 && stage === 1 ? results[results.length - 1].winner : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-amber-300 mb-6">Knockout Stage</h2>

      {champion ? (
        <div className="text-center py-8">
            <p className="text-xl text-slate-300">And the winner is...</p>
            <h3 className="text-5xl font-extrabold my-4" style={{color: champion.color}}>{champion.name}</h3>
            <p className="text-2xl font-bold text-amber-400">Tournament Champions!</p>
            <button onClick={onRestart} className="mt-8 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition text-lg">
                Play Again
            </button>
        </div>
      ) : currentMatch ? (
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold text-sky-300 mb-2">{currentMatch.name}</h3>
          <p className="text-2xl font-semibold">
            <span style={{ color: currentMatch.home.color }}>{currentMatch.home.name}</span>
            <span className="text-slate-400 mx-2">vs</span>
            <span style={{ color: currentMatch.away.color }}>{currentMatch.away.name}</span>
          </p>
          <button onClick={onSimulateNext} disabled={isLoading} className="mt-6 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition text-lg">
            {isLoading ? 'Simulating...' : 'Simulate Match'}
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
             <p className="text-xl text-slate-300">Something went wrong, unable to determine next match.</p>
             <button onClick={onRestart} className="mt-8 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-lg transition text-lg">
                Restart Tournament
            </button>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-center text-slate-400 mt-8 mb-4 border-b border-slate-700 pb-2">Match Results</h4>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
            {results.map((res, index) => (
              <div key={index} className="bg-slate-900/50 p-3 rounded-lg text-sm">
                <p className="font-bold text-slate-300">{res.match.name}: {res.match.home.name} vs {res.match.away.name}</p>
                <p>{res.match.home.name} {res.homeScore}/{res.homeWickets} - {res.match.away.name} {res.awayScore}/{res.awayWickets}</p>
                <p>
                  <span className="font-semibold text-amber-400">Winner:</span>
                  <span className="font-bold ml-2" style={{ color: res.winner.color }}>{res.winner.name}</span>
                </p>
                 <p className="text-slate-400 italic mt-1">"{res.commentary}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnockoutScreen;
