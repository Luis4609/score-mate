// features/game/useScoreMateGame.ts

import { useState, useCallback } from "react";
import { Team, GameConfig, PointsToAdd, HistoryEntry } from "@/lib/types";
import { gameConfigs } from "@/features/game/game-config";
import React from "react";
import { GameAlert } from "@/components/game-alert";

export const useScoreMateGame = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig>(gameConfigs[0]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({});
  const [gameAlert, setGameAlert] = useState<React.ReactNode>(null);
  // El estado history ahora usa el tipo HistoryEntry
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Lógica para añadir un equipo
  const addTeam = useCallback(() => {
    if (newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams) {
      // Al añadir un equipo, su puntuación inicial es 0
      const newTeams = [...teams, { name: newTeamName.trim(), score: 0 }];
      setTeams(newTeams);
      setNewTeamName("");
      // Opcional: podrías añadir el estado inicial con este equipo al historial aquí,
      // pero decidimos añadir historial solo en cambios de puntuación o reinicios.
      // Si decides añadirlo, la entrada sería { snapshot: newTeams, changedTeamIndex: null }
    } else if (teams.length >= gameConfig.maxTeams) {
      alert(`No puedes agregar más de ${gameConfig.maxTeams} equipos.`);
    }
  }, [newTeamName, teams, gameConfig.maxTeams]); // Dependencias del useCallback

  // Lógica para añadir puntuación a un equipo
  const addScore = useCallback(
    (index: number, points: number) => {
      const team = teams[index];
      if (!team) return; // Evitar errores si el equipo no existe

      const newScore = team.score + points;

      if (newScore <= gameConfig.maxScore) {
        const updatedTeams = teams.map((t, i) =>
          i === index ? { ...t, score: newScore } : t
        );
        setTeams(updatedTeams);

        // Añadir el estado actual y el índice del equipo que cambió al historial
        setHistory((prevHistory) => [
          ...prevHistory,
          { snapshot: updatedTeams, changedTeamIndex: index },
        ]);
      } else {
        // Si se excede la puntuación máxima, establecemos la puntuación al máximo y mostramos la alerta
        const updatedTeams = teams.map((t, i) =>
          i === index ? { ...t, score: gameConfig.maxScore } : t
        );
        setTeams(updatedTeams);

        // Añadir el estado final con puntuación máxima al historial
        setHistory((prevHistory) => [
          ...prevHistory,
          { snapshot: updatedTeams, changedTeamIndex: index },
        ]);

        // Mostrar alerta de fin de partida
        setGameAlert(
            React.createElement('div', {}, // Usamos React.createElement o pasamos el componente directamente si GameAlert es React.FC
                React.createElement('h2', {}, "GAME OVER!"), // Ejemplo básico, usa tu componente GameAlert real aquí
                React.createElement('p', {}, `${team.name} ha alcanzado el máximo de puntos (${gameConfig.maxScore})`)
              )
        //     <GameAlert
        //     title={"GAME OVER!"}
        //     description={`${team.name} ha alcanzado el máximo de puntos (${gameConfig.maxScore})`}
        //   ></GameAlert>
        );
      }
    },
    [teams, gameConfig.maxScore, setGameAlert] // Dependencias
  );

  // Lógica para manejar puntos personalizados desde el input
  const handleCustomPoints = useCallback(
    (index: number) => {
      const points = parseInt(pointsToAdd[index]) || 0;
      if (points > 0) {
        // Solo añadir si son puntos positivos
        addScore(index, points);
      }
      // Limpiar el input después de añadir
      setPointsToAdd({ ...pointsToAdd, [index]: "" });
    },
    [pointsToAdd, addScore] // Dependencias
  );

  // Lógica para reiniciar la partida (mantiene equipos, resetea puntuaciones e historial)
  const restartGame = useCallback(() => {
    const teamsWithResetScores = teams.map((team) => ({
      ...team,
      score: 0,
    }));
    setTeams(teamsWithResetScores);
    setGameAlert(null);
    // Reiniciar el historial con el estado inicial (sin equipo cambiado)
    // Añadimos solo si hay equipos, para no tener una entrada vacía si no hay equipos
    if (teamsWithResetScores.length > 0) {
      setHistory([{ snapshot: teamsWithResetScores, changedTeamIndex: null }]);
    } else {
      setHistory([]); // Si no hay equipos, el historial está vacío
    }
  }, [teams]); // Dependencia de teams para mapear los equipos actuales

  // Lógica para empezar una nueva partida (resetea todo)
  const newGame = useCallback(() => {
    setTeams([]);
    setGameAlert(null);
    setHistory([]); // Limpiar completamente el historial
    setNewTeamName(""); // Limpiar input de nuevo equipo
    setPointsToAdd({}); // Limpiar inputs de puntos personalizados
  }, []); // Sin dependencias

  // Lógica para cambiar la configuración del juego
  // setGameConfig ya viene del useState, no necesita useCallback a menos que hagas algo más complejo aquí

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
