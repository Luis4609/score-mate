export interface AlertProps {
  title: string;
  description: string;
  variant: "default" | "destructive"
}

export interface Team {
  name: string;
  score: number;
}

export interface PointsToAdd {
  [key: number]: string;
}

// game config
export const gameConfigs = [
    { value: "domino", label: "Dómino", maxTeams: 2, maxScore: 200 },
    { value: "pantano", label: "Pantano", maxTeams: 6, maxScore: 500 },
    { value: "pocker", label: "Pocker", maxTeams: 6, maxScore: 15 },
  ];
  