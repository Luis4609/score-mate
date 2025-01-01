import { useState } from "react";
import "./App.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "./components/ui/card";

interface Team {
  name: string;
  score: number;
}

interface PointsToAdd {
  [key: number]: string;
}

function App() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [pointsToAdd, setPointsToAdd] = useState<PointsToAdd>({}); // Almacena puntos específicos para cada equipo

  // Función para agregar un nuevo equipo
  const addTeam = () => {
    if (newTeamName.trim() !== "") {
      setTeams([...teams, { name: newTeamName, score: 0 }]);
      setNewTeamName(""); // Limpiar el input
    }
  };

  // Función para sumar puntos a un equipo
  const addScore = (index: number, points: number) => {
    const updatedTeams = teams.map((team, i) =>
      i === index ? { ...team, score: team.score + points } : team
    );
    setTeams(updatedTeams);
  };

  // Función para reiniciar la partida
  const newGame = () => {
    setTeams([]);
  };

  // Función para manejar puntos personalizados
  const handleCustomPoints = (index: number) => {
    const points = parseInt(pointsToAdd[index]) || 0; // Convierte a número o usa 0 si está vacío
    addScore(index, points);
    setPointsToAdd({ ...pointsToAdd, [index]: "" }); // Limpia el input después de añadir
  };

  // si, algun equipo llega al limite de la puntuacion, se termina la partida y sale una alerta
  // TODO: como usuario, quiero poder establecer el limite de puntuacion
  // const limitScore = () => {};

  return (
    // <> div className="flex flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10"
    <>
      <Card>
        <div className="flex flex-col min-h-svh items-center justify-center gap-4 ">
          <CardHeader className="text-center">
            <h1>Score Mate</h1>
          </CardHeader>
          <Button variant="outline" onClick={newGame}>
            New game
          </Button>
          <div className="flex w-full max-w-sm flex-row gap-6 items-center justify-center">
            <Input
              type="text"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Team name"
            />

            <Button onClick={addTeam}>Add team</Button>
          </div>
          <div className="flex w-full max-w-sm flex-col gap-6">
            {teams.map((team, index) => (
              <div
                key={index}
                className="flex w-full max-w-sm flex-row gap-6 items-center justify-center rounded-md"
              >
                <Card className="flex">
                  <CardHeader className=" flex flex-row text-center gap-4">
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <CardDescription>{team.score}</CardDescription>
                  </CardHeader>
                  <div className="flex flex-row items-center justify-center gap-2 pr-6">
                    <Input
                      type="number"
                      value={pointsToAdd[index] || ""}
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
                  {/* <CardFooter>
                    <Progress value={team.score} max={200}/>
                  </CardFooter> */}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}

export default App;
