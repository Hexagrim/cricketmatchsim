import React, { useState, useCallback } from 'react';
import { GamePhase, type Team, type Fixture, type KnockoutState, type PopupState, type ToastState, type Player } from './types';
import { MAX_TEAMS, SAMPLE_BATTERS, SAMPLE_BOWLERS } from './constants';
import { simulateAIMatch } from './services/geminiService';

import SetupScreen from './components/SetupScreen';
import LeagueScreen from './components/LeagueScreen';
import KnockoutScreen from './components/KnockoutScreen';
import Popup from './components/Popup';
import TeamStatsPopup from './components/TeamStatsPopup';
import MatchHistoryPopup from './components/MatchHistoryPopup';
import AIToast from './components/AIToast';

// --- UTILITY FUNCTIONS ---
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const App: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.SETUP);
  const [teams, setTeams] = useState<Team[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [knockoutState, setKnockoutState] = useState<KnockoutState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState>({ type: null });
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [matchHistory, setMatchHistory] = useState<Fixture[]>([]);

  // --- TOAST MANAGEMENT ---
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const newToast = { id: Date.now(), message, type };
    setToasts(prev => [newToast, ...prev]);
  };
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  // --- TEAM & FIXTURE GENERATION ---
  const generatePlayer = (name: string): Player => ({
    name, runs: 0, balls: 0, fours: 0, sixes: 0, wickets: 0, overs: 0, maidens: 0, runsConceded: 0,
  });

  const generateTeams = (count: number, customNames: string[]) => {
    const newTeams: Team[] = [];
    const usedColors = new Set<string>();
    const getColor = () => {
        let color: string;
        do {
            color = `hsl(${randomInt(0, 360)}, 60%, 45%)`;
        } while (usedColors.has(color));
        usedColors.add(color);
        return color;
    };

    for (let i = 0; i < count; i++) {
        const shuffledBatters = shuffleArray([...SAMPLE_BATTERS]);
        const shuffledBowlers = shuffleArray([...SAMPLE_BOWLERS]);
        newTeams.push({
            id: i,
            name: customNames[i] || `Team ${i + 1}`,
            color: getColor(),
            batters: shuffledBatters.slice(0, 7).map(name => generatePlayer(name)),
            bowlers: shuffledBowlers.slice(0, 4).map(name => generatePlayer(name)),
            stats: { played: 0, wins: 0, draws: 0, losses: 0, runsFor: 0, runsAgainst: 0, wicketsFor: 0, wicketsAgainst: 0, points: 0 },
        });
    }
    return newTeams;
  };

  const generateFixtures = (teamsForFixtures: Team[]) => {
      const newFixtures: Fixture[] = [];
      for (let i = 0; i < teamsForFixtures.length; i++) {
          for (let j = 0; j < teamsForFixtures.length; j++) {
              if (i !== j) {
                  newFixtures.push({
                      home: teamsForFixtures[i], away: teamsForFixtures[j],
                      homeScore: null, awayScore: null, homeWickets: null, awayWickets: null,
                      commentary: null, played: false
                  });
              }
          }
      }
      setFixtures(shuffleArray(newFixtures));
  };
  
  const handleStartLeague = (teamCount: number, teamNames: string[]) => {
      const generatedTeams = generateTeams(teamCount, teamNames);
      setTeams(generatedTeams);
      generateFixtures(generatedTeams);
      setGamePhase(GamePhase.LEAGUE);
  };

  // --- STATS & SIMULATION LOGIC ---
  const distributePlayerStats = (match: Fixture) => {
    if (match.homeScore === null || match.awayScore === null || match.homeWickets === null || match.awayWickets === null) return;
    
    // Simple distribution logic
    let homeRunsToDistribute = match.homeScore;
    while(homeRunsToDistribute > 0) {
      const batter = match.home.batters[randomInt(0, match.home.batters.length - 1)];
      const runs = Math.min(homeRunsToDistribute, randomInt(1, 6));
      batter.runs += runs;
      batter.balls++;
      if (runs === 4) batter.fours++;
      if (runs === 6) batter.sixes++;
      homeRunsToDistribute -= runs;
    }

    let awayRunsToDistribute = match.awayScore;
     while(awayRunsToDistribute > 0) {
      const batter = match.away.batters[randomInt(0, match.away.batters.length - 1)];
      const runs = Math.min(awayRunsToDistribute, randomInt(1, 6));
      batter.runs += runs;
      batter.balls++;
      if (runs === 4) batter.fours++;
      if (runs === 6) batter.sixes++;
      awayRunsToDistribute -= runs;
    }

    for(let i=0; i<match.homeWickets; i++) match.away.bowlers[randomInt(0, match.away.bowlers.length-1)].wickets++;
    for(let i=0; i<match.awayWickets; i++) match.home.bowlers[randomInt(0, match.home.bowlers.length-1)].wickets++;
  };
  
  const updateTeamStats = (match: Fixture) => {
      if (match.homeScore === null || match.awayScore === null) return;

      const updateStats = (team: Team, runsFor: number, runsAgainst: number, wicketsFor: number, wicketsAgainst: number, result: 'win' | 'loss' | 'draw') => {
          team.stats.played++;
          team.stats.runsFor += runsFor;
          team.stats.runsAgainst += runsAgainst;
          team.stats.wicketsFor += wicketsFor;
          team.stats.wicketsAgainst += wicketsAgainst;
          if (result === 'win') { team.stats.wins++; team.stats.points += 2; }
          else if (result === 'loss') { team.stats.losses++; }
          else { team.stats.draws++; team.stats.points += 1; }
      };

      if (match.homeScore > match.awayScore) {
          updateStats(match.home, match.homeScore, match.awayScore, match.homeWickets!, match.awayWickets!, 'win');
          updateStats(match.away, match.awayScore, match.homeScore, match.awayWickets!, match.homeWickets!, 'loss');
      } else if (match.awayScore > match.homeScore) {
          updateStats(match.home, match.homeScore, match.awayScore, match.homeWickets!, match.awayWickets!, 'loss');
          updateStats(match.away, match.awayScore, match.homeScore, match.awayWickets!, match.homeWickets!, 'win');
      } else {
          updateStats(match.home, match.homeScore, match.awayScore, match.homeWickets!, match.awayWickets!, 'draw');
          updateStats(match.away, match.awayScore, match.homeScore, match.awayWickets!, match.homeWickets!, 'draw');
      }
  };

  const processMatchResult = (matchIndex: number, result: { homeScore: number, awayScore: number, homeWickets: number, awayWickets: number, commentary: string }) => {
    setFixtures(prev => {
        const newFixtures = [...prev];
        const match = { ...newFixtures[matchIndex], ...result, played: true };
        newFixtures[matchIndex] = match;

        updateTeamStats(match);
        distributePlayerStats(match);
        setMatchHistory(hist => [match, ...hist]);

        return newFixtures;
    });
    addToast(result.commentary);
  };
  
  const handleSimulateNextMatch = useCallback(async () => {
    if (currentMatchIndex >= fixtures.length) return;
    setIsLoading(true);
    try {
        const matchToSim = fixtures[currentMatchIndex];
        const result = await simulateAIMatch(matchToSim.home, matchToSim.away);
        processMatchResult(currentMatchIndex, result);
        setCurrentMatchIndex(prev => prev + 1);
    } catch (error) {
        addToast("Failed to simulate match.", 'error');
    } finally {
        setIsLoading(false);
    }
  }, [currentMatchIndex, fixtures]);

  const handleSimulateAllLeague = useCallback(async () => {
    setIsLoading(true);
    let tempIndex = currentMatchIndex;
    const matchesToSimulate = fixtures.slice(tempIndex);

    for (const match of matchesToSimulate) {
      try {
          const result = await simulateAIMatch(match.home, match.away);
          processMatchResult(tempIndex, result);
          tempIndex++;
          // A small delay to make the UI feel responsive and show progress
          await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
          addToast(`Failed to simulate match for ${match.home.name} vs ${match.away.name}.`, 'error');
      }
    }
    setCurrentMatchIndex(tempIndex);
    setIsLoading(false);
  }, [currentMatchIndex, fixtures]);


  // --- KNOCKOUT STAGE ---
  const handleStartKnockouts = () => {
      const sortedTeams = [...teams].sort(
        (a, b) => b.stats.points - a.stats.points || (b.stats.runsFor - b.stats.runsAgainst) - (a.stats.runsFor - a.stats.runsAgainst)
      );
      const knockoutSize = [32, 16, 8, 4].find(p => sortedTeams.length >= p) || 4;
      const knockoutTeams = shuffleArray(sortedTeams.slice(0, knockoutSize));
      
      const initialMatches = [];
      for (let i = 0; i < knockoutTeams.length; i += 2) {
          initialMatches.push({
              name: `Round of ${knockoutTeams.length}`,
              home: knockoutTeams[i],
              away: knockoutTeams[i + 1],
          });
      }
      setKnockoutState({ stage: 0, matches: initialMatches, results: [] });
      setGamePhase(GamePhase.KNOCKOUT);
  };

  const handleSimulateKnockoutMatch = useCallback(async () => {
    if (!knockoutState || knockoutState.stage >= knockoutState.matches.length) return;
    setIsLoading(true);
    try {
        const match = knockoutState.matches[knockoutState.stage];
        const result = await simulateAIMatch(match.home, match.away);
        const winner = result.homeScore > result.awayScore ? match.home : match.away;
        
        const newResult = { ...result, match, winner };
        
        setKnockoutState(prev => {
            if (!prev) return null;
            const newResults = [...prev.results, newResult];
            let newStage = prev.stage + 1;
            let newMatches = [...prev.matches];

            // Check if round is over and create next round
            if (newStage === newMatches.length && newResults.length % 2 === 0 && newResults.length > 0) {
                 const winners = newResults.slice(-newMatches.length).map(r => r.winner);
                 if (winners.length > 1) {
                     newMatches = [];
                     for (let i = 0; i < winners.length; i+=2) {
                         newMatches.push({ name: `Round of ${winners.length}`, home: winners[i], away: winners[i+1] });
                     }
                     newStage = 0; // Reset stage for the new round
                 }
            }
            
            return { ...prev, results: newResults, stage: newStage, matches: newMatches };
        });

        addToast(`${winner.name} wins! ${result.commentary}`);

    } catch(error) {
        addToast("Failed to simulate knockout match.", 'error');
    } finally {
        setIsLoading(false);
    }
  }, [knockoutState]);

  const handleRestart = () => {
      setGamePhase(GamePhase.SETUP);
      setTeams([]);
      setFixtures([]);
      setCurrentMatchIndex(0);
      setKnockoutState(null);
      setMatchHistory([]);
  };

  // --- POPUP MANAGEMENT ---
  const openPopup = (type: PopupState['type'], data?: any) => setPopup({ type, data });
  const closePopup = () => setPopup({ type: null });

  // --- RENDER LOGIC ---
  const renderContent = () => {
    switch (gamePhase) {
      case GamePhase.LEAGUE:
        return <LeagueScreen
          teams={teams}
          fixtures={fixtures}
          currentMatchIndex={currentMatchIndex}
          onSimulateNext={handleSimulateNextMatch}
          onSimulateAll={handleSimulateAllLeague}
          onStartKnockouts={handleStartKnockouts}
          onShowTeamStats={(team) => openPopup('teamStats', team)}
          onShowMatchHistory={() => openPopup('matchHistory')}
          isLoading={isLoading}
        />;
      case GamePhase.KNOCKOUT:
        return <KnockoutScreen 
            knockoutState={knockoutState}
            onSimulateNext={handleSimulateKnockoutMatch}
            onRestart={handleRestart}
            isLoading={isLoading}
        />;
      case GamePhase.SETUP:
      default:
        return <SetupScreen onStart={handleStartLeague} maxTeams={MAX_TEAMS} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-6xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
            Gemini Cricket League
        </h1>
        <p className="text-slate-400 mt-2">An AI-powered cricket tournament simulator</p>
      </header>
      
      <main className="w-full max-w-6xl">
        {renderContent()}
      </main>

      {popup.type && (
        <Popup onClose={closePopup}>
          {popup.type === 'teamStats' && <TeamStatsPopup team={popup.data} />}
          {popup.type === 'matchHistory' && <MatchHistoryPopup history={matchHistory} />}
        </Popup>
      )}

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <AIToast key={toast.id} {...toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  );
};

export default App;
