import React from 'react';
import type { Team } from '../types';

interface TeamStatsPopupProps {
  team: Team;
}

const TeamStatsPopup: React.FC<TeamStatsPopupProps> = ({ team }) => {
  if (!team) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4" style={{ color: team.color }}>{team.name} - Stats</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-slate-900/50 p-4 rounded-lg mb-6">
        <div><p className="text-slate-400 text-sm">Played</p><p className="text-xl font-bold">{team.stats.played}</p></div>
        <div><p className="text-slate-400 text-sm">Wins</p><p className="text-xl font-bold text-green-400">{team.stats.wins}</p></div>
        <div><p className="text-slate-400 text-sm">Losses</p><p className="text-xl font-bold text-red-400">{team.stats.losses}</p></div>
        <div><p className="text-slate-400 text-sm">Points</p><p className="text-xl font-bold text-amber-400">{team.stats.points}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Batters</h3>
            <ul className="space-y-1 text-slate-300">
                {team.batters.map(p => <li key={p.name} className="flex justify-between"><span>{p.name}</span> <span className="font-mono text-white">{p.runs} runs</span></li>)}
            </ul>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-sky-300 mb-2">Bowlers</h3>
            <ul className="space-y-1 text-slate-300">
                {team.bowlers.map(p => <li key={p.name} className="flex justify-between"><span>{p.name}</span> <span className="font-mono text-white">{p.wickets} wkts</span></li>)}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsPopup;
