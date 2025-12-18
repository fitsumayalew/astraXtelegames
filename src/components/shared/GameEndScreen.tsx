import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { ReactNode } from "react";
import AnimatedCoin from "../ui/animated-coin";

interface GameEndScreenProps {
  won: boolean;
  stats: Array<{
    label: string;
    value: string | number;
  }>;
  coinsEarned?: number;
  onPlayAgain: () => void;
  replayCost?: number;
  replayDisabled?: boolean;
  additionalContent?: ReactNode;
  winMessage?: string;
  loseMessage?: string;
  theme?: {
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  /**
   * Use a shorter min-height to better align with layouts that already include headers.
   */
  compactHeight?: boolean;
}

const GameEndScreen = ({
  won,
  stats,
  coinsEarned,
  onPlayAgain,
  additionalContent,
  winMessage = "Congratulations!",
  loseMessage = "Game Over",
  replayCost,
  replayDisabled = false,
  compactHeight = false,
}: GameEndScreenProps) => {
  const heightClass = compactHeight
    ? "min-h-[calc(100vh-14rem)] md:min-h-[calc(100vh-16rem)]"
    : "min-h-screen";

  const headingStyle = { fontFamily: "'Bebas Neue','Anton','Impact','Oswald','Segoe UI',sans-serif" };

  return (
    <div className={`${heightClass} flex flex-col p-2 sm:p-3 animate-fade-in max-h-screen overflow-hidden`}>
      {/* Result Header */}
      <div className="flex-shrink-0 text-center py-4 sm:py-6">
        {won ? (
          <div className="inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-5 rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-300 to-yellow-100 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.22)]">
            <h1
              className="text-3xl md:text-5xl font-black tracking-wide text-yellow-900 drop-shadow-[0_3px_8px_rgba(255,255,255,0.7)]"
              style={headingStyle}
            >
              {winMessage}
            </h1>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-5 rounded-3xl bg-gradient-to-br from-red-900 via-red-700 to-red-500 border border-white shadow-[0_8px_20px_rgba(0,0,0,0.28)]">
            <h1
              className="text-3xl md:text-5xl font-black tracking-wide text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.65)]"
              style={headingStyle}
            >
              {loseMessage}
            </h1>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex-1 flex flex-col justify-center space-y-3 px-1.5 sm:px-3 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto w-full">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 border border-white rounded-xl p-4 md:p-6 text-center shadow-lg shadow-amber-300/40"
            >
              <p className="text-sm md:text-base font-semibold text-amber-800 uppercase tracking-wider mb-1" style={headingStyle}>
                {stat.label}
              </p>
              <p className="text-2xl md:text-4xl font-black text-amber-900" style={headingStyle}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {coinsEarned !== undefined && coinsEarned > 0 && (
          <div className="max-w-lg mx-auto w-full bg-gradient-to-br from-amber-400 via-amber-300 to-amber-200 border border-white rounded-xl p-4 md:p-6 shadow-xl shadow-amber-400/50">
            <div className="flex items-center justify-center gap-4">
              <AnimatedCoin size={42} />
              <div className="text-center space-y-0.5">
                <p className="text-sm md:text-base font-semibold text-amber-900 uppercase tracking-wide" style={headingStyle}>
                  Coins Earned
                </p>
                <p className="text-3xl md:text-5xl font-black text-yellow-900 drop-shadow-md" style={headingStyle}>
                  +{coinsEarned}
                </p>
              </div>
            </div>
          </div>
        )}

        {additionalContent}
      </div>

      {/* Play Again Button */}
      <div className="flex-shrink-0 pb-4 pt-4 md:pb-6 md:pt-6 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          {replayCost !== undefined && (
            <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-foreground bg-white/70 rounded-full px-3 py-1 md:px-4 md:py-1.5 shadow-sm border border-border">
              <AnimatedCoin size={20} />
              <span>Replay ({replayCost} coins)</span>
            </div>
          )}
          <Button
            onClick={onPlayAgain}
            size="lg"
            disabled={replayDisabled}
            className="h-20 w-20 md:h-24 md:w-24 rounded-full p-0 text-lg md:text-xl font-black bg-gradient-to-br from-[#15803d] via-[#22c55e] to-[#34d399] hover:brightness-110 transition-all shadow-xl hover:shadow-emerald-600/60 border-[4px] md:border-[5px] border-emerald-200 ring-2 md:ring-3 ring-emerald-400/70 ring-offset-1 md:ring-offset-2 ring-offset-white animate-pulse-wordle-btn hover:animate-none disabled:opacity-60"
          >
            <RotateCcw className="h-10 w-10 md:h-12 md:w-12" />
            <span className="sr-only">Restart</span>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.65); }
          50% { box-shadow: 0 0 22px 10px rgba(16, 185, 129, 0.35); }
        }
        .animate-pulse-wordle-btn {
          animation: pulseBtn 1.2s infinite;
        }
      `}</style>
    </div>
  );
};

export default GameEndScreen;
