export enum GamePhase {
  SETUP = 'SETUP',
  LEAGUE = 'LEAGUE',
  KNOCKOUT = 'KNOCKOUT',
  FINISHED = 'FINISHED',
}

export interface Player {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  wickets: number;
  overs: number;
  maidens: number;
  runsConceded: number;
}

export interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  runsFor: number;
  runsAgainst: number;
  wicketsFor: number;
  wicketsAgainst: number;
  points: number;
}

export interface Team {
  id: number;
  name: string;
  color: string;
  batters: Player[];
  bowlers: Player[];
  stats: TeamStats;
}

export interface Fixture {
  home: Team;
  away: Team;
  homeScore: number | null;
  awayScore: number | null;
  homeWickets: number | null;
  awayWickets: number | null;
  commentary: string | null;
  played: boolean;
}

export interface KnockoutMatch {
  name: string;
  home: Team;
  away: Team;
}

export interface MatchResult {
  match: KnockoutMatch;
  homeScore: number;
  awayScore: number;
  homeWickets: number;
  awayWickets: number;
  winner: Team;
  commentary: string;
}

export interface KnockoutState {
    stage: number;
    matches: KnockoutMatch[];
    results: MatchResult[];
}

export interface PopupState {
  type: null | 'teamStats' | 'matchHistory' | 'leagueAwards';
  data?: any;
}

export interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error';
}

// AI Service Types
export interface AIMatchResult {
    homeScore: number;
    awayScore: number;
    homeWickets: number;
    awayWickets: number;
    commentary: string;
}
