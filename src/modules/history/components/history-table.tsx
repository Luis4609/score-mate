// src/modules/history/components/history-table.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { HistoryEntry, Team } from "@/lib/types"; // Assuming Team is also needed for context, e.g. team names

interface HistoryTableProps {
  history: HistoryEntry[];
  teams: Team[]; // Current teams, used for table headers
  onEditScore: (
    historyIndex: number,
    teamIndexInSnapshot: number, // Clarified name
    newScore: number
  ) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,// Current team list for headers
  onEditScore,
}) => {
  // State to manage which cell is being edited: { historyIndex, teamIndexInSnapshot }
  const [editingCell, setEditingCell] = useState<{
    historyIndex: number;
    teamIndexInSnapshot: number;
  } | null>(null);
  // State to hold the value of the input field during editing
  const [editedScore, setEditedScore] = useState<string>("");

  if (history.length === 0) {
    return null; // Don't render anything if history is empty
  }

  // Function to start editing a cell
  const handleEditClick = (
    historyIndex: number,
    teamIndexInSnapshot: number,
    currentScore: number
  ) => {
    setEditingCell({ historyIndex, teamIndexInSnapshot });
    setEditedScore(currentScore.toString());
  };

  // Function to handle input change during editing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedScore(e.target.value);
  };

  // Function to save the edited score
  const handleSaveEdit = (historyIndex: number, teamIndexInSnapshot: number) => {
    const score = parseInt(editedScore, 10);
    if (!isNaN(score)) {
      onEditScore(historyIndex, teamIndexInSnapshot, score);
    } else {
      console.warn("Invalid score entered:", editedScore);
    }
    setEditingCell(null);
    setEditedScore("");
  };

  // Function to handle key down events (Enter to save, Escape to cancel)
  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    historyIndex: number,
    teamIndexInSnapshot: number
  ) => {
    if (event.key === "Enter") {
      handleSaveEdit(historyIndex, teamIndexInSnapshot);
    } else if (event.key === "Escape") {
      setEditingCell(null);
      setEditedScore("");
    }
  };

  // Function to handle blur event (clicking outside the input) to save
  const handleInputBlur = (historyIndex: number, teamIndexInSnapshot: number) => {
    handleSaveEdit(historyIndex, teamIndexInSnapshot);
  };

  return (
    <div className="flex w-full max-w-sm md:max-w-md flex-col gap-2 mt-6">
      <h2 className="text-lg font-semibold text-center">Game History</h2>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border border-border p-3 text-left text-sm font-medium text-muted-foreground sticky left-0 bg-muted/50 z-10">
                Round
              </th>
              {/* Render headers based on the current 'teams' prop */}
              {/* This assumes the number of columns should match the current number of teams */}
              {/* And that history snapshots will be mapped to these columns by name or a stable ID if available */}
              {/* For simplicity, if a team from current `teams` is not in a historical snapshot, its cell will be empty. */}
              {/* Or, if snapshots can have varying teams, headers might need to be dynamic or based on all teams ever present. */}
              {/* The original code used historyEntry.snapshot to determine columns per row, this version uses current `teams` for consistent column headers. */}
              {/* Let's revert to snapshot-based columns for data rows to match `useScoreGame`'s history structure. */}
              {history[0]?.snapshot.map((teamInSnapshot, index) => (
                 <th
                  key={`header-${teamInSnapshot.name}-${index}`} // Use name for more stable key if names are unique
                  className="border border-border p-3 text-left text-sm font-medium text-muted-foreground"
                >
                  {teamInSnapshot.name} {/* Display name from the first snapshot's structure */}
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
                <td className="border border-border p-3 text-sm font-mono text-center sticky left-0 bg-inherit z-0">
                  {historyIndex + 1}
                </td>
                {historyEntry.snapshot.map((teamScoreEntry, teamIndexInSnapshot) => {
                  const currentScore = teamScoreEntry.score;
                  let cellStyle = "";

                  // Determine if this cell was the one that changed in this history entry
                  if (historyEntry.changedTeamIndex === teamIndexInSnapshot) {
                    const previousHistoryEntry = historyIndex > 0 ? history[historyIndex - 1] : null;
                    const previousTeamScoreEntry = previousHistoryEntry?.snapshot[teamIndexInSnapshot];

                    if (previousTeamScoreEntry !== undefined && previousTeamScoreEntry !== null) {
                      if (currentScore > previousTeamScoreEntry.score) {
                        cellStyle = "text-green-600 dark:text-green-400 font-bold";
                      } else if (currentScore < previousTeamScoreEntry.score) {
                        cellStyle = "text-red-600 dark:text-red-400 font-bold";
                      } else {
                        cellStyle = "font-bold"; // Score changed but is the same (e.g. edit, or capped)
                      }
                    } else {
                      // Team score changed, but no direct previous score at this index (e.g. team just added, or history structure changed)
                      // or it's the first entry for this team's score column
                      cellStyle = "text-blue-600 dark:text-blue-400 font-bold"; // Style for new scores or first appearance
                    }
                  } else if (historyEntry.changedTeamIndex === null && historyIndex > 0) {
                    // This entry was due to a reset or team addition/removal, not a specific score change by index.
                    // Compare with previous state if possible.
                     const previousHistoryEntry = history[historyIndex - 1];
                     const previousTeamScoreEntry = previousHistoryEntry?.snapshot[teamIndexInSnapshot];
                     if (previousTeamScoreEntry !== undefined && previousTeamScoreEntry !== null) {
                        if (currentScore > previousTeamScoreEntry.score) {
                            cellStyle = "text-green-500"; // More subtle green
                        } else if (currentScore < previousTeamScoreEntry.score) {
                            cellStyle = "text-red-500"; // More subtle red
                        }
                     } else if (currentScore > 0) { // New team in this snapshot row with a score
                        cellStyle = "text-blue-500";
                     }
                  }


                  return (
                    <td
                      key={`${historyIndex}-${teamIndexInSnapshot}-${teamScoreEntry.name}`}
                      className="border border-border p-3 text-sm font-mono text-center cursor-pointer"
                      onClick={() =>
                        handleEditClick(
                          historyIndex,
                          teamIndexInSnapshot,
                          currentScore
                        )
                      }
                    >
                      {editingCell?.historyIndex === historyIndex &&
                      editingCell?.teamIndexInSnapshot === teamIndexInSnapshot ? (
                        <Input
                          type="number"
                          value={editedScore}
                          onChange={handleInputChange}
                          onKeyDown={(event) =>
                            handleInputKeyDown(event, historyIndex, teamIndexInSnapshot)
                          }
                          onBlur={() => handleInputBlur(historyIndex, teamIndexInSnapshot)}
                          autoFocus
                          className="w-16 h-8 text-center text-sm p-1 bg-background" // Ensure input is visible
                        />
                      ) : (
                        <span className={cellStyle}>
                          {currentScore}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
