// features/teams/components/TeamsDisplay.tsx

import React from "react";
import { Team, PointsToAdd } from "@/lib/types";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Trash2 } from "lucide-react";

interface TeamsDisplayProps {
  teams: Team[];
  pointsToAdd: PointsToAdd;
  setPointsToAdd: (points: PointsToAdd) => void;
  onAddScore: (index: number, points: number) => void;
  onHandleCustomPoints: (index: number) => void;
  onRemoveTeam: (index: number) => void;
}

export const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  pointsToAdd,
  setPointsToAdd,
  onHandleCustomPoints,
  onRemoveTeam,
}) => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {teams.map((team, index) => (
        <div
          key={index}
          className="flex w-full max-w-sm flex-row gap-6 items-center justify-center rounded-md"
        >
          {/* Podrías extraer la Card de cada equipo a su propio componente TeamScoreCard.tsx */}
          <Card className="flex surface w-full">
            <CardHeader className=" flex flex-row text-center gap-4 items-center">
              <CardTitle className="text-xl">{team.name}</CardTitle>
              <CardDescription>Score: {team.score}</CardDescription>
            </CardHeader>
            <div className="flex flex-row items-center justify-center gap-2 pr-6 ml-auto">
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
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    onHandleCustomPoints(index);
                  }
                }}
              />
              <Button
                variant="secondary"
                onClick={() => onHandleCustomPoints(index)}
                aria-label={`Add points to team ${team.name}`}
              >
                Add
              </Button>
              {/* Aquí podrías añadir botones para sumar puntos fijos si los tienes (ej: +5, +10) */}
              {/* <Button variant="outline" onClick={() => onAddScore(index, 5)}>+5</Button> */}

              {/* TODO: añadir boton para restar? o borrar ultima ejecucion?? */}

              <Button
                variant="destructive"
                onClick={() => onRemoveTeam(index)}
                aria-label={`Remove team ${team.name}`}
              >
                <Trash2></Trash2>
              </Button>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};
