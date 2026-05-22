// src/lib/types.ts

// Describes the properties for the game alert
export interface GameAlertData {
  title: string;
  description: string;
  variant: "default" | "destructive";
  winningTeamName?: string; // Optional: to display the name of the winning team
}

// Represents a team/participant with a name and score
export interface Team {
  id?: string; // Optional unique id for stable rendering keys
  name: string;
  score: number;
  players?: string[]; // Optional list of player names in this team/participant
}

// Represents the points to be added to a team, indexed by team's index
export interface PointsToAdd {
  [teamIndex: number]: string;
}

// Configuration for a specific game type
export interface GameConfig {
  name: string;
  value: string;
  mode: "individual" | "teams" | "both";
  winningCondition: "highest_wins" | "lowest_wins" | "none";
  defaultMaxScore: number;
  minPlayers: number;
  maxPlayers: number;
}

// Represents an entry in the game's history, capturing a snapshot of team scores
export interface HistoryEntry {
  snapshot: Team[]; // A snapshot of all teams and their scores at this point in history
  changedTeamIndex: number | null; // Index of the team whose score changed to create this entry, or null if it's an initial state or reset
}

