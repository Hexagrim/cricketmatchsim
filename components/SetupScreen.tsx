import React, { useState, useMemo } from 'react';

interface SetupScreenProps {
  onStart: (teamCount: number, teamNames: string[]) => void;
  maxTeams: number;
  isLoading: boolean;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, maxTeams, isLoading }) => {
  const [teamCount, setTeamCount] = useState(8);
  const [teamNames, setTeamNames] = useState<string[]>(Array(maxTeams).fill('').map((_, i) => `Team ${i + 1}`));

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(2, Math.min(maxTeams, parseInt(e.target.value, 10) || 2));
    setTeamCount(count);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...teamNames];
    newNames[index] = name;
    setTeamNames(newNames);
  };

  const handleStartClick = () => {
    const finalNames = teamNames.slice(0, teamCount).map((name, i) => name.trim() || `Team ${i + 1}`);
    onStart(teamCount, finalNames);
  };

  const teamNameInputs = useMemo(() => {
    return Array.from({ length: teamCount }, (_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <label htmlFor={`teamName-${i}`} className="text-slate-400 w-24">Team {i + 1}</label>
        <input
          id={`teamName-${i}`}
          type="text"
          value={teamNames[i]}
          onChange={(e) => handleNameChange(i, e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
    ));
  }, [teamCount, teamNames]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-2xl border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-sky-300 mb-6">Tournament Setup</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label htmlFor="teamCount" className="block text-slate-300 mb-2">Number of Teams</label>
          <input
            id="teamCount"
            type="number"
            min="2"
            max={maxTeams}
            value={teamCount}
            onChange={handleCountChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="space-y-3">
          <label className="block text-slate-300">Team Names</label>
          {teamNameInputs}
        </div>
      </div>

      <button
        onClick={handleStartClick}
        disabled={isLoading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg text-lg transition duration-300 transform hover:scale-105"
      >
        {isLoading ? 'Generating...' : 'Start League'}
      </button>
    </div>
  );
};

export default SetupScreen;
