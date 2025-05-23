// src/lib/types.ts

// Describes the properties for the game alert
export interface GameAlertData {
  title: string;
  description: string;
  variant: "default" | "destructive";
  winningTeamName?: string; // Optional: to display the name of the winning team
}

// Represents a team with a name and score
export interface Team {
  name:string;
  score: number;
  // Consider adding a unique `id: string;` here for more stable keys in lists,
  // if teams can be reordered or frequently removed/added in the middle.
  // For now, we'll proceed without it to keep changes focused.
}

// Represents the points to be added to a team, indexed by team's array index
export interface PointsToAdd {
  [key: number]: string;
}

// Configuration for a specific game type
export interface GameConfig {
  name: string;
  value: string;
  maxTeams: number;
  maxScore: number;
}

// Represents an entry in the game's history, capturing a snapshot of team scores
export interface HistoryEntry {
  snapshot: Team[]; // A snapshot of all teams and their scores at this point in history
  changedTeamIndex: number | null; // Index of the team whose score changed to create this entry, or null if it's an initial state or reset
  phaseIdentifier?: string; // Optional identifier for the phase of the game
}

// Interface for exported game data
export interface ExportedGameData {
  gameConfigValue: string;
  teams: Team[];
  history: HistoryEntry[];
  gameVersion: string;
}
