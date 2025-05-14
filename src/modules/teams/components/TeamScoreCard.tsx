// src/modules/teams/components/TeamScoreCard.tsx
import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Team } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import React from 'react';

interface TeamScoreCardProps {
  team: Team;
  teamIndex: number;
  pointsToAddValue: string | undefined; // Value for this team's point input
  onPointsToAddChange: (teamIndex: number, value: string) => void;
  onHandleCustomPoints: (teamIndex: number) => void;
  onRemoveTeam: (teamIndex: number) => void;
  // onAddScore: (teamIndex: number, points: number) => void; // If you plan to add fixed point buttons directly here
}

const TeamScoreCard: React.FC<TeamScoreCardProps> = ({
  team,
  teamIndex,
  pointsToAddValue,
  onPointsToAddChange,
  onHandleCustomPoints,
  onRemoveTeam,
  // onAddScore,
}) => {
  return (
    <div className="flex w-full flex-row items-center justify-center rounded-md">
      <Card className="flex surface w-full">
        <CardHeader className="flex flex-row text-center gap-4 items-center">
          <CardTitle className="text-xl">{team.name}</CardTitle>
          <CardDescription>Score: {team.score}</CardDescription>
        </CardHeader>
        <div className="flex flex-row items-center justify-center gap-2 pr-6 ml-auto">
          <Input
            type="number"
            value={pointsToAddValue || ""}
            className="w-20"
            onChange={(e) => onPointsToAddChange(teamIndex, e.target.value)}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter') {
                onHandleCustomPoints(teamIndex);
              }
            }}
            aria-label={`Points to add for ${team.name}`}
          />
          <Button
            variant="secondary"
            onClick={() => onHandleCustomPoints(teamIndex)}
            aria-label={`Add points to team ${team.name}`}
          >
            Add
          </Button>
          {/* Example for fixed point buttons: */}
          {/* <Button variant="outline" onClick={() => onAddScore(teamIndex, 5)}>+5</Button> */}
          {/* <Button variant="outline" onClick={() => onAddScore(teamIndex, 10)}>+10</Button> */}
          <Button
            variant="destructive"
            onClick={() => onRemoveTeam(teamIndex)}
            aria-label={`Remove team ${team.name}`}
          >
            <Trash2 />
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Memoize TeamScoreCard to prevent unnecessary re-renders if its props haven't changed.
export const MemoizedTeamScoreCard = React.memo(TeamScoreCard);
