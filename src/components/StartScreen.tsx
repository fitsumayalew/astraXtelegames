import GameStartScreen from "./shared/GameStartScreen";
import { Clock, Heart, Coins, Trophy, HelpCircle, Volume2, VolumeX, Info } from "lucide-react";
import popQuizLogo from "@/assets/pop-quiz-logo.png";
import { useCoins } from "@/contexts/CoinContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TypewriterText from "./shared/TypewriterText";

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const { totalCoins } = useCoins();
  const ENTRY_COST = 100;
  const canAfford = totalCoins >= ENTRY_COST;
  const [rulesOpen, setRulesOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("quizSound") !== "off");

  // Move instructions into a modal, keep start screen clean (like Wordle)
  const instructions: { icon: typeof Clock; title: string; description: string }[] = [];

  return (
    <>

      <GameStartScreen
        title="Astra Pop Quiz"
        description="Test your knowledge across various topics"
        icon={HelpCircle}
        heroImage={popQuizLogo}
        instructions={instructions}
        onStartGame={onStartGame}
        startButtonText={canAfford ? `Start Game (${ENTRY_COST} coins)` : `Not Enough Coins (Need ${ENTRY_COST})`}
        startButtonDisabled={!canAfford}
        startButtonIconOnly
        hideHero
        fullScreenBackground
        compactHeight
        additionalContent={(
          <div className="flex flex-col items-center justify-center gap-6">
            {/* Toggle Buttons */}
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/60 shadow-lg hover:opacity-90"
                onClick={() => setRulesOpen(true)}
              >
                <Info className="w-6 h-6" />
                <span className="sr-only">How to Play</span>
              </Button>
              <Button
                variant="secondary"
                className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/60 shadow-lg hover:opacity-90"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  localStorage.setItem("quizSound", next ? "on" : "off");
                  // notify QuizGame in same tab
                  window.dispatchEvent(new CustomEvent("quiz:sound-changed", { detail: next }));
                }}
                aria-label="Toggle sound"
              >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                <span className="sr-only">Toggle Sound</span>
              </Button>
            </div>

            {/* Stylish Pop Quiz Title */}
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 drop-shadow-[0_4px_12px_rgba(251,191,36,0.6)] animate-pulse tracking-tight">
                POP QUIZ
              </h1>
              <div className="h-2 w-32 md:w-48 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full mt-2 shadow-lg shadow-yellow-400/50"></div>
            </div>
          </div>
        )}

      />


      {/* How to Play dialog */}
      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-yellow-50/80 border-yellow-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              How to play Pop Quiz
            </DialogTitle>
            <DialogDescription>
              Answer timed multiple-choice questions. You have limited lives; wrong answers or timeouts cost a life. Earn coins for correct answers and finish all questions to win.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/80">
            <div className="flex items-start gap-3 p-3 bg-yellow-100/60 rounded-lg border border-yellow-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center shadow-md flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-900" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-yellow-900 text-sm">10 Seconds per question</h4>
                <div className="text-sm text-yellow-800 leading-relaxed">
                  {rulesOpen && <TypewriterText text="Answer before the timer ends." startDelay={200} />}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-100/60 rounded-lg border border-yellow-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center shadow-md flex-shrink-0">
                <Heart className="w-5 h-5 text-yellow-900" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-yellow-900 text-sm">3 Lives</h4>
                <div className="text-sm text-yellow-800 leading-relaxed">
                  {rulesOpen && <TypewriterText text="Wrong answers or timeouts cost a life." startDelay={800} />}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-100/60 rounded-lg border border-yellow-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center shadow-md flex-shrink-0">
                <Coins className="w-5 h-5 text-yellow-900" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-yellow-900 text-sm">Earn Coins</h4>
                <div className="text-sm text-yellow-800 leading-relaxed">
                  {rulesOpen && <TypewriterText text="Get 10-15 coins for each correct answer." startDelay={1600} />}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-yellow-100/60 rounded-lg border border-yellow-300">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center shadow-md flex-shrink-0">
                <Trophy className="w-5 h-5 text-yellow-900" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-yellow-900 text-sm">10 Questions</h4>
                <div className="text-sm text-yellow-800 leading-relaxed">
                  {rulesOpen && <TypewriterText text="Complete all questions to finish." startDelay={2400} />}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StartScreen;
