import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { HistoryEntry, Team } from "@/lib/types";

interface HistoryTableProps {
  history: HistoryEntry[];
  teams: Team[]; // Current teams
  onEditScore: (
    historyIndex: number,
    teamIndexInSnapshot: number,
    newScore: number
  ) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  onEditScore,
}) => {
  // State to manage which cell is being edited
  const [editingCell, setEditingCell] = useState<{
    historyIndex: number;
    teamIndexInSnapshot: number;
  } | null>(null);
  // State to hold the value of the input field during editing
  const [editedScore, setEditedScore] = useState<string>("");

  if (history.length === 0) {
    return null;
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

  // Helper to calculate delta and styles
  const getScoreChangeDetails = (historyEntry: HistoryEntry, historyIndex: number, teamIndexInSnapshot: number) => {
    const currentScore = historyEntry.snapshot[teamIndexInSnapshot]?.score ?? 0;
    const previousHistoryEntry = historyIndex > 0 ? history[historyIndex - 1] : null;
    const previousTeamScoreEntry = previousHistoryEntry?.snapshot[teamIndexInSnapshot];

    let diff = 0;
    let cellStyle = "";
    let hasChange = false;

    if (historyEntry.changedTeamIndex === teamIndexInSnapshot) {
      hasChange = true;
      if (previousTeamScoreEntry !== undefined && previousTeamScoreEntry !== null) {
        diff = currentScore - previousTeamScoreEntry.score;
        if (diff > 0) {
          cellStyle = "text-green-600 dark:text-green-400 font-bold";
        } else if (diff < 0) {
          cellStyle = "text-red-600 dark:text-red-400 font-bold";
        } else {
          cellStyle = "font-bold";
        }
      } else {
        diff = currentScore;
        cellStyle = "text-blue-600 dark:text-blue-400 font-bold";
      }
    } else if (historyEntry.changedTeamIndex === null && historyIndex > 0) {
      if (previousTeamScoreEntry !== undefined && previousTeamScoreEntry !== null) {
        diff = currentScore - previousTeamScoreEntry.score;
        if (diff !== 0) {
          hasChange = true;
          if (diff > 0) {
            cellStyle = "text-green-500";
          } else {
            cellStyle = "text-red-500";
          }
        }
      } else if (currentScore > 0) {
        hasChange = true;
        diff = currentScore;
        cellStyle = "text-blue-500";
      }
    }

    return { diff, cellStyle, hasChange, currentScore };
  };

  return (
    <div className="w-full">
      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">
                Ronda
              </th>
              {history[0]?.snapshot.map((teamInSnapshot, index) => (
                <th
                  key={`header-${teamInSnapshot.name}-${index}`}
                  className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {teamInSnapshot.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.map((historyEntry, historyIndex) => (
              <tr
                key={historyIndex}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="p-3 text-center text-sm font-mono text-muted-foreground font-semibold bg-muted/10">
                  {historyIndex + 1}
                </td>
                {historyEntry.snapshot.map((teamScoreEntry, teamIndexInSnapshot) => {
                  const { cellStyle, currentScore } = getScoreChangeDetails(
                    historyEntry,
                    historyIndex,
                    teamIndexInSnapshot
                  );

                  return (
                    <td
                      key={`${historyIndex}-${teamIndexInSnapshot}-${teamScoreEntry.name}`}
                      className="p-3 text-sm font-mono cursor-pointer hover:bg-primary/5 transition-colors"
                      onClick={() =>
                        handleEditClick(
                          historyIndex,
                          teamIndexInSnapshot,
                          currentScore
                        )
                      }
                    >
                      <div className="min-h-[2rem] flex items-center justify-start">
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
                            className="w-20 h-8 text-center text-sm px-1 py-0.5 bg-background border-primary focus-visible:ring-primary"
                          />
                        ) : (
                          <span className={cellStyle}>
                            {currentScore}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE TIMELINE CARDS VIEW */}
      <div className="md:hidden relative pl-6 border-l-2 border-primary/20 space-y-6 py-2 ml-4">
        {history.map((historyEntry, historyIndex) => (
          <div key={historyIndex} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[33px] top-3.5 w-4 h-4 rounded-full border-4 border-background bg-primary shadow-sm" />

            {/* Round Card */}
            <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3 hover:border-primary/40 transition-all">
              {/* Header: Round Name */}
              <div className="flex items-center justify-between pb-2 border-b border-muted">
                <span className="font-bold text-sm text-primary">
                  Ronda {historyIndex + 1}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Toca puntuación para editar
                </span>
              </div>

              {/* Teams & Scores */}
              <div className="space-y-2.5">
                {historyEntry.snapshot.map((teamScoreEntry, teamIndexInSnapshot) => {
                  const { diff, cellStyle, hasChange, currentScore } = getScoreChangeDetails(
                    historyEntry,
                    historyIndex,
                    teamIndexInSnapshot
                  );

                  return (
                    <div
                      key={`${historyIndex}-${teamIndexInSnapshot}-${teamScoreEntry.name}`}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {teamScoreEntry.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Points added/subtracted bubble */}
                        {hasChange && diff !== 0 && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm ${
                            diff > 0 
                              ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                              : "bg-red-500/10 text-red-600 dark:text-red-400"
                          }`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}

                        {/* Interactive score button/input */}
                        <div
                          onClick={() =>
                            handleEditClick(
                              historyIndex,
                              teamIndexInSnapshot,
                              currentScore
                            )
                          }
                          className="min-w-[2.5rem] flex justify-end"
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
                              className="w-16 h-7 text-center text-xs p-1 bg-background border-primary"
                            />
                          ) : (
                            <button className={`font-mono text-sm font-bold bg-muted/50 hover:bg-muted text-foreground px-2 py-1 rounded-lg border border-border/40 transition-colors ${cellStyle}`}>
                              {currentScore}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
