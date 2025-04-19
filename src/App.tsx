// App.tsx

import "./App.css"; // Mantén tus estilos globales si los usas aquí

import { GameAlert } from "@/components/game-alert"; // Ajusta la ruta de importación
import { CardHeader } from "@/components/ui/card"; // Ajusta la ruta de importación

import { useScoreMateGame } from "@/features/game/useScoreGame"; // Importa el hook
import { AddTeamForm } from "@/features/teams/components/add-team-form"; // Importa componentes UI
import { TeamsDisplay } from "@/features/teams/components/team-display";
import { GameSettings } from "@/features/game/components/game-settings";
import { GameControls } from "@/features/game/components/game-controls";
import { HistoryTable } from "@/features/history/components/history-table";

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
          <GameAlert
            title="Alerta de Juego"
            description="Pepe" 
            variant="destructive"
          >
            {gameAlert}{" "}
          </GameAlert>
        )}
        <HistoryTable history={history} teams={teams} />
      </div>
    </div>
  );
}

export default App;
