"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ChoiceButtonProps {
  label: string;
  content: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ChoiceButton({ label, content, selected, onClick, disabled }: ChoiceButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center w-full h-24 rounded-xl border-2 text-sm font-medium transition-all duration-200",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:border-primary/50 hover:bg-accent",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span className="absolute left-3 top-3 text-xs text-muted-foreground">{label}</span>
      <span className="text-center px-2 line-clamp-2">{content}</span>
    </motion.button>
  );
}
