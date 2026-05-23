// src/modules/game/hooks/useScoreGame.ts
import {
  GameAlertData,
  GameConfig,
  HistoryEntry,
  PointsToAdd,
  Team,
} from "@/lib/types";
import { gameConfigs } from "@/modules/game/config/game-config";
import { useCallback, useEffect, useState, useRef } from "react";

export const useScoreMateGame = () => {
  // 1. Custom presets state loaded from localStorage
  const [customPresets, setCustomPresets] = useState<GameConfig[]>(() => {
    const saved = localStorage.getItem("score-mate-custom-presets");
    return saved ? JSON.parse(saved) : [];
  });

  // Combined game configs
  const allConfigs = [...gameConfigs, ...customPresets];

  // 2. Core states loaded from localStorage
  const [gameConfig, setGameConfig] = useState<GameConfig>(() => {
    const saved = localStorage.getItem("score-mate-current-config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing game config from localStorage", e);
      }
    }
    return gameConfigs[0];
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem("score-mate-teams");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing teams from localStorage", e);
      }
    }
    return [];
  });

  const [newTeamName, setNewTeamName] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({});

  const [gameAlert, setGameAlert] = useState<GameAlertData | null>(() => {
    const saved = localStorage.getItem("score-mate-game-alert");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing game alert from localStorage", e);
      }
    }
    return null;
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem("score-mate-history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing history from localStorage", e);
      }
    }
    return [];
  });

  // Ref to prevent resetting state on first render
  const isInitialMount = useRef(true);

  // Effect to reset game state when config changes (only on user action, not on mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setTeams([]);
    setGameAlert(null);
    setHistory([]);
    setNewTeamName("");
    setPointsToAdd({});
  }, [gameConfig.value]); // Trigger on value change

  // 3. Auto-save states to localStorage on change
  useEffect(() => {
    localStorage.setItem("score-mate-current-config", JSON.stringify(gameConfig));
  }, [gameConfig]);

  useEffect(() => {
    localStorage.setItem("score-mate-teams", JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem("score-mate-history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("score-mate-game-alert", JSON.stringify(gameAlert));
  }, [gameAlert]);

  useEffect(() => {
    localStorage.setItem("score-mate-custom-presets", JSON.stringify(customPresets));
  }, [customPresets]);

  // Custom presets management
  const saveCustomPreset = useCallback((preset: GameConfig) => {
    setCustomPresets((prev) => {
      const filtered = prev.filter((p) => p.value !== preset.value);
      return [...filtered, { ...preset, isCustom: true }];
    });
  }, []);

  const deleteCustomPreset = useCallback((value: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.value !== value));
    setGameConfig((current) => {
      if (current.value === value) {
        return gameConfigs[0];
      }
      return current;
    });
  }, []);

  // Helper to check winner
  const checkGameStatus = useCallback(
    (currentTeams: Team[]): { gameIsOver: boolean; winner: Team | null; triggerer: Team | null } => {
      if (gameConfig.defaultMaxScore <= 0 || currentTeams.length === 0) {
        return { gameIsOver: false, winner: null, triggerer: null };
      }

      // Check if any team has reached/exceeded the defaultMaxScore
      const triggeringTeam = currentTeams.find((t) => t.score >= gameConfig.defaultMaxScore);
      if (!triggeringTeam) {
        return { gameIsOver: false, winner: null, triggerer: null };
      }

      let winner: Team = currentTeams[0];
      if (gameConfig.winningCondition === "highest_wins") {
        winner = currentTeams.reduce((best, t) => (t.score > best.score ? t : best), currentTeams[0]);
      } else if (gameConfig.winningCondition === "lowest_wins") {
        winner = currentTeams.reduce((best, t) => (t.score < best.score ? t : best), currentTeams[0]);
      } else {
        // none
        return { gameIsOver: false, winner: null, triggerer: null };
      }

      return { gameIsOver: true, winner, triggerer: triggeringTeam };
    },
    [gameConfig.defaultMaxScore, gameConfig.winningCondition]
  );

  const addTeam = useCallback(() => {
    if (newTeamName.trim() !== "" && teams.length < gameConfig.maxPlayers) {
      const newTeamEntry: Team = { name: newTeamName.trim(), score: 0 };
      const newTeams = [...teams, newTeamEntry];
      setTeams(newTeams);
      setNewTeamName("");
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: [...newTeams], changedTeamIndex: null },
      ]);
    } else if (teams.length >= gameConfig.maxPlayers) {
      alert(
        `No puedes añadir más de ${gameConfig.maxPlayers} equipos para ${gameConfig.name}.`
      );
    }
  }, [newTeamName, teams, gameConfig.maxPlayers, gameConfig.name]);

  const addScore = useCallback(
    (teamIndex: number, points: number) => {
      const team = teams[teamIndex];
      if (!team) return;

      const newScore = team.score + points;
      const updatedTeams = teams.map((t, i) => {
        if (i === teamIndex) {
          const cappedScore = gameConfig.defaultMaxScore > 0
            ? Math.max(0, Math.min(newScore, gameConfig.defaultMaxScore))
            : Math.max(0, newScore);
          return { ...t, score: cappedScore };
        }
        return t;
      });

      setTeams(updatedTeams);
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: updatedTeams, changedTeamIndex: teamIndex },
      ]);

      const { gameIsOver, winner, triggerer } = checkGameStatus(updatedTeams);

      if (gameIsOver && winner && triggerer) {
        let description = "";
        if (gameConfig.winningCondition === "lowest_wins") {
          description = `¡El equipo ${triggerer.name} ha alcanzado la puntuación límite de ${gameConfig.defaultMaxScore}! Ganador: ${winner.name} con ${winner.score} pts.`;
        } else {
          description = `¡El equipo ${winner.name} ha alcanzado la puntuación máxima de ${gameConfig.defaultMaxScore}!`;
        }
        setGameAlert({
          title: "¡FIN DE LA PARTIDA!",
          description,
          variant: "destructive",
          winningTeamName: winner.name,
          triggeringTeamName: triggerer.name,
        });
      } else {
        setGameAlert(null);
      }
    },
    [teams, gameConfig.defaultMaxScore, gameConfig.winningCondition, checkGameStatus]
  );

  const handleCustomPoints = useCallback(
    (teamIndex: number) => {
      const pointsStr = pointsToAdd[teamIndex];
      const points = parseInt(pointsStr, 10);
      if (!isNaN(points) && points !== 0) {
        addScore(teamIndex, points);
      }
      setPointsToAdd((prevPointsToAdd) => ({
        ...prevPointsToAdd,
        [teamIndex]: "",
      }));
    },
    [pointsToAdd, addScore]
  );

  const restartGame = useCallback(() => {
    const teamsWithResetScores = teams.map((team) => ({ ...team, score: 0 }));
    setTeams(teamsWithResetScores);
    setGameAlert(null);
    if (teamsWithResetScores.length > 0) {
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: teamsWithResetScores, changedTeamIndex: null },
      ]);
    }
  }, [teams]);

  const newGame = useCallback(() => {
    setTeams([]);
    setGameAlert(null);
    setHistory([]);
    setNewTeamName("");
    setPointsToAdd({});
  }, []);

  const editScoreInHistory = useCallback(
    (
      historyIndex: number,
      teamIndexInSnapshot: number,
      newScoreValue: number
    ) => {
      setHistory((prevHistory) => {
        const validatedNewScore = Math.max(
          0,
          gameConfig.defaultMaxScore > 0
            ? Math.min(newScoreValue, gameConfig.defaultMaxScore)
            : newScoreValue
        );
        const newHistory = prevHistory
          .slice(0, historyIndex + 1)
          .map((entry) => ({
            ...entry,
            snapshot: entry.snapshot.map((team) => ({ ...team })),
          }));

        const editedEntry = newHistory[historyIndex];
        if (editedEntry && editedEntry.snapshot[teamIndexInSnapshot]) {
          editedEntry.snapshot[teamIndexInSnapshot].score = validatedNewScore;
          editedEntry.changedTeamIndex = teamIndexInSnapshot;
        } else {
          console.error(
            "Error updating history: Invalid history or team index."
          );
          return prevHistory;
        }

        let currentTeamsState = [
          ...editedEntry.snapshot.map((team) => ({ ...team })),
        ];
        for (let i = historyIndex + 1; i < prevHistory.length; i++) {
          const originalFollowingEntry = prevHistory[i];
          const previousRecalculatedSnapshot = newHistory[i - 1].snapshot;
          const nextSnapshot = [
            ...currentTeamsState.map((team) => ({ ...team })),
          ];

          if (originalFollowingEntry.changedTeamIndex !== null) {
            const teamThatChangedIndex =
              originalFollowingEntry.changedTeamIndex;
            const originalScoreBeforeChangeInFollowingEntry =
              prevHistory[i - 1].snapshot[teamThatChangedIndex]?.score ?? 0;
            const originalScoreAfterChangeInFollowingEntry =
              originalFollowingEntry.snapshot[teamThatChangedIndex]?.score ?? 0;
            const pointsDelta =
              originalScoreAfterChangeInFollowingEntry -
              originalScoreBeforeChangeInFollowingEntry;

            if (nextSnapshot[teamThatChangedIndex]) {
              let newCalculatedScore =
                (previousRecalculatedSnapshot[teamThatChangedIndex]?.score ??
                  0) + pointsDelta;
              newCalculatedScore = Math.max(
                0,
                gameConfig.defaultMaxScore > 0
                  ? Math.min(newCalculatedScore, gameConfig.defaultMaxScore)
                  : newCalculatedScore
              );
              nextSnapshot[teamThatChangedIndex].score = newCalculatedScore;
            }
          }
          newHistory.push({
            snapshot: nextSnapshot,
            changedTeamIndex: originalFollowingEntry.changedTeamIndex,
          });
          currentTeamsState = [...nextSnapshot.map((team) => ({ ...team }))];
        }
        setTeams(currentTeamsState);

        const { gameIsOver, winner, triggerer } = checkGameStatus(currentTeamsState);

        if (gameIsOver && winner && triggerer) {
          let description = "";
          if (gameConfig.winningCondition === "lowest_wins") {
            description = `¡El equipo ${triggerer.name} ha alcanzado la puntuación límite de ${gameConfig.defaultMaxScore}! Ganador: ${winner.name} con ${winner.score} pts.`;
          } else {
            description = `¡El equipo ${winner.name} ha alcanzado la puntuación máxima de ${gameConfig.defaultMaxScore}!`;
          }
          setGameAlert({
            title: "¡FIN DE LA PARTIDA!",
            description,
            variant: "destructive",
            winningTeamName: winner.name,
            triggeringTeamName: triggerer.name,
          });
        } else {
          setGameAlert(null);
        }
        return newHistory;
      });
    },
    [gameConfig.defaultMaxScore, gameConfig.winningCondition, checkGameStatus]
  );

  const removeTeam = useCallback(
    (teamIndexToRemove: number) => {
      const updatedTeams = teams.filter(
        (_, index) => index !== teamIndexToRemove
      );
      setTeams(updatedTeams);
      setPointsToAdd((prevPointsToAdd) => {
        const newPointsToAdd: PointsToAdd = {};
        for (const key in prevPointsToAdd) {
          const index = parseInt(key, 10);
          if (index !== teamIndexToRemove) {
            newPointsToAdd[index < teamIndexToRemove ? index : index - 1] =
              prevPointsToAdd[key];
          }
        }
        return newPointsToAdd;
      });
      setHistory((prevHistory) => {
        const newHistory = prevHistory
          .map((entry) => {
            const updatedSnapshot = entry.snapshot.filter(
              (_, index) => index !== teamIndexToRemove
            );
            let updatedChangedTeamIndex = entry.changedTeamIndex;
            if (entry.changedTeamIndex !== null) {
              if (entry.changedTeamIndex === teamIndexToRemove) {
                updatedChangedTeamIndex = null;
              } else if (entry.changedTeamIndex > teamIndexToRemove) {
                updatedChangedTeamIndex = entry.changedTeamIndex - 1;
              }
            }
            return {
              snapshot: updatedSnapshot,
              changedTeamIndex: updatedChangedTeamIndex,
            };
          })
          .filter((entry) => entry.snapshot.length > 0);

        const { gameIsOver, winner, triggerer } = checkGameStatus(updatedTeams);

        if (gameIsOver && winner && triggerer) {
          let description = "";
          if (gameConfig.winningCondition === "lowest_wins") {
            description = `¡El equipo ${triggerer.name} ha alcanzado la puntuación límite de ${gameConfig.defaultMaxScore}! Ganador: ${winner.name} con ${winner.score} pts.`;
          } else {
            description = `¡El equipo ${winner.name} ha alcanzado la puntuación máxima de ${gameConfig.defaultMaxScore}!`;
          }
          setGameAlert({
            title: "¡FIN DE LA PARTIDA!",
            description,
            variant: "destructive",
            winningTeamName: winner.name,
            triggeringTeamName: triggerer.name,
          });
        } else {
          setGameAlert(null);
        }
        return newHistory;
      });
    },
    [teams, gameConfig.defaultMaxScore, gameConfig.winningCondition, checkGameStatus]
  );

  return {
    gameConfig,
    allConfigs,
    customPresets,
    setGameConfig,
    saveCustomPreset,
    deleteCustomPreset,
    teams,
    newTeamName,
    pointsToAdd,
    gameAlert,
    history,
    setNewTeamName,
    setPointsToAdd,
    addTeam,
    addScore,
    handleCustomPoints,
    restartGame,
    newGame,
    editScoreInHistory,
    removeTeam,
  };
};
