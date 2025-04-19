// features/teams/components/TeamsDisplay.tsx

import React from 'react';
import { Team, PointsToAdd } from "../../game/types"; // Ajusta la ruta de types
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Ajusta la ruta de importación
import { Input } from "@/components/ui/input"; // Ajusta la ruta de importación
import { Button } from "@/components/ui/button"; // Ajusta la ruta de importación

interface TeamsDisplayProps {
  teams: Team[];
  pointsToAdd: PointsToAdd;
  setPointsToAdd: (points: PointsToAdd) => void;
  onAddScore: (index: number, points: number) => void; // Función para añadir puntos
  onHandleCustomPoints: (index: number) => void; // Función para puntos personalizados
}

export const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  pointsToAdd,
  setPointsToAdd,
  onAddScore,
  onHandleCustomPoints,
}) => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {teams.map((team, index) => (
        <div
          key={index}
          className="flex w-full max-w-sm flex-row gap-6 items-center justify-center rounded-md"
        >
          {/* Podrías extraer la Card de cada equipo a su propio componente TeamScoreCard.tsx */}
          <Card className="flex surface w-full"> {/* Añadido w-full para que ocupe el ancho */}
            <CardHeader className=" flex flex-row text-center gap-4 items-center"> {/* Alineado items al centro */}
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <CardDescription>Score: {team.score}</CardDescription>
            </CardHeader>
            {/* Sección de añadir puntos */}
            <div className="flex flex-row items-center justify-center gap-2 pr-6 ml-auto"> {/* ml-auto empuja esto a la derecha */}
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
                // Manejar Enter para puntos personalizados
                 onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Enter') {
                        onHandleCustomPoints(index);
                    }
                 }}
              />
              <Button
                variant="secondary"
                onClick={() => onHandleCustomPoints(index)}
              >
                Add
              </Button>
              {/* Aquí podrías añadir botones para sumar puntos fijos si los tienes (ej: +5, +10) */}
              {/* <Button variant="outline" onClick={() => onAddScore(index, 5)}>+5</Button> */}
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};