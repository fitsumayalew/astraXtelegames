import { useEffect } from "react";
import { Progress } from "./ui/progress";

interface TimerProps {
  timeLeft: number;
  maxTime: number;
  frozen?: boolean;
}

const Timer = ({ timeLeft, maxTime, frozen = false }: TimerProps) => {
  const percentage = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= 3;

  return (
    <div className={`w-full p-3 sm:p-4 rounded-2xl border ${frozen ? "bg-sky-100/60 border-sky-300 animate-pulse-slow" : "bg-card/50 backdrop-blur-sm border-border/50"}`}>
      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
        <span className={`text-xs sm:text-sm font-semibold ${frozen ? "text-sky-800" : "text-muted-foreground"}`}>{frozen ? "Timer Frozen" : "Time Remaining"}</span>
        <span
          className={`text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 ${
            frozen
              ? "text-sky-700"
              : isLowTime
              ? "text-destructive animate-pulse-slow scale-105 sm:scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              : "text-secondary"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <Progress value={percentage} className={`h-3 sm:h-4 transition-all duration-300 ${frozen ? "bg-sky-200" : isLowTime ? "animate-pulse-slow" : ""}`} />
    </div>
  );
};

export default Timer;
