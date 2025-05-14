import { HistoryEntry } from "@/lib/types";

export const getScoreDiff = (
    history: HistoryEntry[],
    historyIndex: number,
    teamIndex: number
  ): number => {
    if (historyIndex < 0 || historyIndex >= history.length) {
      console.error("Invalid historyIndex in getScoreDiff");
      return 0;
    }
  
    const currentPhaseScore: number = history[historyIndex].snapshot[teamIndex].score;
  
    // If it's the first phase, the difference is the score itself
    if (historyIndex === 0) {
      return currentPhaseScore;
    }
  
    // If it's not the first phase, the difference is the current phase's score minus the previous phase's score
    const previousPhaseScore: number = history[historyIndex - 1].snapshot[teamIndex].score;
    return currentPhaseScore - previousPhaseScore;
  };
  
  // Function to calculate the total score for each team
  // This function assumes historyEntry.snapshot[teamIndex] stores the cumulative total up to that phase.
  export const getTeamTotals = (
    history: HistoryEntry[],
    numberOfTeams: number
  ): number[] => {
    // If there's no history, all totals are 0
    if (history.length === 0) {
      return Array(numberOfTeams).fill(0);
    }
  
    // The total score for each team is the score in the snapshot of the last history entry
    const lastHistoryEntry = history[history.length - 1];
    return lastHistoryEntry.snapshot.map((team) => team.score); // Assuming snapshot contains the cumulative totals
  };
  