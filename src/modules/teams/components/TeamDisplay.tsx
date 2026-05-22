// src/modules/teams/components/TeamsDisplay.tsx
import React from 'react';
import { Team, PointsToAdd, GameConfig } from '@/lib/types';
import { MemoizedTeamScoreCard } from './TeamScoreCard';

interface TeamsDisplayProps {
  teams: Team[];
  pointsToAdd: PointsToAdd;
  setPointsToAdd: (points: PointsToAdd | ((prevPoints: PointsToAdd) => PointsToAdd)) => void;
  onHandleCustomPoints: (index: number) => void;
  onRemoveTeam: (index: number) => void;
  gameConfig: GameConfig;
}

export const TeamsDisplay: React.FC<TeamsDisplayProps> = ({
  teams,
  pointsToAdd,
  setPointsToAdd,
  onHandleCustomPoints,
  onRemoveTeam,
  gameConfig,
}) => {
  const handlePointsChange = (teamIndex: number, value: string) => {
    setPointsToAdd(prevPoints => ({
      ...prevPoints,
      [teamIndex]: value,
    }));
  };

  // Determine current winning score and highlight winning teams
  const getLeaderIndices = () => {
    if (teams.length < 2) return []; // Only highlight leaders if there are at least 2 teams
    const scores = teams.map(t => t.score);
    
    if (gameConfig.winningCondition === 'highest_wins') {
      const maxScore = Math.max(...scores);
      // Only highlight if maxScore is greater than 0 to avoid highlighting all at 0
      if (maxScore <= 0) return [];
      return teams.reduce<number[]>((acc, t, idx) => {
        if (t.score === maxScore) acc.push(idx);
        return acc;
      }, []);
    } else if (gameConfig.winningCondition === 'lowest_wins') {
      const minScore = Math.min(...scores);
      // For games where lowest wins, highlight only if there has been any point change
      const hasAnyScoreChange = teams.some(t => t.score !== 0);
      if (!hasAnyScoreChange) return [];
      return teams.reduce<number[]>((acc, t, idx) => {
        if (t.score === minScore) acc.push(idx);
        return acc;
      }, []);
    }
    return [];
  };

  const leaderIndices = getLeaderIndices();

  return (
    <div className="flex w-full flex-col gap-3">
      {teams.map((team, index) => (
        <MemoizedTeamScoreCard
          key={team.name + '-' + index}
          team={team}
          teamIndex={index}
          pointsToAddValue={pointsToAdd[index]}
          onPointsToAddChange={handlePointsChange}
          onHandleCustomPoints={onHandleCustomPoints}
          onRemoveTeam={onRemoveTeam}
          isLeader={leaderIndices.includes(index)}
        />
      ))}
    </div>
  );
};
