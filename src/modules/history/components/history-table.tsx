import { Input } from "@/components/ui/input"; // Assuming Input is available for editing
import { HistoryEntry, Team } from "@/lib/types";
// Assuming getScoreDiff and getTeamTotals are correctly implemented
import { getScoreDiff, getTeamTotals } from "../utils/history-table-utils";
import React, { useState } from "react"; // Import useState

interface HistoryTableProps {
  history: HistoryEntry[];
  teams: Team[]; // Used for table header and potentially for total calculation logic
  onEditScore: (
    historyIndex: number,
    teamIndex: number,
    newDelta: number // newDelta represents the change in score for this phase
  ) => void; // Prop to notify parent component of score edit
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  teams,
  onEditScore,
}) => {
  // Recalculate teamTotals whenever the 'history' prop changes
  // React will automatically re-run this when 'history' updates
  const teamTotals = getTeamTotals(history, teams.length);

  // State to manage which cell is being edited { historyIndex: number, teamIndex: number } or null
  const [editingCell, setEditingCell] = useState<{
    historyIndex: number;
    teamIndex: number;
  } | null>(null);

  // State to hold the value of the input field during editing
  const [editedScore, setEditedScore] = useState<string>("");

  if (history.length === 0) {
    return null; // Render nothing if there's no history
  }

  // Function to start editing a cell
  const handleEditClick = (
    historyIndex: number,
    teamIndex: number,
  ) => {
    // Calculate the current delta for this phase and team to pre-fill the input
    const delta = getScoreDiff(history, historyIndex, teamIndex);
    setEditingCell({ historyIndex, teamIndex });
    setEditedScore(delta.toString());
  };

  // Function to handle input change during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedScore(e.target.value);
  };

  // Function to handle saving the edited score
  const handleSaveEdit = (historyIndex: number, teamIndex: number) => {
    const delta = parseInt(editedScore, 10);
    // Check if the parsed value is a valid number
    if (!isNaN(delta)) {
      // Call the parent's onEditScore function with the new delta
      // The parent is responsible for updating the history state
      onEditScore(historyIndex, teamIndex, delta);
    } else {
      console.warn("Invalid score entered:", editedScore);
    }
    // Exit editing mode regardless of whether the input was valid
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
            {history.map((historyEntry, historyIndex) => (
              <tr
                key={historyIndex}
                className="odd:bg-background even:bg-muted/20"
              >
                <td className="border border-border p-3 text-sm font-mono text-center">
                  {historyIndex + 1}
                </td>
                {/* Iterate through the snapshot array for team scores */}
                {historyEntry.snapshot.map((teamScoreEntry, teamIndex) => (
                  <td
                    key={teamIndex}
                    className="border border-border p-3 text-sm font-mono text-center cursor-pointer"
                    onClick={() =>
                      handleEditClick(
                        historyIndex,
                        teamIndex,
                      )
                    }
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
                        onBlur={() => handleInputBlur(historyIndex, teamIndex)} // Save on blur
                        autoFocus // Automatically focus the input when it appears
                        className="w-16 h-8 text-center text-sm p-1"
                      />
                    ) : (
                      <span
                        className={`${
                          historyEntry.changedTeamIndex === teamIndex
                            ? "text-green-700 dark:text-green-400 font-bold"
                            : "text-red-700 dark:text-red-400 font-bold"
                        }`}
                      >
                        {/* Calculate and display the score difference for this phase */}
                        {(() => {
                          const diff = getScoreDiff(history, historyIndex, teamIndex);
                          return diff > 0 ? "+" + diff : diff;
                        })()}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {/* Row for displaying total scores */}
            <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
              <td className="border border-border p-3 text-sm font-mono text-center">
                Total
              </td>
              {/* Map through the calculated teamTotals */}
              {teamTotals.map((total, teamIndex) => (
                <td
                  key={teamIndex}
                  className="border border-border p-3 text-sm font-mono text-center"
                >
                  {total}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
