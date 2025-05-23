// features/game/components/GameControls.tsx

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";

interface GameControlsProps {
  onRestartGame: () => void;
  onNewGame: () => void;
  onExportGame: () => string; // Returns JSON string
  onImportGame: (jsonDataString: string) => boolean; // Returns success status
}

export const GameControls: React.FC<GameControlsProps> = ({
  onRestartGame,
  onNewGame,
  onExportGame,
  onImportGame,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportGame = () => {
    const jsonData = onExportGame();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "score-mate-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result;
      if (typeof fileContent === "string") {
        const success = onImportGame(fileContent);
        if (success) {
          alert("Game data imported successfully!");
        }
        // If !success, importGameData should have already shown an alert.
      }
      // Reset file input value to allow importing the same file again
      if (event.target) {
        event.target.value = "";
      }
    };
    reader.onerror = () => {
      alert("Error reading file.");
      if (event.target) {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-2 gap-4 my-4">
      <Button variant="outline" onClick={onRestartGame}>
        Reiniciar Partida
      </Button>
      <Button variant="destructive" onClick={onNewGame}>
        Nueva Partida
      </Button>
      <Button variant="secondary" onClick={handleExportGame}>
        Exportar Partida
      </Button>
      <Button variant="secondary" onClick={handleImportClick}>
        Importar Partida
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileImport}
      />
    </div>
  );
};
