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
const ROUND_QUESTION_COUNT = 10;

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

  const getMediaUrl = (fileName: string) => `/media/quiz/${encodeURIComponent(fileName)}`;
  const SOUND_URLS = {
    click: getMediaUrl("click.webm"),
    wrong: getMediaUrl("wrong answer.webm"),
    win: getMediaUrl("right answer.webm"),
    lose: getMediaUrl("wrong answer.webm"), // Using 'wrong answer' for lose or 'bar complete' or 'timesUp'? User said "use appropriate places". "timesUp" for timeout? "wrong answer" for life loss?
    // Let's use:
    // click -> click.webm
    // wrong -> wrong answer.webm
    // win -> right answer.webm
    // lose (game over) -> timesUp.webm or coins.webm? Maybe "bar complete.webm" for finish? 
    // "lose" in code is used for life loss or game over. 
    // Let's use 'wrong answer.webm' for life loss, and maybe 'timesUp.webm' for timeout/game over?
    // The code calls playSound("lose") on timeout or game over. Let's map "lose" to "timesUp.webm".
    start: getMediaUrl("woosh.webm"),
  } as const;
  type SoundKey = keyof typeof SOUND_URLS;
  const SOUND_VOLUMES: Record<SoundKey, number> = {
    click: 0.5,
    wrong: 0.6,
    win: 0.6,
    lose: 0.6,
    start: 0.5,
  };

  const playSound = useCallback((sound: SoundKey) => {
    if (!soundEnabled) return;
    const audio = new Audio(SOUND_URLS[sound]);
    audio.volume = SOUND_VOLUMES[sound] ?? 0.4;
    audio.play().catch(() => { });
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

  const clampPointer = (value: number, count: number) => {
    if (count === 0) return 0;
    return Math.min(Math.max(value, 0), count - 1);
  };

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
        const rawPointer = res.pointer ?? pointer + 1;
        const reachedEnd = res.done || questionOrder.length === 0 || rawPointer >= questionOrder.length;
        if (reachedEnd) {
          endGame();
          return;
        }
        const nextPointer = clampPointer(rawPointer, questionOrder.length);
        setPointer(nextPointer);
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
      // Fetch the session-ordered questions already shuffled by the server
      const { questions: qs } = await apiQuizGetQuestions({ limit: ROUND_QUESTION_COUNT });
      const mapped = qs.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: -1,
        coins: q.coinsReward ?? 5,
      })) as unknown as Question[];

      if (mapped.length === 0) {
        throw new Error("No questions available");
      }

      setBackendQuestions(mapped);
      setQuestionOrder(Array.from({ length: mapped.length }, (_, i) => i));
      setPointer(clampPointer((session as any).pointer ?? 0, mapped.length));
      playSound("start");
      setGameStarted(true);
    } catch (e: any) {
      toast({ title: "Unable to start quiz", description: e?.message ?? "Server error", variant: "destructive" });
    }
  };

  // Auto-start game on mount
  useEffect(() => {
    if (!gameStarted && !sessionId) {
      startGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#2241d5] to-[#2241d5] md:to-[#0a1a44]">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'url(/image/tile-sheet0.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }}
      ></div>

      {/* Hide header during gameplay; show on results */}
      {showResults && (
        <GameHeader coins={totalCoins} onNewGame={resetGame} />
      )}

      <div className="max-w-3xl mx-auto relative z-10 px-2 py-2 md:px-4 md:py-5 space-y-3 md:space-y-5">
        {!showResults ? (
          <>
            {backendQuestions.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-sm text-white/80 animate-pulse">Loading Quiz...</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-stretch">
                  <div className="flex-1">
                    <Timer timeLeft={timeLeft} maxTime={TIMER_DURATION} frozen={freezeLeft > 0} />
                  </div>
                  <Lives lives={lives} lastLostLife={lastLostLife} />
                </div>
                <div className="flex flex-col min-h-[calc(100vh-16rem)] gap-2.5 md:gap-4">
                  <div className="flex-1 flex flex-col justify-start gap-2.5 md:gap-4">
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
                  <div className="flex items-center justify-center gap-4 md:gap-6 mt-2 md:mt-4 flex-wrap">
                    <div className="relative group">
                      <Button
                        variant="secondary"
                        className="rounded-full w-14 h-14 md:w-16 md:h-16 p-0 bg-[#0c3980] hover:bg-[#0c3980]/90 text-white border-2 border-white/40 shadow-xl transition-all hover:scale-105 active:scale-95"
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
                        <span className="text-sm md:text-base font-extrabold tracking-tight">50/50</span>
                        <span className="sr-only">50/50</span>
                      </Button>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={
                            freeFiftyUsed < 2
                              ? "inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[10px] md:text-xs px-2 py-0.5 border border-white/30 backdrop-blur-sm"
                              : "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] md:text-xs px-2 py-0.5 border border-yellow-600/60 shadow-sm"
                          }
                        >
                          {freeFiftyUsed < 2 ? `(${2 - freeFiftyUsed})` : (<><CoinsIcon className="w-3 h-3" /> 20</>)}
                        </span>
                      </div>
                    </div>
                    <div className="relative group">
                      <Button
                        variant="secondary"
                        className="rounded-full w-14 h-14 md:w-16 md:h-16 p-0 bg-[#0c3980] hover:bg-[#0c3980]/90 text-white border-2 border-white/40 shadow-xl transition-all hover:scale-105 active:scale-95"
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
                        <Snowflake className="w-7 h-7 md:w-8 md:h-8" />
                        <span className="sr-only">Freeze Timer</span>
                      </Button>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span
                          className={
                            freeFreezeUsed < 2
                              ? "inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[10px] md:text-xs px-2 py-0.5 border border-white/30 backdrop-blur-sm"
                              : "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] md:text-xs px-2 py-0.5 border border-yellow-600/60 shadow-sm"
                          }
                        >
                          {freeFreezeUsed < 2 ? `(${2 - freeFreezeUsed})` : (<><CoinsIcon className="w-3 h-3" /> 10</>)}
                        </span>
                      </div>
                    </div>
                    <div className="relative group">
                      <Button
                        variant="secondary"
                        className="rounded-full w-14 h-14 md:w-16 md:h-16 p-0 bg-[#0c3980] hover:bg-[#0c3980]/90 text-white border-2 border-white/40 shadow-xl transition-all hover:scale-105 active:scale-95"
                        onClick={async () => {
                          if (isAnswered) return;
                          try {
                            if (!sessionId) throw new Error("No session");
                            const res = await apiQuizSkip(sessionId) as { pointer: number; done: boolean }; // Ensure 'done' is included in the type
                            const rawPointer = res.pointer ?? pointer + 1;
                            const reachedEnd = res.done || questionOrder.length === 0 || rawPointer >= questionOrder.length;
                            if (reachedEnd) {
                              endGame();
                              return;
                            }
                            const nextPointer = clampPointer(rawPointer, questionOrder.length);
                            setPointer(nextPointer);
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
                        <SkipForward className="w-7 h-7 md:w-8 md:h-8" />
                        <span className="sr-only">Skip Question</span>
                      </Button>
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 text-white text-[10px] md:text-xs px-2 py-0.5 border border-white/30 backdrop-blur-sm">
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
    </div>
  );
};

export default QuizGame;
