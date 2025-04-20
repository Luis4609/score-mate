import { Input } from "@/components/ui/input"; // Assuming Input is available for editing
import { HistoryEntry, Team } from "@/lib/types";
import React, { useState } from "react"; // Import useState

interface HistoryTableProps {
  history: HistoryEntry[];
  teams: Team[]; // This prop seems unused in the current component logic for rendering the table body, but is used for table header.
  onEditScore: (
    historyIndex: number,
    teamIndex: number,
    newScore: number
  ) => void; // Added prop for editing score
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  teams, // Keep teams for the header
  onEditScore, // Destructure the new prop
}) => {
  // State to manage which cell is being edited { historyIndex: number, teamIndex: number } or null
  const [editingCell, setEditingCell] = useState<{
    historyIndex: number;
    teamIndex: number;
  } | null>(null);
  // State to hold the value of the input field during editing
  const [editedScore, setEditedScore] = useState<string>("");

  if (history.length === 0) {
    return null;
  }

  // Function to start editing a cell
  const handleEditClick = (
    historyIndex: number,
    teamIndex: number,
    currentScore: number
  ) => {
    setEditingCell({ historyIndex, teamIndex });
    setEditedScore(currentScore.toString()); // Set the initial value of the input to the current score
  };

  // Function to handle input change during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedScore(e.target.value);
  };

  // Function to handle saving the edited score
  const handleSaveEdit = (historyIndex: number, teamIndex: number) => {
    const score = parseInt(editedScore, 10); // Parse the input value as an integer

    // Check if the parsed score is a valid number
    if (!isNaN(score)) {
      onEditScore(historyIndex, teamIndex, score); // Call the onEditScore prop
    } else {
      // Optionally, handle invalid input (e.g., show an error message)
      console.warn("Invalid score entered:", editedScore);
    }

    // Exit editing mode
    setEditingCell(null);
    setEditedScore("");
  };

  // Function to handle key down events in the input (e.g., Enter to save)
  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    historyIndex: number,
    teamIndex: number
  ) => {
    if (event.key === "Enter") {
      handleSaveEdit(historyIndex, teamIndex);
    } else if (event.key === "Escape") {
      // Cancel editing on Escape key
      setEditingCell(null);
      setEditedScore("");
    }
  };

  // Function to handle blur event (clicking outside the input)
  const handleInputBlur = (historyIndex: number, teamIndex: number) => {
    // Save the edit when the input loses focus
    handleSaveEdit(historyIndex, teamIndex);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-2 mt-6">
      <h2 className="text-lg font-semibold text-center">
        Historial de Partida
      </h2>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left text-sm font-medium text-muted-foreground">
                Fase
              </th>
              {/* Use the teams prop to render the team names in the header */}
              {teams.map((team, index) => (
                <th
                  key={index}
                  className="border border-border p-3 text-left text-sm font-medium text-muted-foreground"
                >
                  {team.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map(
              (
                historyEntry,
                historyIndex // Renamed index to historyIndex for clarity
              ) => (
                <tr
                  key={historyIndex}
                  className="odd:bg-background even:bg-muted/20"
                >
                  <td className="border border-border p-3 text-sm font-mono text-center">
                    {historyIndex + 1}
                  </td>
                  {historyEntry.snapshot.map(
                    (
                      teamScoreEntry,
                      teamIndex // Renamed index to teamIndex for clarity
                    ) => (
                      <td
                        key={teamIndex}
                        className="border border-border p-3 text-sm font-mono text-center cursor-pointer" // Added cursor-pointer to indicate interactivity
                        onClick={() =>
                          handleEditClick(
                            historyIndex,
                            teamIndex,
                            teamScoreEntry.score
                          )
                        } // Add onClick to start editing
                      >
                        {/* Conditional rendering: show input if editing, otherwise show score */}
                        {editingCell?.historyIndex === historyIndex &&
                        editingCell?.teamIndex === teamIndex ? (
                          <Input
                            type="number"
                            value={editedScore}
                            onChange={handleInputChange}
                            onKeyDown={(event) =>
                              handleInputKeyDown(event, historyIndex, teamIndex)
                            }
                            onBlur={() =>
                              handleInputBlur(historyIndex, teamIndex)
                            } // Save on blur
                            autoFocus // Automatically focus the input when it appears
                            className="w-16 h-8 text-center text-sm p-1" // Adjust styling as needed
                          />
                        ) : (
                          <span
                            className={`${
                              historyEntry.changedTeamIndex === teamIndex
                                ? "text-green-700 dark:text-green-400 font-bold"
                                : "text-red-700 dark:text-red-400 font-bold" // This coloring might need adjustment based on the new edit functionality
                            }`}
                          >
                            {teamScoreEntry.score}
                          </span>
                        )}
                      </td>
                    )
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
