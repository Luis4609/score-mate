import { GameConfig } from "@/lib/types";

export const gameConfigs: GameConfig[] = [
  {
    name: "Dómino",
    value: "domino",
    maxTeams: 2,
    maxScore: 200,
  },
  {
    name: "Pantano",
    value: "pantano",
    maxTeams: 2,
    maxScore: 500,
  },
  {
    name: "Póker",
    value: "pocker",
    maxTeams: 6,
    maxScore: 200,
  },
];
