import React, { useState } from "react";
import { HistoryEntry, Team } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreProgressionChartProps {
  history: HistoryEntry[];
  teams: Team[];
}

const PREDEFINED_COLORS = [
  "rgb(139, 92, 246)", // Violet
  "rgb(16, 185, 129)", // Emerald
  "rgb(59, 130, 246)", // Blue
  "rgb(245, 158, 11)", // Amber
  "rgb(244, 63, 94)",  // Rose
  "rgb(6, 182, 212)",  // Cyan
  "rgb(249, 115, 22)", // Orange
  "rgb(168, 85, 247)", // Purple
];

export const ScoreProgressionChart: React.FC<ScoreProgressionChartProps> = ({
  history,
  teams,
}) => {
  const [hoveredTeamIndex, setHoveredTeamIndex] = useState<number | null>(null);

  if (history.length === 0 || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-2xl">
        <svg
          className="w-12 h-12 mb-3 opacity-30 animate-pulse text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm font-medium">Aún no hay suficientes rondas</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Registra puntuaciones para visualizar la progresión.
        </p>
      </div>
    );
  }

  // SVG Config
  const width = 500;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Extract score progression for each team currently in the game
  const teamProgressions = teams.map((team, teamIdx) => {
    const scores = history.map((entry) => {
      const snapTeam = entry.snapshot.find((t) => t.name === team.name);
      return snapTeam ? snapTeam.score : 0;
    });
    return {
      name: team.name,
      scores,
      color: PREDEFINED_COLORS[teamIdx % PREDEFINED_COLORS.length],
    };
  });

  // Calculate scores limits
  const allScores = history.flatMap((entry) => entry.snapshot.map((t) => t.score));
  const maxScoreVal = allScores.length > 0 ? Math.max(...allScores, 10) : 10;
  const minScoreVal = 0;
  const scoreRange = maxScoreVal - minScoreVal;

  const totalRounds = history.length;

  // Map data coordinates
  const getCoordinates = (roundIdx: number, score: number) => {
    const x =
      totalRounds > 1
        ? paddingLeft + (roundIdx / (totalRounds - 1)) * chartWidth
        : paddingLeft + chartWidth / 2;
    const y =
      paddingTop + chartHeight - ((score - minScoreVal) / scoreRange) * chartHeight;
    return { x, y };
  };

  // Generate grid lines
  const gridLinesCount = 4;
  const gridYValues = Array.from(
    { length: gridLinesCount + 1 },
    (_, i) => minScoreVal + (i * scoreRange) / gridLinesCount
  );

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center px-4 py-2 bg-muted/20 rounded-xl border border-border/40">
        {teamProgressions.map((prog, idx) => {
          const isHovered = hoveredTeamIndex === idx;
          const isAnyHovered = hoveredTeamIndex !== null;
          return (
            <button
              key={prog.name}
              onMouseEnter={() => setHoveredTeamIndex(idx)}
              onMouseLeave={() => setHoveredTeamIndex(null)}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold transition-all duration-200",
                isAnyHovered && !isHovered ? "opacity-40 scale-95" : "opacity-100 scale-100"
              )}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 border"
                style={{
                  backgroundColor: prog.color,
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              />
              <span className="text-foreground truncate max-w-[100px]">{prog.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                ({prog.scores[prog.scores.length - 1]} pts)
              </span>
            </button>
          );
        })}
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full bg-card border rounded-2xl p-2 shadow-sm overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ contentVisibility: "auto" }}
        >
          {/* Y Axis Grid Lines */}
          {gridYValues.map((scoreVal, idx) => {
            const { y } = getCoordinates(0, scoreVal);
            return (
              <g key={`grid-y-${idx}`} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  className="text-border"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-muted-foreground font-bold"
                >
                  {Math.round(scoreVal)}
                </text>
              </g>
            );
          })}

          {/* X Axis Grid Lines & Round Labels */}
          {totalRounds > 0 &&
            Array.from({ length: totalRounds }).map((_, roundIdx) => {
              const { x } = getCoordinates(roundIdx, 0);
              // Show max 8 round labels on X axis to prevent crowding
              const showLabel =
                totalRounds <= 8 ||
                roundIdx === 0 ||
                roundIdx === totalRounds - 1 ||
                roundIdx % Math.ceil(totalRounds / 6) === 0;

              return (
                <g key={`grid-x-${roundIdx}`} className="opacity-40">
                  {showLabel && (
                    <>
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={height - paddingBottom}
                        stroke="currentColor"
                        strokeWidth={0.5}
                        strokeDasharray="2 4"
                        className="text-border/60"
                      />
                      <text
                        x={x}
                        y={height - paddingBottom + 16}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-muted-foreground font-bold"
                      >
                        R{roundIdx + 1}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

          {/* SVG paths for score lines */}
          {teamProgressions.map((prog, teamIdx) => {
            if (prog.scores.length === 0) return null;

            // Generate path string
            const points = prog.scores.map((score, rIdx) => getCoordinates(rIdx, score));
            let pathD = "";
            if (points.length > 1) {
              pathD = points.reduce(
                (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                ""
              );
            }

            const isHovered = hoveredTeamIndex === teamIdx;
            const isAnyHovered = hoveredTeamIndex !== null;

            return (
              <g
                key={`line-${prog.name}`}
                onMouseEnter={() => setHoveredTeamIndex(teamIdx)}
                onMouseLeave={() => setHoveredTeamIndex(null)}
                className="transition-all duration-300"
              >
                {/* Thick background line for easier hover detection */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={12}
                    className="cursor-pointer"
                  />
                )}

                {/* Visible line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={prog.color}
                    strokeWidth={isHovered ? 3.5 : isAnyHovered ? 1.5 : 2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    style={{
                      opacity: isHovered ? 1 : isAnyHovered ? 0.35 : 0.9,
                    }}
                  />
                )}

                {/* Points dots */}
                {points.map((p, pIdx) => {
                  const scoreValue = prog.scores[pIdx];
                  const showLabel = isHovered || (!isAnyHovered && points.length <= 15);

                  return (
                    <g key={`dot-${prog.name}-${pIdx}`} className="transition-all">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 5.5 : isAnyHovered ? 2.5 : 4}
                        fill={prog.color}
                        stroke="var(--card)"
                        strokeWidth={isHovered ? 1.5 : 1}
                        className="transition-all duration-200"
                        style={{
                          opacity: isHovered ? 1 : isAnyHovered ? 0.4 : 1,
                        }}
                      />
                      {/* Value label text above dot */}
                      {showLabel && (
                        <text
                          x={p.x}
                          y={p.y - 8}
                          textAnchor="middle"
                          fill={prog.color}
                          className="text-[8px] font-mono font-extrabold filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                          style={{
                            opacity: isHovered ? 1 : 0.75,
                          }}
                        >
                          {scoreValue}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
