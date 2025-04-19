export interface AlertProps {
  title: string;
  description: string;
  variant: "default" | "destructive";
}

export interface Team {
  name: string;
  score: number;
}

export interface PointsToAdd {
  [key: number]: string;
}

export interface GameConfig {
  name: string;
  value: string;
  maxTeams: number;
  maxScore: number;
}

export interface HistoryEntry {
  snapshot: Team[];
  changedTeamIndex: number | null;
}
