import { beforeEach, describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScoreMateGame } from "./useScoreGame";
import { GameConfig } from "@/lib/types";

describe("useScoreMateGame hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Helpers to handle React rendering cycles during tests
  const addTeamHelper = (result: any, name: string) => {
    act(() => {
      result.current.setNewTeamName(name);
    });
    act(() => {
      result.current.addTeam();
    });
  };

  const addScoreHelper = (result: any, teamIndex: number, points: string) => {
    act(() => {
      result.current.setPointsToAdd({ [teamIndex]: points });
    });
    act(() => {
      result.current.handleCustomPoints(teamIndex);
    });
  };

  it("should initialize with default game settings", () => {
    const { result } = renderHook(() => useScoreMateGame());
    expect(result.current.gameConfig.value).toBe("domino");
    expect(result.current.teams).toEqual([]);
    expect(result.current.history).toEqual([]);
    expect(result.current.gameAlert).toBeNull();
  });

  it("should support adding teams and enforce max player limits", () => {
    const { result } = renderHook(() => useScoreMateGame());

    // Add first team
    addTeamHelper(result, "Team A");
    expect(result.current.teams).toEqual([{ name: "Team A", score: 0 }]);
    expect(result.current.history[0].snapshot).toEqual([{ name: "Team A", score: 0 }]);

    // Add up to limit for domino (max 4 players)
    addTeamHelper(result, "Team B");
    addTeamHelper(result, "Team C");
    addTeamHelper(result, "Team D");
    
    expect(result.current.teams.length).toBe(4);

    // Try adding a 5th team (should trigger warning/no-op)
    addTeamHelper(result, "Team E");
    expect(result.current.teams.length).toBe(4);
  });

  it("should correctly record and add scores", () => {
    const { result } = renderHook(() => useScoreMateGame());

    addTeamHelper(result, "Team A");
    addTeamHelper(result, "Team B");

    // Add custom points (e.g. +50 to Team A)
    addScoreHelper(result, 0, "50");

    expect(result.current.teams[0].score).toBe(50);
    expect(result.current.teams[1].score).toBe(0);
    expect(result.current.history.length).toBe(3); // Initial Team A creation (1), Team B creation (2), score addition (3)
  });

  it("should trigger game over and trophy for highest score when winningCondition is highest_wins", () => {
    const { result } = renderHook(() => useScoreMateGame());

    addTeamHelper(result, "Team A");
    
    // Add 200 points to Team A (Domino default Max Score is 200)
    addScoreHelper(result, 0, "200");

    expect(result.current.gameAlert).not.toBeNull();
    expect(result.current.gameAlert?.winningTeamName).toBe("Team A");
    expect(result.current.gameAlert?.title).toBe("¡FIN DE LA PARTIDA!");
  });

  it("should end game and award winner to lowest score when winningCondition is lowest_wins (Pantano)", () => {
    const { result } = renderHook(() => useScoreMateGame());

    // Switch game to Pantano (limit 500, lowest wins)
    const pantanoConfig = result.current.allConfigs.find(c => c.value === "pantano");
    expect(pantanoConfig).toBeDefined();
    
    act(() => {
      result.current.setGameConfig(pantanoConfig as GameConfig);
    });

    addTeamHelper(result, "Team A");
    addTeamHelper(result, "Team B");

    // Team B gets 100 points
    addScoreHelper(result, 1, "100");

    // Team A hits limit (500 points)
    addScoreHelper(result, 0, "500");

    // Team A hit 500, ending the game, but Team B (100) should be declared the winner!
    expect(result.current.gameAlert).not.toBeNull();
    expect(result.current.gameAlert?.winningTeamName).toBe("Team B"); // Winner
    expect(result.current.gameAlert?.triggeringTeamName).toBe("Team A"); // Triggerer
    expect(result.current.gameAlert?.description).toContain("Ganador: Team B con 100 pts.");
  });

  it("should allow editing history and correctly propagate the recalculation", () => {
    const { result } = renderHook(() => useScoreMateGame());

    addTeamHelper(result, "Team A"); // Round 1: Team A = 0
    
    // Add 10 points (Round 2)
    addScoreHelper(result, 0, "10"); // Round 2: Team A = 10
    
    // Add 20 points (Round 3)
    addScoreHelper(result, 0, "20"); // Round 3: Team A = 30

    expect(result.current.teams[0].score).toBe(30);

    // Edit Round 2: change Team A score from 10 to 15
    // Note: index 0 = Team A added (score 0), index 1 = Team A +10 (score 10)
    act(() => {
      result.current.editScoreInHistory(1, 0, 15);
    });

    // The score should propagate: Round 1 (0) -> Round 2 (15) -> Round 3 (15 + 20 = 35)
    expect(result.current.teams[0].score).toBe(35);
  });

  it("should restart a game maintaining participants but resetting scores", () => {
    const { result } = renderHook(() => useScoreMateGame());

    addTeamHelper(result, "Team A");
    addScoreHelper(result, 0, "50");

    expect(result.current.teams[0].score).toBe(50);

    act(() => {
      result.current.restartGame();
    });

    expect(result.current.teams).toEqual([{ name: "Team A", score: 0 }]);
    expect(result.current.gameAlert).toBeNull();
  });

  it("should support custom presets creation and deletion", () => {
    const { result } = renderHook(() => useScoreMateGame());

    const myGame: GameConfig = {
      name: "My Game",
      value: "my_game",
      mode: "individual",
      winningCondition: "highest_wins",
      defaultMaxScore: 150,
      minPlayers: 2,
      maxPlayers: 6,
    };

    act(() => {
      result.current.saveCustomPreset(myGame);
    });

    // Verify it is added to allConfigs list
    expect(result.current.allConfigs.some(c => c.value === "my_game")).toBe(true);

    // Select custom game configuration
    act(() => {
      result.current.setGameConfig(result.current.allConfigs.find(c => c.value === "my_game") as GameConfig);
    });
    expect(result.current.gameConfig.name).toBe("My Game");

    // Delete custom preset
    act(() => {
      result.current.deleteCustomPreset("my_game");
    });
    expect(result.current.allConfigs.some(c => c.value === "my_game")).toBe(false);
    
    // Active game config should fall back to first config (Domino)
    expect(result.current.gameConfig.value).toBe("domino");
  });
});
