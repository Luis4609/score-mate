import React, { useState } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Settings, Check, RotateCcw, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { GameConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GameSettingsDrawerProps {
  gameConfig: GameConfig;
  allConfigs: GameConfig[];
  setGameConfig: (config: GameConfig) => void;
  onRestartGame: () => void;
  onNewGame: () => void;
  onSaveCustomPreset: (config: GameConfig) => void;
  onDeleteCustomPreset: (value: string) => void;
}

export const GameSettingsDrawer: React.FC<GameSettingsDrawerProps> = ({
  gameConfig,
  allConfigs,
  setGameConfig,
  onRestartGame,
  onNewGame,
  onSaveCustomPreset,
  onDeleteCustomPreset,
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Form states for custom presets
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMaxScore, setCustomMaxScore] = useState("100");
  const [customWinningCond, setCustomWinningCond] = useState<"highest_wins" | "lowest_wins" | "none">("highest_wins");
  const [customMode, setCustomMode] = useState<"individual" | "teams" | "both">("both");
  const [customMinPlayers, setCustomMinPlayers] = useState("2");
  const [customMaxPlayers, setCustomMaxPlayers] = useState("8");

  const handleGameSelect = (config: GameConfig) => {
    setGameConfig(config);
  };

  const handleRestart = () => {
    onRestartGame();
    setOpen(false);
  };

  const handleNewGame = () => {
    onNewGame();
    setOpen(false);
  };

  const handleCreatePreset = () => {
    if (!customName.trim()) {
      alert("Por favor ingresa un nombre para el juego personalizado.");
      return;
    }
    const maxScoreVal = parseInt(customMaxScore, 10);
    const minP = parseInt(customMinPlayers, 10) || 2;
    const maxP = parseInt(customMaxPlayers, 10) || 8;

    const newPreset: GameConfig = {
      name: customName.trim(),
      value: `custom_${customName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`,
      mode: customMode,
      winningCondition: customWinningCond,
      defaultMaxScore: isNaN(maxScoreVal) ? 0 : Math.max(0, maxScoreVal),
      minPlayers: minP,
      maxPlayers: maxP,
      isCustom: true,
    };

    onSaveCustomPreset(newPreset);
    setGameConfig(newPreset); // Select the newly created preset
    
    // Reset form
    setCustomName("");
    setCustomMaxScore("100");
    setCustomWinningCond("highest_wins");
    setCustomMode("both");
    setCustomMinPlayers("2");
    setCustomMaxPlayers("8");
    setShowCustomForm(false);
  };

  const content = (
    <div className="space-y-6 p-4">
      {/* Game Selection Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Seleccionar Juego
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {allConfigs.map((config) => {
            const isSelected = gameConfig.value === config.value;
            return (
              <button
                key={config.value}
                type="button"
                onClick={() => handleGameSelect(config)}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none select-none pr-8",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20"
                    : "border-muted bg-card hover:bg-muted/40 text-muted-foreground"
                )}
              >
                {isSelected && (
                  <span className={cn(
                    "absolute top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground",
                    config.isCustom ? "right-10" : "right-3"
                  )}>
                    <Check className="h-3 w-3" />
                  </span>
                )}

                {config.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomPreset(config.value);
                    }}
                    className="absolute top-2.5 right-2.5 flex h-6 w-6 items-center justify-center rounded-md bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors z-10"
                    title="Eliminar juego personalizado"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}

                <span className={cn("font-bold text-sm truncate w-full", isSelected ? "text-primary" : "text-foreground")}>
                  {config.name}
                </span>
                <span className="text-[11px] mt-1.5 opacity-80">
                  Límite: {config.defaultMaxScore ? `${config.defaultMaxScore} pts` : "Sin límite"}
                </span>
                <span className="text-[11px] opacity-80">
                  Máx. Jugadores: {config.maxPlayers}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Game Creator */}
      <div className="space-y-3 border-t pt-5">
        <button
          type="button"
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="flex items-center justify-between w-full text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-primary transition-colors outline-none"
        >
          <span>Crear Juego Personalizado</span>
          <span className="text-sm font-semibold">{showCustomForm ? "−" : "+"}</span>
        </button>
        {showCustomForm && (
          <div className="p-4 border bg-muted/10 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 gap-3">
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Nombre</label>
                <Input
                  type="text"
                  placeholder="Ej. Chinchón"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
              {/* Max Score */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Límite de Puntos</label>
                <Input
                  type="number"
                  placeholder="Ej. 100 (0 = sin límite)"
                  value={customMaxScore}
                  onChange={(e) => setCustomMaxScore(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Winning Condition */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Condición de Victoria</label>
                <select
                  value={customWinningCond}
                  onChange={(e) => setCustomWinningCond(e.target.value as any)}
                  className="h-9 text-xs rounded-xl border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value="highest_wins">Mayor puntuación gana</option>
                  <option value="lowest_wins">Menor puntuación gana</option>
                  <option value="none">Sin condición (Póker)</option>
                </select>
              </div>
              {/* Mode */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Modo de Juego</label>
                <select
                  value={customMode}
                  onChange={(e) => setCustomMode(e.target.value as any)}
                  className="h-9 text-xs rounded-xl border bg-background px-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value="both">Ambos (Equipos/Indiv.)</option>
                  <option value="individual">Individual</option>
                  <option value="teams">Equipos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Min Players */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Mín. Jugadores</label>
                <Input
                  type="number"
                  value={customMinPlayers}
                  onChange={(e) => setCustomMinPlayers(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
              {/* Max Players */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Máx. Jugadores</label>
                <Input
                  type="number"
                  value={customMaxPlayers}
                  onChange={(e) => setCustomMaxPlayers(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={handleCreatePreset}
              className="w-full h-9 rounded-xl font-semibold gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              Guardar Configuración
            </Button>
          </div>
        )}
      </div>

      {/* Game Actions */}
      <div className="space-y-3 border-t pt-5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Gestión de Partida
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Restart Button */}
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl border bg-muted/20">
            <span className="text-xs font-bold text-foreground">Reiniciar Puntuaciones</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Pone el marcador a 0 de todos los equipos actuales manteniendo la lista.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="mt-1 gap-1.5 rounded-xl border-muted-foreground/20 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reiniciar Partida
            </Button>
          </div>

          {/* New Game Button */}
          <div className="flex flex-col gap-1.5 p-3 rounded-2xl border bg-muted/20">
            <span className="text-xs font-bold text-foreground">Nueva Partida Completa</span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Borra todos los equipos del juego e inicia una partida desde cero.
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleNewGame}
              className="mt-1 gap-1.5 rounded-xl text-xs font-semibold"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Nueva Partida
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-2 gap-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold">Ajustes de Partida</DialogTitle>
            <DialogDescription>
              Configura el tipo de juego y gestiona el estado de la partida actual.
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9">
          <Settings className="h-4 w-4" />
          <span>Configurar</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-2 pt-0 rounded-t-3xl max-h-[90svh] overflow-y-auto">
        <DrawerHeader className="text-left px-4 pt-5 pb-0">
          <DrawerTitle className="text-lg font-bold">Ajustes de Partida</DrawerTitle>
          <DrawerDescription className="text-xs">
            Elige el juego y gestiona la partida.
          </DrawerDescription>
        </DrawerHeader>
        {content}
        <DrawerFooter className="pt-2 px-4 pb-4">
          <Button variant="secondary" onClick={() => setOpen(false)} className="rounded-xl w-full">
            Cerrar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
