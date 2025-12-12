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
}: GameHeaderProps) => {
  return (
    <header className="w-full bg-card border-b border-border py-2 px-3 relative z-50">
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
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-2.5 py-1 border border-primary/20">
                <Timer className="w-4 h-4 text-primary" />
                <span className={`font-bold text-sm ${timeLeft <= 10 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                  {timeLeft}s
                </span>
              </div>
            )}

            {additionalContent}

            {gameStarted && onHint && (
              <Button
                onClick={onHint}
                disabled={!canUseHint}
                variant="outline"
                size="sm"
                className="gap-1.5 h-7 text-xs px-2"
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
                variant="outline"
                size="sm"
                className="rounded-full h-7 w-7 p-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
            
            {showCoins && (
              <Link
                to="/demo-coins"
                className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-2.5 py-1 border border-primary/20 hover:bg-primary/20 transition-colors"
                ref={coinAnchorRef}
              >
                <AnimatedCoin size={16} />
                <span className="font-bold text-sm text-foreground">{coins}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default GameHeader;
