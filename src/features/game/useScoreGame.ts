import { gameConfigs } from "@/features/game/game-config";
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

  // Lógica para añadir puntuación a un equipo
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
        // Si se excede la puntuación máxima, establecemos la puntuación al máximo y mostramos la alerta
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
          //     <GameAlert
          //     title={"GAME OVER!"}
          //     description={`${team.name} ha alcanzado el máximo de puntos (${gameConfig.maxScore})`}
          //   ></GameAlert>
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
    // Añadimos solo si hay equipos, para no tener una entrada vacía si no hay equipos
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

  return {
    // Estado accesible desde fuera del hook
    gameConfig,
    teams,
    newTeamName,
    pointsToAdd,
    gameAlert,
    history,
    // Funciones accesibles desde fuera del hook
    setGameConfig,
    setNewTeamName,
    setPointsToAdd,
    addTeam,
    addScore,
    handleCustomPoints,
    restartGame,
    newGame,
  };
};
