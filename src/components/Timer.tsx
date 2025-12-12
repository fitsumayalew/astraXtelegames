import { useEffect } from "react";
import { Progress } from "./ui/progress";

interface TimerProps {
  timeLeft: number;
  maxTime: number;
}

const Timer = ({ timeLeft, maxTime }: TimerProps) => {
  const percentage = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= 3;

  return (
    <div className="w-full p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-muted-foreground">Time Remaining</span>
        <span
          className={`text-3xl font-bold transition-all duration-300 ${
            isLowTime
              ? "text-destructive animate-pulse-slow scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              : "text-secondary"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-4 transition-all duration-300 ${isLowTime ? "animate-pulse-slow" : ""}`}
      />
    </div>
  );
};

export default Timer;
