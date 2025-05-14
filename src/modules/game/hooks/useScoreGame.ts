// src/modules/game/hooks/useScoreGame.ts
import {
  GameAlertData,
  GameConfig,
  HistoryEntry,
  PointsToAdd,
  Team,
} from "@/lib/types";
import { gameConfigs } from "@/modules/game/config/game-config";
import { useCallback, useEffect, useState } from "react";

export const useScoreMateGame = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig>(gameConfigs[0]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({});
  const [gameAlert, setGameAlert] = useState<GameAlertData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setTeams([]);
    setGameAlert(null);
    setHistory([]);
    setNewTeamName("");
    setPointsToAdd({});
  }, [gameConfig]);

  const addTeam = useCallback(() => {
    if (newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams) {
      const newTeamEntry: Team = { name: newTeamName.trim(), score: 0 };
      const newTeams = [...teams, newTeamEntry];
      setTeams(newTeams);
      setNewTeamName("");
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: [...newTeams], changedTeamIndex: null },
      ]);
    } else if (teams.length >= gameConfig.maxTeams) {
      alert(
        `You cannot add more than ${gameConfig.maxTeams} teams for ${gameConfig.name}.`
      );
    }
  }, [newTeamName, teams, gameConfig.maxTeams, gameConfig.name]);

  const addScore = useCallback(
    (teamIndex: number, points: number) => {
      const team = teams[teamIndex];
      if (!team) return;

      const newScore = team.score + points;
      let gameIsOver = false;
      let currentWinningTeam: Team | undefined = undefined;

      const updatedTeams = teams.map((t, i) => {
        if (i === teamIndex) {
          if (newScore >= gameConfig.maxScore) {
            gameIsOver = true;
            currentWinningTeam = { ...t, score: gameConfig.maxScore }; // Capture winning team details
            return { ...t, score: gameConfig.maxScore };
          }
          return { ...t, score: newScore };
        }
        return t;
      });

      // If not already game over by this team, check if any other team is also at max score
      if (!gameIsOver) {
        for (const t of updatedTeams) {
          if (t.score >= gameConfig.maxScore) {
            gameIsOver = true;
            currentWinningTeam = t; // Prioritize the team that just scored if multiple hit max simultaneously
            break;
          }
        }
      }

      setTeams(updatedTeams);
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: updatedTeams, changedTeamIndex: teamIndex },
      ]);

      if (gameIsOver && currentWinningTeam) {
        setGameAlert({
          title: "GAME OVER!",
          description: `${currentWinningTeam.name} has reached the maximum score of ${gameConfig.maxScore}.`,
          variant: "destructive",
          winningTeamName: currentWinningTeam.name,
        });
      } else {
        setGameAlert(null);
      }
    },
    [teams, gameConfig.maxScore, gameConfig.name]
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
          Math.min(newScoreValue, gameConfig.maxScore)
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
                Math.min(newCalculatedScore, gameConfig.maxScore)
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

        let gameIsOver = false;
        let finalWinningTeam: Team = {
          name: "",
          score: 0,
        };
        currentTeamsState.forEach((team) => {
          if (team.score >= gameConfig.maxScore) {
            gameIsOver = true;
            finalWinningTeam = team; // In case of multiple, last one checked wins here. Could be refined.
          }
        });

        if (gameIsOver && finalWinningTeam) {
          // Added check for finalWinningTeam
          setGameAlert({
            title: "GAME OVER!",
            description: `${finalWinningTeam.name} has reached the maximum score of ${gameConfig.maxScore}.`,
            variant: "destructive",
            winningTeamName: finalWinningTeam.name,
          });
        } else {
          setGameAlert(null);
        }
        return newHistory;
      });
    },
    [gameConfig.maxScore]
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

        let gameIsOver = false;
        let finalWinningTeam: Team = {
          name: "",
          score: 0,
        };
        if (updatedTeams.length > 0) {
          updatedTeams.forEach((team) => {
            if (team.score >= gameConfig.maxScore) {
              gameIsOver = true;
              finalWinningTeam = team;
            }
          });
        }

        if (gameIsOver && finalWinningTeam) {
          // Added check for finalWinningTeam
          setGameAlert({
            title: "GAME OVER!",
            description: `${finalWinningTeam.name} has reached the maximum score of ${gameConfig.maxScore}.`,
            variant: "destructive",
            winningTeamName: finalWinningTeam.name,
          });
        } else {
          setGameAlert(null);
        }
        return newHistory;
      });
    },
    [teams, gameConfig.maxScore]
  );

  return {
    gameConfig,
    teams,
    newTeamName,
    pointsToAdd,
    gameAlert,
    history,
    setGameConfig,
    setNewTeamName,
    setPointsToAdd,
    addTeam,
    addScore, // Exporting addScore as it might be used by TeamScoreCard for fixed points
    handleCustomPoints,
    restartGame,
    newGame,
    editScoreInHistory,
    removeTeam,
  };
};
