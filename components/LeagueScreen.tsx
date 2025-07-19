import React from 'react';
import type { Team, Fixture } from '../types';

interface LeagueScreenProps {
  teams: Team[];
  fixtures: Fixture[];
  currentMatchIndex: number;
  onSimulateNext: () => void;
  onSimulateAll: () => void;
  onStartKnockouts: () => void;
  onShowTeamStats: (team: Team) => void;
  onShowMatchHistory: () => void;
  isLoading: boolean;
}

const LeagueScreen: React.FC<LeagueScreenProps> = ({
  teams, fixtures, currentMatchIndex, onSimulateNext, onSimulateAll, onStartKnockouts, onShowTeamStats, onShowMatchHistory, isLoading
}) => {
  
  const sortedTeams = [...teams].sort(
    (a, b) => b.stats.points - a.stats.points || (b.stats.runsFor - b.stats.runsAgainst) - (a.stats.runsFor - a.stats.runsAgainst)
  );

  const allMatchesPlayed = currentMatchIndex >= fixtures.length;
  const nextMatch = allMatchesPlayed ? null : fixtures[currentMatchIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* Left Panel: Controls & Next Match */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-bold text-sky-300 mb-4">Controls</h3>
          <div className="space-y-3">
            <button onClick={onSimulateNext} disabled={isLoading || allMatchesPlayed} className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
              {isLoading ? 'Simulating...' : 'Simulate Next Match'}
            </button>
            <button onClick={onSimulateAll} disabled={isLoading || allMatchesPlayed} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-white font-bold py-3 rounded-lg transition">
              {isLoading ? 'Simulating...' : 'Simulate All League Matches'}
            </button>
            <button onClick={onShowMatchHistory} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-lg transition">
              View Match History
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-bold text-sky-300 mb-4">
            {allMatchesPlayed ? "League Finished" : `Next Match (${currentMatchIndex + 1}/${fixtures.length})`}
          </h3>
          {allMatchesPlayed ? (
             <div className="text-center py-4">
                <p className="text-slate-300 mb-4">All league matches have been played.</p>
                <button onClick={onStartKnockouts} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition text-lg">
                    Proceed to Knockouts
                </button>
            </div>
          ) : nextMatch && (
            <div className="text-center">
              <p className="text-2xl font-semibold">
                <span style={{ color: nextMatch.home.color }}>{nextMatch.home.name}</span>
                <span className="text-slate-400 mx-2">vs</span>
                <span style={{ color: nextMatch.away.color }}>{nextMatch.away.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: League Table */}
      <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-slate-700">
        <h3 className="text-xl font-bold text-sky-300 mb-4">League Table</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-600 text-slate-400 text-sm">
                <th className="p-2">#</th>
                <th className="p-2">Team</th>
                <th className="p-2 text-center">P</th>
                <th className="p-2 text-center">W</th>
                <th className="p-2 text-center">L</th>
                <th className="p-2 text-center">D</th>
                <th className="p-2 text-center">Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, index) => (
                <tr key={team.id} className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer" onClick={() => onShowTeamStats(team)}>
                  <td className="p-2 font-semibold">{index + 1}</td>
                  <td className="p-2 font-bold" style={{ color: team.color }}>{team.name}</td>
                  <td className="p-2 text-center">{team.stats.played}</td>
                  <td className="p-2 text-center">{team.stats.wins}</td>
                  <td className="p-2 text-center">{team.stats.losses}</td>
                  <td className="p-2 text-center">{team.stats.draws}</td>
                  <td className="p-2 text-center font-bold text-amber-300">{team.stats.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeagueScreen;
