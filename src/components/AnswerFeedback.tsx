import { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle } from "lucide-react";
import AnimatedCoin from "./ui/animated-coin";

interface AnswerFeedbackProps {
  isCorrect: boolean;
  coins?: number;
  onComplete?: () => void;
}

const AnswerFeedback = ({ isCorrect, coins = 0, onComplete }: AnswerFeedbackProps) => {
  useEffect(() => {
    if (isCorrect) {
      // Trigger confetti celebration
      const duration = 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF6347'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }

    // Auto-hide after animation
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isCorrect, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`
        relative p-12 rounded-3xl shadow-2xl transform transition-all animate-scale-in
        ${isCorrect 
          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
          : 'bg-gradient-to-br from-red-500 to-rose-600'
        }
      `}>
        <div className="flex flex-col items-center gap-6 text-white">
          {isCorrect ? (
            <>
              <CheckCircle2 className="w-24 h-24 animate-bounce" />
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold">Correct!</h2>
                {coins > 0 && (
                  <div className="flex items-center gap-2 justify-center text-2xl font-semibold">
                    <AnimatedCoin />
                    <span>+{coins}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-24 h-24 animate-shake" />
              <div className="text-center">
                <h2 className="text-4xl font-bold">Wrong!</h2>
                <p className="text-xl mt-2 opacity-90">Try the next one</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerFeedback;
