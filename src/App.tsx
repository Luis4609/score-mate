import { GameAlert } from "@/components/game-alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import React, { Suspense } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { Trophy, Users, History as HistoryIcon, PlusCircle } from "lucide-react";

import { GameSettingsDrawer } from "@/modules/game/components/game-settings-drawer";
import { useScoreMateGame } from "@/modules/game/hooks/useScoreGame";
import { AddTeamForm } from "@/modules/teams/components/add-team-form";
import { TeamsDisplay } from "@/modules/teams/components/TeamDisplay";
import { ScoreProgressionChart } from "@/modules/history/components/ScoreProgressionChart";

const HistoryTable = React.lazy(() =>
  import("@/modules/history/components/history-table").then((module) => ({
    default: module.HistoryTable,
  }))
);

function App() {
  const {
    gameConfig,
    allConfigs,
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
    saveCustomPreset,
    deleteCustomPreset,
  } = useScoreMateGame();

  const [activeTab, setActiveTab] = React.useState<'game' | 'history'>('game');
  const [historyView, setHistoryView] = React.useState<'table' | 'chart'>('table');

  const canAddTeam =
    newTeamName.trim() !== "" && teams.length < gameConfig.maxPlayers;

  return (
    <div className="min-h-svh w-full bg-background text-foreground transition-colors duration-300">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Score Mate
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 pb-24 md:pb-8">
        
        {/* Game Alert Banner */}
        {gameAlert && (
          <div className="w-full animate-bounce">
            <GameAlert {...gameAlert} />
          </div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Settings, Controls & Teams */}
          <div className={`md:col-span-5 flex-col gap-6 w-full ${activeTab === 'game' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* Game Setup Status Bar */}
            <div className="flex items-center justify-between bg-card border border-border px-4 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Juego</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary uppercase truncate max-w-[120px]">
                      {gameConfig.name || "Libre"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5 truncate">
                    Límite: {gameConfig.defaultMaxScore ? `${gameConfig.defaultMaxScore} pts` : "Sin límite"}
                    {gameConfig.maxPlayers && ` • Máx. {gameConfig.maxPlayers} jug.`}
                  </span>
                </div>
              </div>
              <GameSettingsDrawer
                gameConfig={gameConfig}
                allConfigs={allConfigs}
                setGameConfig={setGameConfig}
                onRestartGame={restartGame}
                onNewGame={newGame}
                onSaveCustomPreset={saveCustomPreset}
                onDeleteCustomPreset={deleteCustomPreset}
              />
            </div>

            {/* Teams and Scoring Card */}
            <Card className="shadow-md border-muted">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Equipos y Puntuaciones
                </CardTitle>
                <CardDescription>
                  Añade participantes y registra sus puntuaciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <AddTeamForm
                  newTeamName={newTeamName}
                  setNewTeamName={setNewTeamName}
                  onAddTeam={addTeam}
                  canAddTeam={canAddTeam}
                />
                
                {teams.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground mt-2">
                    <PlusCircle className="h-8 w-8 opacity-40" />
                    <p className="text-sm">Aún no hay equipos añadidos.</p>
                    <p className="text-xs">Usa el formulario superior para empezar.</p>
                  </div>
                ) : (
                  <div className="mt-2 w-full">
                    <TeamsDisplay
                      teams={teams}
                      pointsToAdd={pointsToAdd}
                      setPointsToAdd={setPointsToAdd}
                      onHandleCustomPoints={handleCustomPoints}
                      onRemoveTeam={removeTeam}
                      gameConfig={gameConfig}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Game History */}
          <div className={`md:col-span-7 flex-col gap-6 w-full ${activeTab === 'history' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* History Table/Chart Container */}
            <Card className="shadow-md border-muted overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <HistoryIcon className="h-5 w-5 text-primary" />
                      Historial de Rondas
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {historyView === 'table' 
                        ? "Haz clic en cualquier celda para editar el puntaje de esa ronda."
                        : "Visualiza la evolución de los puntajes ronda tras ronda."
                      }
                    </CardDescription>
                  </div>
                  {history.length > 0 && (
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl shrink-0">
                      <button
                        onClick={() => setHistoryView('table')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          historyView === 'table' 
                            ? 'bg-card text-primary shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Tabla
                      </button>
                      <button
                        onClick={() => setHistoryView('chart')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          historyView === 'chart' 
                            ? 'bg-card text-primary shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Gráfico
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {history.length > 0 ? (
                  <div className="px-6 pb-6">
                    {historyView === 'table' ? (
                      <Suspense
                        fallback={
                          <div className="p-6 text-center text-sm text-muted-foreground flex justify-center items-center gap-2">
                            <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                            Cargando historial...
                          </div>
                        }
                      >
                        <HistoryTable
                          history={history}
                          teams={teams}
                          onEditScore={editScoreInHistory}
                        />
                      </Suspense>
                    ) : (
                      <div className="pt-2">
                        <ScoreProgressionChart
                          history={history}
                          teams={teams}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 px-6 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <HistoryIcon className="h-12 w-12 opacity-30 animate-pulse" />
                    <h3 className="font-medium text-foreground">Sin rondas registradas</h3>
                    <p className="text-sm max-w-xs">
                      Comienza a añadir puntos a los equipos para ver el historial y la progresión de la partida en tiempo real.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Sticky Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 border-t border-muted backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6 py-2 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around items-center h-14">
          <button
            onClick={() => setActiveTab('game')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all relative overflow-hidden ${
              activeTab === 'game' 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === 'game' && (
              <span className="absolute inset-0 bg-primary/10 rounded-2xl animate-fade-in" />
            )}
            <Users className="h-5 w-5 relative z-10" />
            <span className="text-[11px] relative z-10">Partida</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-5 rounded-2xl transition-all relative overflow-hidden ${
              activeTab === 'history' 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === 'history' && (
              <span className="absolute inset-0 bg-primary/10 rounded-2xl animate-fade-in" />
            )}
            <div className="relative">
              <HistoryIcon className="h-5 w-5 relative z-10" />
              {history.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold border border-background z-20">
                  {history.length}
                </span>
              )}
            </div>
            <span className="text-[11px] relative z-10">Historial</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
