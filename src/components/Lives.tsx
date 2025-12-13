import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface LivesProps {
  lives: number;
  lastLostLife: number | null;
}

const Lives = ({ lives, lastLostLife }: LivesProps) => {
  const [shakingHeart, setShakingHeart] = useState<number | null>(null);

  useEffect(() => {
    if (lastLostLife !== null) {
      setShakingHeart(lastLostLife);
      setTimeout(() => setShakingHeart(null), 600);
    }
  }, [lastLostLife]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 justify-center p-3 sm:p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
      <span className="text-xs sm:text-sm font-medium text-muted-foreground mr-1">Lives:</span>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`relative transition-all duration-300 ${
            shakingHeart === index ? "animate-heart-break" : ""
          }`}
        >
          <Heart
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 ${
              index < lives
                ? "fill-destructive text-destructive animate-heart-beat drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : "fill-muted/20 text-muted/20"
            }`}
          />
        </div>
      ))}
    </div>
  );
};

export default Lives;
