// features/game/components/GameSettings.tsx

import React from "react";
import { GameConfig } from "@/lib/types";
import { ComboBoxResponsive } from "@/components/combobox";

import { Dispatch, SetStateAction } from "react";

interface GameSettingsProps {
  setGameConfig: Dispatch<SetStateAction<GameConfig>>;
}

export const GameSettings: React.FC<GameSettingsProps> = ({
  setGameConfig,
}) => {
  return (
    // Asumimos que ComboBoxResponsive maneja su propia lista de configuraciones (gameConfigs)
    // o que se la pasas como prop si decides gestionarla centralmente.
    // Si ComboBoxResponsive necesita gameConfigs, puedes pasárselo aquí:
    // <ComboBoxResponsive setGameConfig={setGameConfig} configs={gameConfigs} />
    <ComboBoxResponsive setGameConfig={setGameConfig} />
  );
};
