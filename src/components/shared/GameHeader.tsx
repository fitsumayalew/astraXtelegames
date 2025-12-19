import { Timer, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AnimatedCoin from "../ui/animated-coin";
import { ReactNode, RefObject } from "react";
import astraLogo from "@/assets/astra-logo.png";

interface GameHeaderProps {
  coins: number;
  timeLeft?: number;
  onNewGame?: () => void;
  onHint?: () => void;
  hintsUsed?: number;
  maxHints?: number;
  hintCost?: number;
  canUseHint?: boolean;
  gameStarted?: boolean;
  additionalContent?: ReactNode;
  coinAnchorRef?: RefObject<HTMLAnchorElement>;
  showCoins?: boolean;
  showTimer?: boolean;
  variant?: "default" | "wordle" | "sudoku" | "quiz";
}

const GameHeader = ({
  coins,
  timeLeft,
  onNewGame,
  onHint,
  hintsUsed,
  maxHints,
  canUseHint,
  gameStarted,
  additionalContent,
  coinAnchorRef,
  showCoins = true,
  showTimer = true,
  variant = "default",
}: GameHeaderProps) => {
  const styles = (() => {
    switch (variant) {
      case "wordle":
        return {
          header: "bg-white/10 backdrop-blur-md border-b border-white/20 text-white",
          pill: "bg-white/15 border border-white/25",
          timerText: "text-white",
          timerUrgent: "text-red-400",
          coinLink: "bg-gradient-to-r from-amber-300/30 via-yellow-200/25 to-amber-200/20 border border-amber-200/40 hover:from-amber-300/40 hover:to-amber-200/30",
          actionBtn: "bg-black/20 border border-white/30 text-white hover:bg-black/30",
        };
      case "sudoku":
        return {
          header: "bg-black/30 backdrop-blur-md border-b border-white/15 text-white",
          pill: "bg-white/10 border border-white/20",
          timerText: "text-white",
          timerUrgent: "text-red-300",
          coinLink: "bg-white/10 border border-white/20 hover:bg-white/15",
          actionBtn: "bg-[#8d4e8f] border border-white/30 text-white hover:bg-[#7f437f]",
        };
      case "quiz":
        return {
          header: "bg-[#0c3980]/40 backdrop-blur border-b border-white/20 text-white",
          pill: "bg-white/10 border border-white/20",
          timerText: "text-white",
          timerUrgent: "text-yellow-300",
          coinLink: "bg-white/10 border border-white/20 hover:bg-white/15",
          actionBtn: "bg-[#0c3980]/60 border border-white/30 text-white hover:bg-[#0c3980]/70",
        };
      default:
        return {
          header: "bg-card border-b border-border",
          pill: "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
          timerText: "text-foreground",
          timerUrgent: "text-destructive",
          coinLink: "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:bg-primary/20",
          actionBtn: "",
        };
    }
  })();
  return (
    <header className={`w-full ${styles.header} py-2 px-3 relative z-50`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity"
          >
            <img 
              src={astraLogo} 
              alt="Astra" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>
          
          <div className="flex items-center gap-2">
            {showTimer && gameStarted && timeLeft !== undefined && (
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${styles.pill}`}>
                <Timer className="w-4 h-4" />
                <span className={`font-bold text-sm ${timeLeft <= 10 ? `${styles.timerUrgent} animate-pulse` : styles.timerText}`}>
                  {timeLeft}s
                </span>
              </div>
            )}

            {additionalContent}

            {gameStarted && onHint && (
              <Button
                onClick={onHint}
                disabled={!canUseHint}
                size="sm"
                className={`gap-1.5 h-7 text-xs px-2 ${styles.actionBtn}`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  Hint ({hintsUsed}/{maxHints})
                </span>
                <span className="sm:hidden">
                  {hintsUsed}/{maxHints}
                </span>
              </Button>
            )}

            {onNewGame && (
              <Button
                onClick={onNewGame}
                size="sm"
                className={`rounded-full h-7 w-7 p-0 ${styles.actionBtn}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
            
            {showCoins && (
              <Link
                to="/demo-coins"
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${styles.coinLink}`}
                ref={coinAnchorRef}
              >
                <AnimatedCoin size={16} />
                <span className="font-bold text-sm">{coins}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
