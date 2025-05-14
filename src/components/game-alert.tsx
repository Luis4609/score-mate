// src/components/game-alert.tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GameAlertData } from "@/lib/types"; // Use the specific GameAlertData type
import { AlertCircle, Trophy } from "lucide-react"; // Added Trophy icon

// The props for GameAlertComponent now directly use GameAlertData
export function GameAlert({
  title,
  description,
  variant,
  winningTeamName,
}: GameAlertData) {
  return (
    <Alert variant={variant} className="mt-4">
      {/* Conditionally render Trophy or AlertCircle icon */}
      {variant === "destructive" && winningTeamName ? (
        <Trophy className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
        {/* Optionally, you can add more specific details here if needed */}
        {/* For example, if winningTeamName is part of the description already, this might be redundant */}
      </AlertDescription>
    </Alert>
  );
}
