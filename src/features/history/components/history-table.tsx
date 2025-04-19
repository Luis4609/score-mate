// features/history/components/HistoryTable.tsx

import React from "react";
import { HistoryEntry, Team } from "@/lib/types"; // Ajusta la ruta de types

interface HistoryTableProps {
  history: HistoryEntry[];
  teams: Team[]; // Necesitamos la lista actual de equipos para los encabezados de la tabla
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  teams,
}) => {
  // Solo mostramos la tabla si hay entradas en el historial
  if (history.length === 0) {
    return null; // No renderizar nada si el historial está vacío
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 mt-6">
      <h2 className="text-lg font-semibold text-center">
        Historial de Partida
      </h2>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left text-sm font-medium text-muted-foreground">
                Fase
              </th>
              {/* Encabezados de equipo basados en la lista actual de equipos */}
              {teams.map((team, index) => (
                <th
                  key={index}
                  className="border border-border p-3 text-left text-sm font-medium text-muted-foreground"
                >
                  {team.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Filas para cada fase en el historial */}
            {history.map((historyEntry, index) => (
              <tr key={index} className="odd:bg-background even:bg-muted/20">
                {/* Celda para el número de Fase */}
                <td className="border border-border p-3 text-sm font-mono text-center">
                  {index + 1}
                </td>
                {/* Celdas para las puntuaciones de cada equipo en este snapshot */}
                {historyEntry.snapshot.map((teamScoreEntry, teamIndex) => (
                  <td
                    key={teamIndex}
                    className="border border-border p-3 text-sm font-mono text-center"
                  >
                    {/* Envolvemos la puntuación en un span y aplicamos color condicional */}
                    <span
                      className={`${
                        historyEntry.changedTeamIndex === teamIndex
                          ? "text-green-700 dark:text-green-400 font-bold"
                          : "text-red-700 dark:text-red-400 font-bold"
                      }`}
                    >
                      {teamScoreEntry.score}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
