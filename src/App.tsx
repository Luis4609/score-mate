import { useState } from "react";
import "./App.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ComboBoxResponsive, GameConfig } from "@/components/combobox";
import { GameAlert } from "@/components/game-alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PointsToAdd, Team, gameConfigs } from "@/lib/types";

function App() {
  const [gameConfig, setGameConfig] = useState<GameConfig>(gameConfigs[0]); // Valor por defecto

  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({}); // Almacena puntos específicos para cada equipo

  const [gameAlert, setGameAlert] = useState<React.ReactNode>(null);

  const addTeam = () => {
    if (newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams) {
      setTeams([...teams, { name: newTeamName, score: 0 }]);
      setNewTeamName("");
    } else if (teams.length >= gameConfig.maxTeams) {
      alert(`No puedes agregar más de ${gameConfig.maxTeams} equipos.`);
    }
  };

  // Función para agregar puntos, pero verifica si se ha alcanzado la puntuación máxima
  const addScore = (index: number, points: number) => {
    const team = teams[index];
    // Verificamos si el equipo ha alcanzado el máximo de puntuación
    if (team.score + points <= gameConfig.maxScore) {
      const updatedTeams = teams.map((team, i) =>
        i === index ? { ...team, score: team.score + points } : team
      );
      setTeams(updatedTeams);
    } else {
      setGameAlert(
        <GameAlert
          title={"GAME OVER!"}
          description={`${team.name} ha alcanzado el máximo de puntos (${gameConfig.maxScore})`}
          variant="destructive"
        ></GameAlert>
      );
    }
  };

  // Función para reiniciar la partida
  const newGame = () => {
    setTeams([]);
    setGameAlert(null);
  };

  const handleCustomPoints = (index: number) => {
    const points = parseInt(pointsToAdd[index]) || 0;
    addScore(index, points);
    setPointsToAdd({ ...pointsToAdd, [index]: "" });
  };

  return (
    <div className="flex flex-col min-h-svh items-center justify-center gap-4 bg-background">
      {/* TITULO */}
      <CardHeader className="text-center">
        <h1>Score Mate</h1>
      </CardHeader>

      {/* SETTINGS */}
      <div className="flex flex-row gap-3">
        <ComboBoxResponsive setGameConfig={setGameConfig} />
        <Button variant="destructive" onClick={newGame}>
          New game
        </Button>
      </div>

      {/* añadir equipo */}
      <div className="flex w-full max-w-sm flex-row gap-6 items-center justify-center m-2">
        <Input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Team name"
        />
        <Button onClick={addTeam}>Add team</Button>
      </div>

      {/* visualizacion de las puntuaciones */}
      <div className="flex w-full max-w-sm flex-col gap-6">
        {teams.map((team, index) => (
          <div
            key={index}
            className="flex w-full max-w-sm flex-row gap-6 items-center justify-center rounded-md"
          >
            <Card className="flex surface ">
              <CardHeader className=" flex flex-row text-center gap-4">
                <CardTitle className="text-xl">{team.name}</CardTitle>
                <CardDescription>Score: {team.score}</CardDescription>
              </CardHeader>
              <div className="flex flex-row items-center justify-center gap-2 pr-6">
                <Input
                  type="number"
                  value={pointsToAdd[index] || ""}
                  className="w-20"
                  onChange={(e) =>
                    setPointsToAdd({
                      ...pointsToAdd,
                      [index]: e.target.value,
                    })
                  }
                />
                <Button
                  variant="secondary"
                  onClick={() => handleCustomPoints(index)}
                >
                  Add
                </Button>
              </div>
            </Card>
          </div>
        ))}
        {gameAlert}
      </div>
    </div>
  );
}

export default App;
