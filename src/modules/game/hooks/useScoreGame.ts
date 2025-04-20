import { gameConfigs } from "@/modules/game/config/game-config";
import { GameConfig, HistoryEntry, PointsToAdd, Team } from "@/lib/types";
import React, { useCallback, useState } from "react";

export const useScoreMateGame = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig>(gameConfigs[0]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({});
  const [gameAlert, setGameAlert] = useState<React.ReactNode>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const addTeam = useCallback(() => {
    if (newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams) {
      const newTeams = [...teams, { name: newTeamName.trim(), score: 0 }];
      setTeams(newTeams);
      setNewTeamName("");
      // Opcional: podrías añadir el estado inicial con este equipo al historial aquí,
      // pero decidimos añadir historial solo en cambios de puntuación o reinicios.
      // Si decides añadirlo, la entrada sería { snapshot: newTeams, changedTeamIndex: null }
    } else if (teams.length >= gameConfig.maxTeams) {
      alert(`No puedes agregar más de ${gameConfig.maxTeams} equipos.`);
    }
  }, [newTeamName, teams, gameConfig.maxTeams]);

  // Logic to add score to a team
  const addScore = useCallback(
    (index: number, points: number) => {
      const team = teams[index];
      if (!team) return;

      const newScore = team.score + points;

      if (newScore <= gameConfig.maxScore) {
        const updatedTeams = teams.map((team, i) =>
          i === index ? { ...team, score: newScore } : team
        );
        setTeams(updatedTeams);
        setHistory((prevHistory) => [
          ...prevHistory,
          { snapshot: updatedTeams, changedTeamIndex: index },
        ]);
      } else {
        // If the maximum score is exceeded, set the score to the maximum and show the alert
        const updatedTeams = teams.map((team, i) =>
          i === index ? { ...team, score: gameConfig.maxScore } : team
        );
        setTeams(updatedTeams);
        setHistory((prevHistory) => [
          ...prevHistory,
          { snapshot: updatedTeams, changedTeamIndex: index },
        ]);

        setGameAlert(
          React.createElement(
            "div",
            {},
            React.createElement("h2", {}, "GAME OVER!"),
            React.createElement(
              "p",
              {},
              `${team.name} ha alcanzado el máximo de puntos (${gameConfig.maxScore})`
            )
          )
          //       <GameAlert
          //       title={"GAME OVER!"}
          //       description={`${team.name} ha alcanzado el máximo de puntos (${gameConfig.maxScore})`}
          //     ></GameAlert>
        );
      }
    },
    [teams, gameConfig.maxScore, setGameAlert]
  );

  const handleCustomPoints = useCallback(
    (index: number) => {
      const points = parseInt(pointsToAdd[index]) || 0;
      if (points > 0) {
        addScore(index, points);
      }
      setPointsToAdd({ ...pointsToAdd, [index]: "" });
    },
    [pointsToAdd, addScore]
  );

  const restartGame = useCallback(() => {
    const teamsWithResetScores = teams.map((team) => ({
      ...team,
      score: 0,
    }));
    setTeams(teamsWithResetScores);
    setGameAlert(null);
    // Add only if there are teams, to avoid an empty entry if there are no teams
    if (teamsWithResetScores.length > 0) {
      setHistory([{ snapshot: teamsWithResetScores, changedTeamIndex: null }]);
    } else {
      setHistory([]);
    }
  }, [teams]);

  const newGame = useCallback(() => {
    setTeams([]);
    setGameAlert(null);
    setHistory([]);
    setNewTeamName("");
    setPointsToAdd({});
  }, []);

  // --- New Functionality: Edit Score in History ---
  const editScoreInHistory = useCallback(
    (historyIndex: number, teamIndex: number, newScore: number) => {
      setHistory((prevHistory) => {
        // Create a new history array starting from the edited point
        const newHistory = prevHistory.slice(0, historyIndex + 1);

        // Update the score in the snapshot of the edited history entry
        const editedSnapshot = [...newHistory[historyIndex].snapshot];
        if (editedSnapshot[teamIndex]) {
          editedSnapshot[teamIndex] = {
            ...editedSnapshot[teamIndex],
            score: newScore,
          };
          newHistory[historyIndex] = {
            ...newHistory[historyIndex],
            snapshot: editedSnapshot,
            // Mark which team's score was edited in this history entry
            changedTeamIndex: teamIndex,
          };
        }

        // Recalculate subsequent history entries and the current teams state
        // based on the edited history entry.
        let currentTeamsState = editedSnapshot;

        for (let i = historyIndex + 1; i < prevHistory.length; i++) {
          const previousSnapshot = newHistory[i - 1].snapshot;
          const currentOriginalSnapshot = prevHistory[i].snapshot;
          const changedTeamIndex = prevHistory[i].changedTeamIndex; // This can be number | null

          // Only proceed if changedTeamIndex is a number
          if (changedTeamIndex !== null) {
            // Calculate the points added in the original history entry
            const pointsAdded =
              currentOriginalSnapshot[changedTeamIndex].score -
              previousSnapshot[changedTeamIndex].score;

            // Apply the same points added to the current teams state
            const nextTeamsState = currentTeamsState.map((team, teamIdx) => {
              if (teamIdx === changedTeamIndex) {
                return { ...team, score: team.score + pointsAdded };
              }
              return team;
            });

            newHistory.push({
              snapshot: nextTeamsState,
              changedTeamIndex: changedTeamIndex,
            });
            currentTeamsState = nextTeamsState;
          } else {
            // If changedTeamIndex was null, it means no score was changed in the original entry.
            // We still need to add this entry to the new history to maintain the sequence,
            // but the teams state remains the same as the previous one.
            newHistory.push({
              snapshot: currentTeamsState, // Use the current state as the snapshot
              changedTeamIndex: null, // Keep it null
            });
          }
        }

        // Update the current teams state to the final state after recalculation
        setTeams(currentTeamsState);

        // Clear game alert if it was based on the old score reaching max
        if (
          gameAlert &&
          currentTeamsState.every((team) => team.score < gameConfig.maxScore)
        ) {
          setGameAlert(null);
        }

        return newHistory;
      });
    },
    [gameAlert, gameConfig.maxScore] // Depend on gameAlert and maxScore to potentially clear the alert
  );

  // --- New Functionality: Remove Team ---
  const removeTeam = useCallback(
    (teamIndex: number) => {
      setTeams((prevTeams) => {
        // Filter out the team to be removed
        const updatedTeams = prevTeams.filter(
          (_, index) => index !== teamIndex
        );

        // Update history: Remove the score column for the removed team
        setHistory((prevHistory) => {
          return prevHistory
            .map((entry) => {
              const updatedSnapshot = entry.snapshot.filter(
                (_, index) => index !== teamIndex
              );
              // Adjust changedTeamIndex if the removed team was before the changed team
              const updatedChangedTeamIndex =
                entry.changedTeamIndex !== null &&
                entry.changedTeamIndex > teamIndex
                  ? entry.changedTeamIndex - 1
                  : entry.changedTeamIndex;

              // If the removed team was the changed team, set changedTeamIndex to null or handle as needed
              const finalChangedTeamIndex =
                entry.changedTeamIndex === teamIndex
                  ? null
                  : updatedChangedTeamIndex;

              return {
                snapshot: updatedSnapshot,
                changedTeamIndex: finalChangedTeamIndex,
              };
            })
            .filter((entry) => entry.snapshot.length > 0); // Remove history entries if no teams are left
        });

        // Clear game alert if it was based on the removed team winning
        if (gameAlert) {
          // This part might need more specific logic depending on how your gameAlert is structured
          // For simplicity, we'll just clear it if any team was removed.
          setGameAlert(null);
        }

        return updatedTeams;
      });
    },
    [gameAlert] // Depend on gameAlert to potentially clear the alert
  );

  return {
    // Accessible state from outside the hook
    gameConfig,
    teams,
    newTeamName,
    pointsToAdd,
    gameAlert,
    history,
    // Accessible functions from outside the hook
    setGameConfig,
    setNewTeamName,
    setPointsToAdd,
    addTeam,
    addScore,
    handleCustomPoints,
    restartGame,
    newGame,
    editScoreInHistory, // Make the new function accessible
    removeTeam, // Make the new function accessible
  };
};
