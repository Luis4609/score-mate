import "@/App.css";
import React, { Suspense } from "react";
import { GameAlert } from "@/components/game-alert";
import { CardHeader } from "@/components/ui/card";

import { useScoreMateGame } from "@/features/game/useScoreGame";
import { AddTeamForm } from "@/features/teams/components/add-team-form";
import { TeamsDisplay } from "@/features/teams/components/team-display";
import { GameSettings } from "@/features/game/components/game-settings";
import { GameControls } from "@/features/game/components/game-controls";

const HistoryTable = React.lazy(() =>
  import("@/features/history/components/history-table").then((module) => ({
    default: module.HistoryTable,
  }))
);

function App() {
  const {
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
  } = useScoreMateGame();

  const canAddTeam =
    newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams;

  return (
    <div className="flex flex-col min-h-svh items-center justify-center gap-4 bg-background p-4">
      <CardHeader className="text-center">
        <h1 className="text-3xl font-bold">Score Mate</h1>{" "}
      </CardHeader>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* TODO */}
        <div className="flex flex-row md:flex-row gap-4 w-full">
          <GameSettings setGameConfig={setGameConfig} />{" "}
          <GameControls onRestartGame={restartGame} onNewGame={newGame} />{" "}
        </div>
        <AddTeamForm
          newTeamName={newTeamName}
          setNewTeamName={setNewTeamName}
          onAddTeam={addTeam}
          canAddTeam={canAddTeam}
        />
        <TeamsDisplay
          teams={teams}
          pointsToAdd={pointsToAdd}
          setPointsToAdd={setPointsToAdd}
          onAddScore={addScore}
          onHandleCustomPoints={handleCustomPoints}
        />
        {gameAlert && (
          // TODO: añadir el equipo que ha ganado
          <GameAlert
            title="Fin de la partida"
            description="Has ganado"
            variant="destructive"
          ></GameAlert>
        )}
        <Suspense fallback={<div>Cargando historial...</div>}>
          {history.length > 0 && (
            <HistoryTable history={history} teams={teams} />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
