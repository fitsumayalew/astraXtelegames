import { Coins, Lightbulb, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordleGameControlsProps {
  onHint: () => void;
  onSearch: () => void;
  freeAssistsLeft: number;
  canUseHint: boolean;
  canUseSearch: boolean;
  assistCost: number;
}

const WordleGameControls = ({
  onHint,
  onSearch,
  freeAssistsLeft,
  canUseHint,
  canUseSearch,
  assistCost,
}: WordleGameControlsProps) => {
  const buttonClass =
    "relative h-12 w-12 sm:h-13 sm:w-13 md:h-16 md:w-16 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-lg border-2 border-green-500 disabled:opacity-60 disabled:cursor-not-allowed";

  const renderBadge = () => {
    if (freeAssistsLeft > 0) {
      return (
        <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 text-xs font-bold leading-none text-white shadow">
          {freeAssistsLeft}
        </span>
      );
    }

    return (
      <span className="absolute -top-1 -right-1 flex h-6 min-w-[30px] items-center gap-1 justify-center rounded-full bg-amber-300 text-[11px] font-bold leading-none text-amber-950 shadow">
        <Coins className="h-3.5 w-3.5 text-amber-700" />
        {assistCost}
      </span>
    );
  };

  return (
    <div className="flex items-center justify-center gap-4 md:gap-6 mt-3">
      <Button
        aria-label="Use search assist"
        onClick={onSearch}
        disabled={!canUseSearch}
        variant="ghost"
        size="icon"
        className={buttonClass}
      >
        {renderBadge()}
        <Search className="w-8 h-8 md:w-10 md:h-10" />
      </Button>

      <Button
        aria-label="Use hint assist"
        onClick={onHint}
        disabled={!canUseHint}
        variant="ghost"
        size="icon"
        className={buttonClass}
      >
        {renderBadge()}
        <Lightbulb className="w-8 h-8 md:w-10 md:h-10" />
      </Button>
    </div>
  );
};

export default WordleGameControls;