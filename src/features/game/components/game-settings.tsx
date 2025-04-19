// features/game/components/GameSettings.tsx

import React from 'react';
import { GameConfig } from "../types"; // Ajusta la ruta de types
import { ComboBoxResponsive } from "@/components/combobox"; // Asume que este es tu componente ComboBox

interface GameSettingsProps {
  setGameConfig: (config: GameConfig) => void;
}

export const GameSettings: React.FC<GameSettingsProps> = ({ setGameConfig }) => {
  return (
    // Asumimos que ComboBoxResponsive maneja su propia lista de configuraciones (gameConfigs)
    // o que se la pasas como prop si decides gestionarla centralmente.
    // Si ComboBoxResponsive necesita gameConfigs, puedes pasárselo aquí:
    // <ComboBoxResponsive setGameConfig={setGameConfig} configs={gameConfigs} />
    <ComboBoxResponsive setGameConfig={setGameConfig} />
  );
};