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
    <ComboBoxResponsive setGameConfig={setGameConfig} />
  );
};
