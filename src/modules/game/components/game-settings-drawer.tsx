import React, { useState } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { Settings, Check, RotateCcw, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { gameConfigs } from "@/modules/game/config/game-config";
import { cn } from "@/lib/utils";

interface GameSettingsDrawerProps {
  gameConfig: GameConfig;
  setGameConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
  onRestartGame: () => void;
  onNewGame: () => void;
}

export const GameSettingsDrawer: React.FC<GameSettingsDrawerProps> = ({
  gameConfig,
  setGameConfig,
  onRestartGame,
  onNewGame,
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  const content = (
    <div className="space-y-6 p-4">
      {/* Game Selection Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Seleccionar Juego
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {gameConfigs.map((config) => {
            const isSelected = gameConfig.value === config.value;
            return (
              <button
                key={config.value}
                type="button"
                onClick={() => handleGameSelect(config)}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none select-none",
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/20"
                    : "border-muted bg-card hover:bg-muted/40 text-muted-foreground"
                )}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <span className={cn("font-bold text-sm", isSelected ? "text-primary" : "text-foreground")}>
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
