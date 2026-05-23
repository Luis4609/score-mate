import { describe, it, expect, vi } from "vitest";
import { getScoreDiff, getTeamTotals } from "./history-table-utils";
import { HistoryEntry } from "@/lib/types";

describe("history-table-utils", () => {
  describe("getScoreDiff", () => {
    it("should return correct difference for subsequent rounds", () => {
      const mockHistory: HistoryEntry[] = [
        {
          snapshot: [
            { name: "Team A", score: 10 },
            { name: "Team B", score: 20 },
          ],
          changedTeamIndex: 0,
        },
        {
          snapshot: [
            { name: "Team A", score: 35 },
            { name: "Team B", score: 20 },
          ],
          changedTeamIndex: 0,
        },
      ];

      // Round index 1, Team 0: 35 - 10 = 25
      const diff = getScoreDiff(mockHistory, 1, 0);
      expect(diff).toBe(25);

      // Round index 1, Team 1: 20 - 20 = 0
      const diffUnchanged = getScoreDiff(mockHistory, 1, 1);
      expect(diffUnchanged).toBe(0);
    });

    it("should return the score itself as the difference for the first round", () => {
      const mockHistory: HistoryEntry[] = [
        {
          snapshot: [
            { name: "Team A", score: 15 },
            { name: "Team B", score: 5 },
          ],
          changedTeamIndex: null,
        },
      ];

      // Round index 0, Team 0 should return 15
      const diffTeamA = getScoreDiff(mockHistory, 0, 0);
      expect(diffTeamA).toBe(15);

      // Round index 0, Team 1 should return 5
      const diffTeamB = getScoreDiff(mockHistory, 0, 1);
      expect(diffTeamB).toBe(5);
    });

    it("should log error and return 0 for invalid bounds", () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mockHistory: HistoryEntry[] = [
        {
          snapshot: [{ name: "Team A", score: 10 }],
          changedTeamIndex: null,
        },
      ];

      // Invalid history index
      const diff = getScoreDiff(mockHistory, 5, 0);
      expect(diff).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Invalid historyIndex in getScoreDiff");

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getTeamTotals", () => {
    it("should return scores of the last entry when history is present", () => {
      const mockHistory: HistoryEntry[] = [
        {
          snapshot: [
            { name: "Team A", score: 10 },
            { name: "Team B", score: 20 },
          ],
          changedTeamIndex: null,
        },
        {
          snapshot: [
            { name: "Team A", score: 50 },
            { name: "Team B", score: 35 },
          ],
          changedTeamIndex: 0,
        },
      ];

      const totals = getTeamTotals(mockHistory, 2);
      expect(totals).toEqual([50, 35]);
    });

    it("should return an array of 0s if history is empty", () => {
      const totals = getTeamTotals([], 3);
      expect(totals).toEqual([0, 0, 0]);
    });
  });
});
