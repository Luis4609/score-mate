import { GameAlert } from "@/components/game-alert";
import { CardHeader } from "@/components/ui/card";
import React, { Suspense } from "react";

import { GameControls } from "@/modules/game/components/game-controls";
import { GameSettings } from "@/modules/game/components/game-settings";
import { useScoreMateGame } from "@/modules/game/hooks/useScoreGame";
import { AddTeamForm } from "@/modules/teams/components/add-team-form";
import { TeamsDisplay } from "@/modules/teams/components/TeamDisplay";

const HistoryTable = React.lazy(() =>
  import("@/modules/history/components/history-table").then((module) => ({
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
    handleCustomPoints,
    restartGame,
    newGame,
    editScoreInHistory,
    removeTeam,
  } = useScoreMateGame();

  const canAddTeam =
    newTeamName.trim() !== "" && teams.length < gameConfig.maxTeams;

  return (
    <div className="flex flex-col min-h-svh items-center justify-center gap-4 bg-background p-4">
      <CardHeader className="text-center">
        <h1 className="text-3xl font-bold">Score Mate</h1>{" "}
      </CardHeader>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {/* TODO: check better layout */}
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
          onHandleCustomPoints={handleCustomPoints}
          onRemoveTeam={removeTeam}
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
            <HistoryTable
              history={history}
              teams={teams}
              onEditScore={editScoreInHistory}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}

export default App;
