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
  // State for the current game configuration (e.g., Domino, Poker)
  const [gameConfig, setGameConfig] = useState<GameConfig>(gameConfigs[0]);
  // State for the list of teams participating in the game
  const [teams, setTeams] = useState<Team[]>([]);
  // State for the name of a new team being added
  const [newTeamName, setNewTeamName] = useState<string>("");
  // State for the points to be added to a team via input fields
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({});
  // State for displaying game-related alerts (e.g., game over)
  const [gameAlert, setGameAlert] = useState<GameAlertData | null>(null);
  // State for storing the history of score changes
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Effect to reset the game when the game configuration changes
  useEffect(() => {
    // When gameConfig changes, it's a good practice to reset the game state
    // to avoid inconsistencies (e.g., teams from a previous game type).
    setTeams([]);
    setGameAlert(null);
    setHistory([]);
    setNewTeamName("");
    setPointsToAdd({});
  }, [gameConfig]);

  // Adds a new team to the game
  const addTeam = useCallback(() => {
    if (newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams) {
      const newTeamEntry: Team = { name: newTeamName.trim(), score: 0 };
      const newTeams = [...teams, newTeamEntry];
      setTeams(newTeams);
      setNewTeamName(""); // Clear the input field

      // Update history: Add a new entry reflecting the team addition.
      // If it's the first team, this effectively starts the game's history.
      // Otherwise, it shows the state after the new team is added.
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: [...newTeams], changedTeamIndex: null }, // No specific team's score changed, it's a structural change
      ]);
    } else if (teams.length >= gameConfig.maxTeams) {
      // Alert if the maximum number of teams is reached
      // Consider using a more integrated alert system instead of window.alert for consistency
      alert(
        `You cannot add more than ${gameConfig.maxTeams} teams for ${gameConfig.name}.`
      );
    }
  }, [newTeamName, teams, gameConfig.maxTeams, gameConfig.name]);

  // Adds score to a specific team
  const addScore = useCallback(
    (teamIndex: number, points: number) => {
      const team = teams[teamIndex];
      if (!team) return; // Exit if the team doesn't exist

      const newScore = team.score + points;
      let gameIsOver = false;
      let winningTeamName: string | undefined = undefined;

      // Create updated teams array
      const updatedTeams = teams.map((t, i) => {
        if (i === teamIndex) {
          if (newScore >= gameConfig.maxScore) {
            gameIsOver = true;
            winningTeamName = t.name;
            return { ...t, score: gameConfig.maxScore }; // Cap score at maxScore
          }
          return { ...t, score: newScore };
        }
        return t;
      });

      setTeams(updatedTeams);
      // Record the change in history
      setHistory((prevHistory) => [
        ...prevHistory,
        { snapshot: updatedTeams, changedTeamIndex: teamIndex },
      ]);

      // Set game over alert if applicable
      if (gameIsOver && winningTeamName) {
        setGameAlert({
          title: "GAME OVER!",
          description: `${winningTeamName} has reached the maximum score of ${gameConfig.maxScore}.`,
          variant: "destructive",
          winningTeamName: winningTeamName,
        });
      } else {
        // Clear any existing game alert if the game is not over
        setGameAlert(null);
      }
    },
    [teams, gameConfig.maxScore, gameConfig.name] // Added gameConfig.name for alert message
  );

  // Handles adding custom points entered by the user
  const handleCustomPoints = useCallback(
    (teamIndex: number) => {
      const pointsStr = pointsToAdd[teamIndex];
      const points = parseInt(pointsStr, 10);

      // Check if points is a valid number and not zero
      if (!isNaN(points) && points !== 0) {
        addScore(teamIndex, points);
      }
      // Clear the input field for that team after attempting to add points
      setPointsToAdd((prevPointsToAdd) => ({
        ...prevPointsToAdd,
        [teamIndex]: "",
      }));
    },
    [pointsToAdd, addScore]
  );

  // Resets scores for all teams and clears game over alert
  const restartGame = useCallback(() => {
    const teamsWithResetScores = teams.map((team) => ({
      ...team,
      score: 0,
    }));
    setTeams(teamsWithResetScores);
    setGameAlert(null); // Clear any game over alert

    // Add a history entry for the game restart if there are teams
    if (teamsWithResetScores.length > 0) {
      setHistory((prevHistory) => [
        // Keep previous history and add restart point
        ...prevHistory,
        { snapshot: teamsWithResetScores, changedTeamIndex: null }, // Null indicates a reset, not a specific team change
      ]);
    }
    // If history should be completely cleared on restart, use:
    // setHistory(teamsWithResetScores.length > 0 ? [{ snapshot: teamsWithResetScores, changedTeamIndex: null }] : []);
  }, [teams]);

  // Starts a completely new game, clearing all teams, scores, and history
  const newGame = useCallback(() => {
    setTeams([]);
    setGameAlert(null);
    setHistory([]);
    setNewTeamName("");
    setPointsToAdd({});
    // Optionally, reset to the default gameConfig if desired
    // setGameConfig(gameConfigs[0]);
  }, []);

  // Edits a score in a specific history entry and recalculates subsequent states
  const editScoreInHistory = useCallback(
    (historyIndex: number, teamIndex: number, newScoreValue: number) => {
      setHistory((prevHistory) => {
        // Ensure the new score is within valid bounds (e.g., not negative, not over max if that's a rule for edits)
        const validatedNewScore = Math.max(
          0,
          Math.min(newScoreValue, gameConfig.maxScore)
        );

        // Create a deep copy of the history up to the point of editing
        const newHistory = prevHistory
          .slice(0, historyIndex + 1)
          .map((entry) => ({
            ...entry,
            snapshot: entry.snapshot.map((team) => ({ ...team })),
          }));

        // Update the score in the snapshot of the edited history entry
        const editedEntry = newHistory[historyIndex];
        if (editedEntry && editedEntry.snapshot[teamIndex]) {
          editedEntry.snapshot[teamIndex].score = validatedNewScore;
          // Mark which team's score was edited in this history entry
          editedEntry.changedTeamIndex = teamIndex;
        } else {
          // Should not happen if indices are correct, but good to handle
          console.error(
            "Error updating history: Invalid history or team index."
          );
          return prevHistory;
        }

        // Recalculate subsequent history entries and the current teams state
        let currentTeamsState = [
          ...editedEntry.snapshot.map((team) => ({ ...team })),
        ];

        for (let i = historyIndex + 1; i < prevHistory.length; i++) {
          const originalFollowingEntry = prevHistory[i];
          const previousRecalculatedSnapshot = newHistory[i - 1].snapshot;
          const nextSnapshot = [
            ...currentTeamsState.map((team) => ({ ...team })),
          ]; // Start with current state

          if (originalFollowingEntry.changedTeamIndex !== null) {
            const teamThatChangedIndex =
              originalFollowingEntry.changedTeamIndex;
            // This assumes the original change was an addition.
            // A more robust system might store the *delta* in history.
            // For simplicity, we re-apply the difference from its *original* previous state.
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
              ); // Apply bounds
              nextSnapshot[teamThatChangedIndex].score = newCalculatedScore;
            }
          }
          // If changedTeamIndex was null (e.g. a reset or team addition), the snapshot would just be the currentTeamsState.
          // This simplified loop assumes changedTeamIndex is usually a score update.

          newHistory.push({
            snapshot: nextSnapshot,
            changedTeamIndex: originalFollowingEntry.changedTeamIndex,
          });
          currentTeamsState = [...nextSnapshot.map((team) => ({ ...team }))];
        }

        setTeams(currentTeamsState); // Update current teams to the final recalculated state

        // Check for game over condition based on the new currentTeamsState
        let gameIsOver = false;
        let winningTeam: Team | undefined = undefined;
        currentTeamsState.forEach((team) => {
          if (team.score >= gameConfig.maxScore) {
            gameIsOver = true;
            winningTeam = team;
          }
        });

        if (gameIsOver && winningTeam) {
          setGameAlert({
            title: "GAME OVER!",
            description: `${winningTeam.name} has reached the maximum score of ${gameConfig.maxScore}.`,
            variant: "destructive",
            winningTeamName: winningTeam.name,
          });
        } else {
          setGameAlert(null); // Clear alert if no one is at max score
        }
        return newHistory;
      });
    },
    [gameConfig.maxScore] // Dependency: maxScore for validation and game over check
  );

  // Removes a team from the game and updates history
  const removeTeam = useCallback(
    (teamIndexToRemove: number) => {
      // Update teams state
      const updatedTeams = teams.filter(
        (_, index) => index !== teamIndexToRemove
      );
      setTeams(updatedTeams);

      // Update pointsToAdd state
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

      // Update history
      setHistory((prevHistory) => {
        const newHistory = prevHistory
          .map((entry) => {
            // Filter out the removed team from each snapshot
            const updatedSnapshot = entry.snapshot.filter(
              (_, index) => index !== teamIndexToRemove
            );

            // Adjust changedTeamIndex if necessary
            let updatedChangedTeamIndex = entry.changedTeamIndex;
            if (entry.changedTeamIndex !== null) {
              if (entry.changedTeamIndex === teamIndexToRemove) {
                updatedChangedTeamIndex = null; // The team that changed was removed
              } else if (entry.changedTeamIndex > teamIndexToRemove) {
                updatedChangedTeamIndex = entry.changedTeamIndex - 1; // Shift index
              }
            }
            return {
              snapshot: updatedSnapshot,
              changedTeamIndex: updatedChangedTeamIndex,
            };
          })
          // Filter out history entries that might become empty if all teams were removed (edge case)
          .filter((entry) => entry.snapshot.length > 0);

        // After removing a team, check if the game over condition still holds or changes
        let gameIsOver = false;
        let winningTeam: Team | undefined = undefined;
        if (updatedTeams.length > 0) {
          updatedTeams.forEach((team) => {
            if (team.score >= gameConfig.maxScore) {
              gameIsOver = true;
              winningTeam = team; // This could be multiple if scores are tied at max
            }
          });
        }

        if (gameIsOver && winningTeam) {
          setGameAlert({
            title: "GAME OVER!",
            description: `${winningTeam.name} has reached the maximum score of ${gameConfig.maxScore}.`,
            variant: "destructive",
            winningTeamName: winningTeam.name,
          });
        } else {
          setGameAlert(null);
        }
        return newHistory;
      });
    },
    [teams, gameConfig.maxScore] // Dependencies
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
    addScore,
    handleCustomPoints,
    restartGame,
    newGame,
    editScoreInHistory,
    removeTeam,
  };
};
