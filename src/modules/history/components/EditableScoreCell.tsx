// src/modules/history/components/EditableScoreCell.tsx
import { Input } from "@/components/ui/input";
import React from "react";

interface EditableScoreCellProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur: () => void;
}

export const EditableScoreCell: React.FC<EditableScoreCellProps> = ({
  value,
  onChange,
  onKeyDown,
  onBlur,
}) => (
  <Input
    type="number"
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onBlur={onBlur}
    autoFocus
    className="w-16 h-8 text-center text-sm p-1"
  />
);