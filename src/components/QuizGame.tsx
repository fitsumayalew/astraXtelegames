import { useState, useEffect, useCallback } from "react";
import { Question } from "@/data/questions";
import GameHeader from "./shared/GameHeader";
import Lives from "./Lives";
import Timer from "./Timer";
import QuestionCard from "./QuestionCard";
import ResultsScreen from "./ResultsScreen";
import StartScreen from "./StartScreen";
// Feedback popups removed; inline coloring used instead
import { useCoins } from "@/contexts/CoinContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Snowflake, SkipForward, Coins as CoinsIcon } from "lucide-react";
import { apiQuizStart, apiQuizGetQuestions, apiQuizAnswer, apiQuizAssistFifty, apiQuizAssistFreeze, apiQuizSkip } from "@/lib/api";

const TIMER_DURATION = 10;
const MAX_LIVES = 3;
const ENTRY_COST = 100;

const QuizGame = () => {
  const { totalCoins, addCoins, spendCoins } = useCoins();
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [questionOrder, setQuestionOrder] = useState<number[]>([]);
  const [pointer, setPointer] = useState(0);
  const currentQuestionIndex = questionOrder.length > 0 ? (questionOrder[pointer] ?? 0) : 0;
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastLostLife, setLastLostLife] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("quizSound") !== "off");
  const [hiddenOptions, setHiddenOptions] = useState<Set<number>>(new Set());
  const [freezeLeft, setFreezeLeft] = useState(0);
  const [freeFiftyUsed, setFreeFiftyUsed] = useState(0); // two free uses
  const [freeFreezeUsed, setFreeFreezeUsed] = useState(0); // two free uses
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [backendQuestions, setBackendQuestions] = useState<Question[]>([]);

  const getMediaUrl = (fileName: string) => `/media/${encodeURIComponent(fileName)}`;
  const SOUND_URLS = {
    click: getMediaUrl("clickbuton.webm"),
    wrong: getMediaUrl("wrong answer.webm"),
    win: getMediaUrl("word found.webm"),
    lose: getMediaUrl("whoosh2.webm"),
    start: getMediaUrl("woosh.webm"),
  } as const;
  type SoundKey = keyof typeof SOUND_URLS;
  const SOUND_VOLUMES: Record<SoundKey, number> = {
    click: 0.45,
    wrong: 0.6,
    win: 0.7,
    lose: 0.55,
    start: 0.55,
  };

  const playSound = useCallback((sound: SoundKey) => {
    if (!soundEnabled) return;
    const audio = new Audio(SOUND_URLS[sound]);
    audio.volume = SOUND_VOLUMES[sound] ?? 0.4;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setSoundEnabled(detail);
    };
    window.addEventListener("quiz:sound-changed", handler as EventListener);
    return () => window.removeEventListener("quiz:sound-changed", handler as EventListener);
  }, []);

  const currentQuestion = backendQuestions[currentQuestionIndex];

  useEffect(() => {
    if (showResults || isAnswered || !gameStarted) return;

    if (freezeLeft > 0) {
      const freezer = setInterval(() => {
        setFreezeLeft((f) => Math.max(0, f - 1));
      }, 1000);
      return () => clearInterval(freezer);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResults, isAnswered, gameStarted, freezeLeft]);

  const handleTimeout = () => {
    const newLives = lives - 1;
    setLastLostLife(lives - 1);
    setLives(newLives);

    if (newLives <= 0) {
      playSound("lose");
      endGame();
    } else {
      playSound("lose");
      moveToNextQuestion();
    }
  };

  const handleSelectAnswer = async (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);
    try {
      if (!sessionId) throw new Error("No session");
      const res = await apiQuizAnswer(sessionId, index);
      setIsCorrect(res.correct);
      if (res.correct) {
        playSound("win");
        setScore(res.score);
        const reward = currentQuestion?.coins ?? 5;
        setCoinsEarned(res.coinsEarned);
        void addCoins(reward);
      } else {
        const newLives = res.lives;
        setLastLostLife(lives - 1);
        setLives(newLives);
        if (newLives <= 0 || res.done) {
          playSound("lose");
          setTimeout(() => endGame(), 800);
          return;
        }
        playSound("wrong");
      }
      // After brief pause to show feedback, sync pointer from server
      setTimeout(() => {
        setPointer(res.pointer);
        setTimeLeft(TIMER_DURATION);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setIsCorrect(null);
        setHiddenOptions(new Set());
        setFreezeLeft(0);
      }, 800);
    } catch (e) {
      // Fallback if server fails
      const newLives = lives - 1;
      setLastLostLife(lives - 1);
      setLives(newLives);
      playSound("wrong");
    }
  };

  const endGame = () => {
    setShowResults(true);
  };

  const resetGame = () => {
    setQuestionOrder([]);
    setPointer(0);
    setLives(MAX_LIVES);
    setScore(0);
    setCoinsEarned(0);
    setTimeLeft(TIMER_DURATION);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setShowResults(false);
    setLastLostLife(null);
    setHiddenOptions(new Set());
    setFreezeLeft(0);
    setSessionId(null);
    setBackendQuestions([]);
    setGameStarted(false); // ensure timer doesn't run while loading
  };

  const playAgain = async () => {
    resetGame();
    await startGame();
  };

  const moveToNextQuestion = () => {
    if (pointer < questionOrder.length - 1) {
      setPointer((p) => p + 1);
      setTimeLeft(TIMER_DURATION);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(null);
      setHiddenOptions(new Set());
      setFreezeLeft(0);
    } else {
      endGame();
    }
  };

  const startGame = async () => {
    try {
      const { session } = await apiQuizStart(ENTRY_COST);
      setSessionId(session.id);
      const { questions: qs } = await apiQuizGetQuestions({ limit: 10 });
      const mapped = qs.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: -1,
        coins: q.coinsReward ?? 5,
      })) as unknown as Question[];
      setBackendQuestions(mapped);
      setQuestionOrder(session.questionOrder ?? Array.from({ length: mapped.length }, (_, i) => i));
      setPointer(session.pointer ?? 0);
      playSound("start");
      setGameStarted(true);
    } catch (e: any) {
      toast({ title: "Unable to start quiz", description: e?.message ?? "Server error", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image (in-game) similar to Wordle */}
      {gameStarted && (
        <div
          className="absolute inset-0 z-0 bg-center bg-cover pointer-events-none animate-wordle-bg"
          style={{ backgroundImage: 'url(/image/pop-back.png)', opacity: 0.9 }}
        ></div>
      )}

      {/* Hide header during gameplay; show on start/results */}
      {(!gameStarted || showResults) && (
        <GameHeader coins={totalCoins} onNewGame={gameStarted ? resetGame : undefined} />
      )}
      
      <div className="max-w-4xl mx-auto relative z-10 px-4 py-6 space-y-6">
        {!gameStarted ? (
          <StartScreen 
            onStartGame={startGame}
          />
        ) : !showResults ? (
          <>
            {backendQuestions.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-sm text-muted-foreground">Loading questions…</span>
              </div>
            ) : (
            <>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <Timer timeLeft={timeLeft} maxTime={TIMER_DURATION} frozen={freezeLeft > 0} />
              </div>
              <Lives lives={lives} lastLostLife={lastLostLife} />
            </div>
            <div className="flex flex-col min-h-[calc(100vh-12rem)] gap-4">
              <div className="flex-1 flex flex-col justify-start gap-4">
                <QuestionCard
                  question={currentQuestion}
                  currentQuestion={currentQuestionIndex}
                  totalQuestions={backendQuestions.length}
                  selectedAnswer={selectedAnswer}
                  onSelectAnswer={handleSelectAnswer}
                  disabled={isAnswered}
                  isCorrect={isCorrect}
                  hiddenOptions={hiddenOptions}
                />
              </div>
              <div className="flex items-center justify-center gap-5 mt-2 flex-wrap">
                <div className="relative">
                  <Button
                    variant="secondary"
                    className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/60 shadow-lg hover:opacity-90"
                    onClick={async () => {
                      if (isAnswered) return;
                      try {
                        if (!sessionId) throw new Error("No session");
                        const res = await apiQuizAssistFifty(sessionId);
                        setHiddenOptions(new Set(res.indices));
                        setFreeFiftyUsed((n) => n + 1);
                      } catch (e) {
                        toast({ title: "Assist failed", description: "Server error", variant: "destructive" });
                      }
                      playSound("click");
                    }}
                  >
                    <span className="text-[11px] font-extrabold tracking-tight">50/50</span>
                    <span className="sr-only">50/50</span>
                  </Button>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span
                      className={
                        freeFiftyUsed < 2
                          ? "inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[9px] px-1.5 py-0.5 border border-white/30"
                          : "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[9px] px-1.5 py-0.5 border border-yellow-600/60 shadow-sm"
                      }
                    >
                      {freeFiftyUsed < 2 ? `Free (${2 - freeFiftyUsed})` : (<><CoinsIcon className="w-3 h-3" /> 20</>)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="secondary"
                    className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/60 shadow-lg hover:opacity-90"
                    onClick={async () => {
                      if (isAnswered || freezeLeft > 0) return;
                      try {
                        if (!sessionId) throw new Error("No session");
                        const res = await apiQuizAssistFreeze(sessionId);
                        setFreezeLeft(res.freezeSeconds ?? 8);
                        setFreeFreezeUsed((n) => n + 1);
                      } catch (e) {
                        toast({ title: "Assist failed", description: "Server error", variant: "destructive" });
                      }
                      playSound("click");
                    }}
                  >
                    <Snowflake className="w-6 h-6" />
                    <span className="sr-only">Freeze Timer</span>
                  </Button>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span
                      className={
                        freeFreezeUsed < 2
                          ? "inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[9px] px-1.5 py-0.5 border border-white/30"
                          : "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[9px] px-1.5 py-0.5 border border-yellow-600/60 shadow-sm"
                      }
                    >
                      {freeFreezeUsed < 2 ? `Free (${2 - freeFreezeUsed})` : (<><CoinsIcon className="w-3 h-3" /> 10</>)}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Button
                    variant="secondary"
                    className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/60 shadow-lg hover:opacity-90"
                    onClick={async () => {
                      if (isAnswered) return;
                      try {
                        if (!sessionId) throw new Error("No session");
                        const res = await apiQuizSkip(sessionId);
                        setPointer(res.pointer);
                      } catch (e) {
                        setQuestionOrder((q) => [...q, q[pointer]]);
                        setPointer((p) => p + 1);
                      }
                      setTimeLeft(TIMER_DURATION);
                      setSelectedAnswer(null);
                      setIsAnswered(false);
                      setIsCorrect(null);
                      setHiddenOptions(new Set());
                      setFreezeLeft(0);
                      playSound("click");
                    }}
                  >
                    <SkipForward className="w-6 h-6" />
                    <span className="sr-only">Skip Question</span>
                  </Button>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[9px] px-1.5 py-0.5 border border-white/30">
                      Free
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </>
            )}
          </>
        ) : (
          <div className="flex flex-col min-h-[calc(100vh-12rem)]">
            <ResultsScreen
              score={score}
              totalQuestions={backendQuestions.length || 0}
              coinsEarned={coinsEarned}
              onPlayAgain={playAgain}
            />
          </div>
        )}
      </div>
      {/* Animations CSS for background entrance */}
      <style>{`
        @keyframes wordleBgIn {
          0% { transform: scale(0.98); opacity: 0; }
          60% { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-wordle-bg { animation: wordleBgIn 0.9s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default QuizGame;
