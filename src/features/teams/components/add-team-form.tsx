// features/teams/components/AddTeamForm.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AddTeamFormProps {
  newTeamName: string;
  setNewTeamName: (name: string) => void;
  onAddTeam: () => void; // La función para añadir equipo viene de arriba
  canAddTeam: boolean; // Lógica para habilitar o deshabilitar el botón
}

export const AddTeamForm: React.FC<AddTeamFormProps> = ({
  newTeamName,
  setNewTeamName,
  onAddTeam,
  canAddTeam, // Si decides añadir esta lógica aquí o pasarla desde el hook
}) => {
  // Manejar la pulsación de Enter en el input
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && canAddTeam) {
      onAddTeam();
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-row gap-6 items-center justify-center">
      <Input
        type="text"
        placeholder="Team name"
        value={newTeamName}
        onChange={(e) => setNewTeamName(e.target.value)}
        onKeyDown={handleKeyPress} // Añadido manejo de Enter
      />
      <Button onClick={onAddTeam} disabled={!canAddTeam}>
        Add team
      </Button>
    </div>
  );
};
