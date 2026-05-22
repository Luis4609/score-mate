import { GameConfig } from "@/lib/types";

export const gameConfigs: GameConfig[] = [
  {
    name: "Dómino",
    value: "domino",
    mode: "both",
    winningCondition: "highest_wins",
    defaultMaxScore: 200,
    minPlayers: 2,
    maxPlayers: 4,
  },
  {
    name: "Pantano",
    value: "pantano",
    mode: "individual",
    winningCondition: "lowest_wins",
    defaultMaxScore: 500,
    minPlayers: 2,
    maxPlayers: 6,
  },
  {
    name: "Póker",
    value: "pocker",
    mode: "individual",
    winningCondition: "none",
    defaultMaxScore: 0,
    minPlayers: 2,
    maxPlayers: 10,
  },
];

