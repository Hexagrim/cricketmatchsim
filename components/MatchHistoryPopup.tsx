import React from 'react';
import type { Fixture } from '../types';

interface MatchHistoryPopupProps {
  history: Fixture[];
}

const MatchHistoryPopup: React.FC<MatchHistoryPopupProps> = ({ history }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sky-300">Match History</h2>
      {history.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No matches have been played yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((match, index) => (
            <div key={index} className="bg-slate-900/50 p-3 rounded-lg">
              <p className="text-lg font-semibold">
                <span style={{ color: match.home.color }}>{match.home.name}</span>
                <span className="text-slate-300 mx-2">{match.homeScore}/{match.homeWickets}</span>
                <span className="text-slate-400">vs</span>
                <span className="text-slate-300 mx-2">{match.awayScore}/{match.awayWickets}</span>
                <span style={{ color: match.away.color }}>{match.away.name}</span>
              </p>
              {match.commentary && <p className="text-sm text-slate-400 italic mt-1">"{match.commentary}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchHistoryPopup;
