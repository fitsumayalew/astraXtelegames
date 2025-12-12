import { Timer, Lightbulb, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordleGameControlsProps {
  timeLeft: number;
  onHint: () => void;
  onSearch: () => void;
  hintsUsed: number;
  searchesUsed: number;
  freeAssistsLeft: number;
  assistCost: number;
  canUseHint: boolean;
  canUseSearch: boolean;
}

const WordleGameControls = ({
  timeLeft,
  onHint,
  onSearch,
  hintsUsed,
  searchesUsed,
  freeAssistsLeft,
  assistCost,
  canUseHint,
  canUseSearch,
}: WordleGameControlsProps) => {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 flex-wrap">
      <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-4 md:px-6 py-2 md:py-3 border border-primary/20">
        <Timer className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        <span className={`font-bold text-lg md:text-2xl ${timeLeft <= 10 ? "text-destructive animate-pulse" : "text-foreground"}`}>
          {timeLeft}s
        </span>
      </div>

      <Button
        onClick={onSearch}
        disabled={!canUseSearch}
        variant="secondary"
        size="lg"
        className="gap-2 px-4 md:px-6"
      >
        <Search className="w-4 h-4 md:w-5 md:h-5" />
        <span className="text-sm md:text-base">
          Search ({searchesUsed})
        </span>
      </Button>

      <Button
        onClick={onHint}
        disabled={!canUseHint}
        variant="outline"
        size="lg"
        className="gap-2 px-4 md:px-6"
      >
        <Lightbulb className="w-4 h-4 md:w-5 md:h-5" />
        <span className="text-sm md:text-base">
          Hint ({hintsUsed})
        </span>
      </Button>

      <div className="text-xs md:text-sm text-foreground/80 bg-white/10 px-3 py-2 rounded-full border border-white/20">
        Free assists left: {freeAssistsLeft} {freeAssistsLeft === 0 ? `(then ${assistCost} coins)` : ""}
      </div>
    </div>
  );
};

export default WordleGameControls;
