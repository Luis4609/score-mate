// src/modules/teams/components/TeamsDisplay.tsx
import React from 'react';
import { Team, PointsToAdd } from '@/lib/types';
import { MemoizedTeamScoreCard } from './TeamScoreCard'; // Import the memoized version

interface TeamsDisplayProps {
  teams: Team[];
  pointsToAdd: PointsToAdd;
  setPointsToAdd: (points: PointsToAdd | ((prevPoints: PointsToAdd) => PointsToAdd)) => void; // Allow functional updates
  onHandleCustomPoints: (index: number) => void;
  onRemoveTeam: (index: number) => void;
  // onAddScore: (index: number, points: number) => void; // Pass this down if TeamScoreCard handles fixed points
}

export const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  pointsToAdd,
  setPointsToAdd,
  onHandleCustomPoints,
  onRemoveTeam,
  // onAddScore,
}) => {
  // Handler for when the points input changes for a specific team
  const handlePointsChange = (teamIndex: number, value: string) => {
    setPointsToAdd(prevPoints => ({
      ...prevPoints,
      [teamIndex]: value,
    }));
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      {teams.map((team, index) => (
        // It's generally better to use a unique ID from the team data if available,
        // e.g., team.id. Using index is okay if the list order is stable or items are only added/removed from the end.
        <MemoizedTeamScoreCard
          key={team.name + '-' + index} // Using name + index for a more stable key if names are unique
          team={team}
          teamIndex={index}
          pointsToAddValue={pointsToAdd[index]}
          onPointsToAddChange={handlePointsChange}
          onHandleCustomPoints={onHandleCustomPoints}
          onRemoveTeam={onRemoveTeam}
          // onAddScore={onAddScore} // Pass down if needed
        />
      ))}
    </div>
  );
};
