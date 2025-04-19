// features/game/components/GameControls.tsx

import React from 'react';
import { Button } from "@/components/ui/button"; // Ajusta la ruta de importación

interface GameControlsProps {
  onRestartGame: () => void; // Función para reiniciar
  onNewGame: () => void;     // Función para nueva partida
}

export const GameControls: React.FC<GameControlsProps> = ({ onRestartGame, onNewGame }) => {
  return (
    <div className="flex flex-row gap-4 items-center justify-between">
      <Button variant="outline" onClick={onRestartGame}>
        Reiniciar Partida
      </Button>
      <Button variant="destructive" onClick={onNewGame}>
        Nueva Partida
      </Button>
    </div>
  );
};