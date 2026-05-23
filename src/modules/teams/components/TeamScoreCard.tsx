// src/modules/teams/components/TeamScoreCard.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Team } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

interface TeamScoreCardProps {
  team: Team;
  teamIndex: number;
  pointsToAddValue: string | undefined;
  onPointsToAddChange: (teamIndex: number, value: string) => void;
  onHandleCustomPoints: (teamIndex: number) => void;
  onRemoveTeam: (teamIndex: number) => void;
  isLeader?: boolean;
}

const TeamScoreCard: React.FC<TeamScoreCardProps> = ({
  team,
  teamIndex,
  pointsToAddValue,
  onPointsToAddChange,
  onHandleCustomPoints,
  onRemoveTeam,
  isLeader,
}) => {
  return (
    <div className="w-full">
      <Card className={cn(
        "overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-200",
        isLeader ? "border-emerald-500/30 ring-1 ring-emerald-500/10" : "border-border"
      )}>
        <div className="flex items-center justify-between p-3 sm:p-4 gap-2">
          {/* Left: Score Badge & Team Name */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Score Badge */}
            <div className={cn(
              "flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl font-extrabold text-base sm:text-lg border shadow-inner transition-all duration-300",
              isLeader
                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30 scale-105"
                : "bg-primary/10 text-primary border-primary/20"
            )}>
              {team.score}
            </div>
            {/* Team Name */}
            <span className="font-bold text-sm sm:text-base text-foreground truncate max-w-[100px] sm:max-w-[200px]">
              {team.name}
            </span>
          </div>

          {/* Right: Score inputs & buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Input
              type="number"
              value={pointsToAddValue || ""}
              placeholder="+/-"
              className="w-14 sm:w-16 h-9 text-center text-sm p-1 bg-background border-muted focus-visible:ring-primary"
              onChange={(e) => onPointsToAddChange(teamIndex, e.target.value)}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  onHandleCustomPoints(teamIndex);
                }
              }}
              aria-label={`Points to add for ${team.name}`}
            />
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-3 text-xs font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              onClick={() => onHandleCustomPoints(teamIndex)}
              aria-label={`Añadir puntos al equipo ${team.name}`}
            >
              Añadir
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 shrink-0 text-red-600 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white rounded-xl transition-all duration-200"
              onClick={() => onRemoveTeam(teamIndex)}
              aria-label={`Remove team ${team.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const MemoizedTeamScoreCard = React.memo(TeamScoreCard);
