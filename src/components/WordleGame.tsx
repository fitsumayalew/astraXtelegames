import { useState, useEffect, useCallback, useRef, type CSSProperties } from "react";
import { useCoins } from "@/contexts/CoinContext";
import { useToast } from "@/hooks/use-toast";
import { isValidWord } from "@/data/wordleWords";
import { apiGetWordleWord, apiValidateWordleGuess, apiWordleHint, apiWordleSearch } from "@/lib/api";
import GameHeader from "./shared/GameHeader";
import WordleGameControls from "./wordle/WordleGameControls";
import WordleGrid from "./wordle/WordleGrid";
import WordleKeyboard from "./wordle/WordleKeyboard";
import GameStartScreen from "./shared/GameStartScreen";
import GameEndScreen from "./shared/GameEndScreen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";
import {
  BookOpen,
  Timer,
  Lightbulb,
  Trophy,
  Coins as CoinsIcon,
  Volume2,
  VolumeX,
  HelpCircle,
  Search as SearchIcon,
} from "lucide-react";
import wordleHero from "@/assets/wordle-hero.png";
import WordleBackground from "@/components/wordle/WordleBackground";

const MAX_ATTEMPTS = 6;
const TIMER_DURATION_DEFAULT = 60; // enforce 60s per word
const FREE_ASSISTS = 3; // backend free quota
const ASSIST_COST = 10; // backend cost after free quota
const WIN_REWARD = 50; // optional visual reward; backend owns coins
// background handled by WordleBackground

const getMediaUrl = (fileName: string) => `/media/${encodeURIComponent(fileName)}`;

const SOUND_URLS = {
  click: getMediaUrl("clickbuton.webm"),
  letter: getMediaUrl("typing1.webm"),
  wrong: getMediaUrl("wrong answer.webm"),
  win: getMediaUrl("word found.webm"),
  lose: getMediaUrl("whoosh2.webm"),
  hint: getMediaUrl("hint found.webm"),
  search: getMediaUrl("dart.webm"),
  start: getMediaUrl("woosh.webm"),
} as const;

type SoundKey = keyof typeof SOUND_URLS;

const SOUND_VOLUMES: Record<SoundKey, number> = {
  click: 0.45,
  letter: 0.3,
  wrong: 0.6,
  win: 0.7,
  lose: 0.55,
  hint: 0.5,
  search: 0.5,
  start: 0.55,
};

type CoinBurst = {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  count: number;
};

const WordleGame = () => {
  const { totalCoins, syncBalance } = useCoins();
  const { toast } = useToast();

  const coinAnchorRef = useRef<HTMLAnchorElement | null>(null);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  const [targetWord, setTargetWord] = useState<string>("");
  const [gameId, setGameId] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [guessResults, setGuessResults] = useState<Array<Array<"correct" | "present" | "absent">>>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION_DEFAULT);
  const [letterStatus, setLetterStatus] = useState<Map<string, "correct" | "present" | "absent">>(new Map());
  const [shake, setShake] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set());
  // Track revealed letter values from backend hints so we can prefill correctly
  const [revealedHints, setRevealedHints] = useState<Map<number, string>>(new Map());
  const [searchesUsed, setSearchesUsed] = useState(0);
  const [searchClues, setSearchClues] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("wordleSound") !== "off");
  const [coinBursts, setCoinBursts] = useState<CoinBurst[]>([]);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [hintInFlight, setHintInFlight] = useState(false);
  const [searchInFlight, setSearchInFlight] = useState(false);
  const timeoutHandledRef = useRef(false);

  // Keyboard listener
  const playSound = useCallback((sound: SoundKey) => {
    if (!soundEnabled) return;
    const audio = new Audio(SOUND_URLS[sound]);
    audio.volume = SOUND_VOLUMES[sound] ?? 0.4;
    audio.play().catch(() => { });
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem("wordleSound", soundEnabled ? "on" : "off");
  }, [soundEnabled]);

  const triggerCoinBurst = useCallback((count = 18) => {
    if (!coinAnchorRef.current) return;

    const targetRect = coinAnchorRef.current.getBoundingClientRect();
    const areaRect = gameAreaRef.current?.getBoundingClientRect();

    const startX = (areaRect?.left ?? 0) + (areaRect?.width ?? window.innerWidth) / 2;
    const startY = (areaRect?.top ?? 0) + (areaRect?.height ?? window.innerHeight) / 2.5;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const id = Date.now();
    setCoinBursts((prev) => [...prev, { id, startX, startY, targetX, targetY, count }]);
    setTimeout(() => {
      setCoinBursts((prev) => prev.filter((burst) => burst.id !== id));
    }, 1200);
  }, []);

  const updateLetterStatus = useCallback((guess: string, result?: Array<"correct" | "present" | "absent">) => {
    const newStatus = new Map(letterStatus);
    const letters = guess.split("");
    letters.forEach((letter, index) => {
      const status = result ? result[index] : undefined;
      if (status) {
        newStatus.set(letter, status);
        return;
      }
      // Fallback status if backend result missing
      if (targetWord && targetWord[index] === letter) {
        newStatus.set(letter, "correct");
      } else if (targetWord && targetWord.includes(letter) && newStatus.get(letter) !== "correct") {
        newStatus.set(letter, "present");
      } else {
        newStatus.set(letter, "absent");
      }
    });

    setLetterStatus(newStatus);
  }, [targetWord, letterStatus]);

  const endGame = useCallback((victory: boolean) => {
    setGameOver(true);
    setWon(victory);
    setShowGameOver(true);

    if (victory) {
      playSound("win");
      triggerCoinBurst();
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      playSound("lose");
    }
  }, [playSound, triggerCoinBurst]);

  const finalizeTimeout = useCallback(async () => {
    if (timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;

    setGameOver(true);
    setWon(false);
    setShowGameOver(true);
    playSound("lose");

    if (!gameId) return;

    const remainingAttempts = Math.max(0, MAX_ATTEMPTS - guesses.length);
    let lastTarget = "";

    for (let i = 0; i < remainingAttempts; i++) {
      try {
        const res = await apiValidateWordleGuess({ guess: "BRING", gameId });
        if (res.target) lastTarget = res.target;
      } catch (err: any) {
        const msg = String(err?.message ?? "Validation failed");
        if (/expired/i.test(msg)) {
          if (err?.target) lastTarget = String(err.target);
          break;
        }
        toast({ title: "Timeout validation error", description: msg, variant: "destructive" });
        break;
      }
    }

    if (lastTarget) setTargetWord(lastTarget.toUpperCase());
  }, [gameId, guesses.length, toast, playSound]);

  const handleKeyPress = useCallback(async (key: string) => {
    if (gameOver) return;

    if (key === "ENTER") {
      if (!gameId) {
        return;
      }
      // Count how many non-revealed positions we need
      const nonRevealedCount = 5 - revealedLetters.size;

      if (currentGuess.length !== nonRevealedCount) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        playSound("wrong");
        return;
      }

      // Build the full word by merging revealed letters (from backend hints) and user input
      let fullGuess = "";
      let userInputIndex = 0;
      for (let i = 0; i < 5; i++) {
        if (revealedLetters.has(i)) {
          const hinted = revealedHints.get(i);
          fullGuess += (hinted ?? "");
        } else {
          fullGuess += currentGuess[userInputIndex];
          userInputIndex++;
        }
      }

      try {
        const res = await apiValidateWordleGuess({ guess: fullGuess, gameId: gameId ?? undefined });
        const newGuesses = [...guesses, fullGuess];
        setGuesses(newGuesses);
        setGuessResults((prev) => [...prev, res.result]);
        updateLetterStatus(fullGuess, res.result);
        if (typeof res.remainingTime === "number") setTimeLeft(Math.max(0, Math.ceil(res.remainingTime / 1000)));

        if (res.victory) {
          if (res.target) setTargetWord(res.target);
          endGame(true);
        } else {
          if (newGuesses.length >= MAX_ATTEMPTS) {
            // attempts exhausted; backend may include target
            if (res.target) setTargetWord(res.target);
            endGame(false);
          } else {
            playSound("click");
          }
        }
      } catch (err: any) {
        const msg = String(err?.message ?? "Validation failed");
        if (/expired/i.test(msg)) {
          // 410 case: ended, reveal target if available via message
          setGameOver(true);
          setWon(false);
          setShowGameOver(true);
          playSound("lose");
          if (err?.target) setTargetWord(String(err.target).toUpperCase());
        } else if (/rate/i.test(msg)) {
          toast({ title: "Slow down", description: "Too many guesses; please slow down.", variant: "destructive" });
        } else if (/No active session|Mismatched gameId/i.test(msg)) {
          toast({ title: "Session error", description: msg, variant: "destructive" });
        } else if (/guess must be 5 letters|not in word list/i.test(msg)) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          toast({ title: "Invalid guess", description: msg, variant: "destructive" });
          playSound("wrong");
        } else {
          toast({ title: "Error", description: msg, variant: "destructive" });
        }
      } finally {
        setCurrentGuess("");
      }
    } else if (key === "⌫") {
      setCurrentGuess((prev) => prev.slice(0, -1));
      playSound("click");
    } else if (/^[A-Z]$/.test(key)) {
      const maxLength = 5 - revealedLetters.size;
      if (currentGuess.length < maxLength) {
        setCurrentGuess((prev) => prev + key);
        playSound("letter");
      }
    }
  }, [currentGuess, guesses, gameOver, gameId, targetWord, toast, playSound, updateLetterStatus, endGame, revealedLetters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || !gameStarted || showGameOver || showNewGameConfirm) return;

      if (e.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        handleKeyPress("⌫");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, gameStarted, showGameOver, showNewGameConfirm, handleKeyPress]);

  const handleHint = useCallback(async () => {
    if (gameOver || hintInFlight) return;
    if (!gameId) {
      return;
    }

    const unrevealedIndices = Array.from({ length: 5 }, (_, i) => i).filter((i) => !revealedLetters.has(i));
    if (unrevealedIndices.length === 0) {
      return;
    }

    try {
      setHintInFlight(true);
      const res = await apiWordleHint();
      if (typeof res.balance === "number") syncBalance(res.balance);
      const newRevealed = new Set(revealedLetters);
      newRevealed.add(res.position);
      setRevealedLetters(newRevealed);
      setRevealedHints((prev) => {
        const next = new Map(prev);
        const up = typeof res.letter === "string" ? res.letter.toUpperCase() : "";
        next.set(res.position, up);
        return next;
      });
      // Also update targetWord placeholder to ensure UI prefills the correct letter
      setTargetWord((prev) => {
        const arr = (prev && prev.length === 5 ? prev.split("") : ["", "", "", "", ""]);
        arr[res.position] = typeof res.letter === "string" ? res.letter.toUpperCase() : "";
        return arr.join("");
      });
      setHintsUsed((prev) => prev + 1);
      playSound("hint");
    } catch (err: any) {
      const msg = String(err?.message ?? "Hint failed");
      toast({ title: "Hint error", description: msg, variant: "destructive" });
      playSound("wrong");
    } finally {
      setHintInFlight(false);
    }
  }, [gameOver, gameId, hintsUsed, searchesUsed, revealedLetters, syncBalance, playSound, toast, hintInFlight]);

  const handleSearch = useCallback(async () => {
    if (gameOver || searchInFlight) return;
    if (!gameId) {
      return;
    }

    try {
      setSearchInFlight(true);
      const res = await apiWordleSearch();
      if (typeof res.balance === "number") syncBalance(res.balance);
      const updated = new Set(searchClues);
      const up = typeof res.letter === "string" ? res.letter.toUpperCase() : "";
      if (up) updated.add(up);
      setSearchClues(updated);
      setSearchesUsed((prev) => prev + 1);
      playSound("search");
    } catch (err: any) {
      const msg = String(err?.message ?? "Search failed");
      toast({ title: "Search error", description: msg, variant: "destructive" });
      playSound("wrong");
    } finally {
      setSearchInFlight(false);
    }
  }, [gameOver, gameId, hintsUsed, searchesUsed, searchClues, syncBalance, targetWord, toast, playSound, searchInFlight]);

  const resetGame = useCallback(() => {
    timeoutHandledRef.current = false;
    setTargetWord("");
    setGameId(null);
    setGuesses([]);
    setGuessResults([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setTimeLeft(TIMER_DURATION_DEFAULT);
    setLetterStatus(new Map());
    setShake(false);
    setShowGameOver(false);
    setGameStarted(false);
    setHintsUsed(0);
    setRevealedLetters(new Set());
    setSearchesUsed(0);
    setSearchClues(new Set());
  }, []);

  const startGame = async () => {
    try {
      const session = await apiGetWordleWord();
      timeoutHandledRef.current = false;
      setGameStarted(true);
      setGameId(session.gameId);
      setTimeLeft(TIMER_DURATION_DEFAULT);
      setTargetWord(""); // unknown to client until win/lose reveal
      playSound("start");
    } catch (err: any) {
      const msg = String(err?.message ?? "Failed to start session");
      toast({ title: "Start failed", description: msg, variant: "destructive" });
    }
  };

  const handleNewGame = useCallback(() => {
    if (guesses.length > 0 && !gameOver) {
      setShowNewGameConfirm(true);
    } else {
      resetGame();
    }
  }, [guesses, gameOver, resetGame]);

  const assistsUsed = hintsUsed + searchesUsed;
  const freeAssistsLeft = Math.max(0, FREE_ASSISTS - assistsUsed);
  const canUseHint = !gameOver && !hintInFlight && (freeAssistsLeft > 0 || totalCoins >= ASSIST_COST) && revealedLetters.size < 5;
  const canUseSearch = !gameOver && !searchInFlight && (freeAssistsLeft > 0 || totalCoins >= ASSIST_COST);

  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finalizeTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, gameStarted, finalizeTimeout]);

  const wordleInstructions = [
    {
      icon: BookOpen,
      title: "Guess the Word",
      description: "5-letter word in 6 attempts",
    },
    {
      icon: Timer,
      title: "60 Second Timer",
      description: "Solve before time runs out",
    },
    {
      icon: Lightbulb,
      title: "Use Hints",
      description: "5 free assists, then 5 coins",
    },
    {
      icon: SearchIcon,
      title: "Use Search",
      description: "Reveals a letter that's in the word",
    },
    {
      icon: Trophy,
      title: "Win 50 Coins",
      description: "Earn coins for solving puzzles",
    },
    {
      icon: CoinsIcon,
      title: "Color Guide",
      description: (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-6 h-6 rounded bg-green-600 text-white flex items-center justify-center font-bold text-xs">W</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">O</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">R</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">D</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">Y</div>
            </div>
            <span className="text-xs">Right spot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">P</div>
              <div className="w-6 h-6 rounded bg-yellow-600 text-white flex items-center justify-center font-bold text-xs">I</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">L</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">L</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">S</div>
            </div>
            <span className="text-xs">Wrong spot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">V</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">A</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">G</div>
              <div className="w-6 h-6 rounded bg-gray-600 text-white flex items-center justify-center font-bold text-xs">U</div>
              <div className="w-6 h-6 rounded border border-muted-foreground/30 flex items-center justify-center font-bold text-xs">E</div>
            </div>
            <span className="text-xs">Not in word</span>
          </div>
        </div>
      ) as any,
    },
  ];

  const gameStats = won
    ? [
      { label: "Guesses", value: `${guesses.length}/${MAX_ATTEMPTS}` },
      { label: "Time", value: `${TIMER_DURATION_DEFAULT - timeLeft}s` },
    ]
    : [
      { label: "The Word Was", value: targetWord },
      { label: "Your Guesses", value: guesses.length },
    ];

  return (
    <div
      ref={gameAreaRef}
      className="wordle-scale h-[100dvh] w-full flex flex-col relative overflow-hidden"
    >
      <WordleBackground gameStarted={gameStarted} showGameOver={showGameOver} />

      <div className="pointer-events-none fixed inset-0 z-40">
        {coinBursts.map((burst) => (
          Array.from({ length: burst.count }).map((_, i) => (
            <span
              key={`${burst.id}-${i}`}
              className="coin-flight"
              style={{
                left: burst.startX,
                top: burst.startY,
                "--tx": `${burst.targetX - burst.startX}px`,
                "--ty": `${burst.targetY - burst.startY}px`,
                "--delay": `${i * 0.05}s`,
                "--arc": `${(Math.random() - 0.5) * 80}px`,
              } as CSSProperties}
            />
          ))
        ))}
      </div>

      {!gameStarted || showGameOver ? (
        <GameHeader
          coins={totalCoins}
          timeLeft={timeLeft}
          gameStarted={gameStarted && !showGameOver}
          coinAnchorRef={coinAnchorRef}
          onNewGame={handleNewGame}
          showCoins={false}
          showTimer={false}
        />
      ) : null}

      <div className="flex-1 px-3 sm:px-4 py-4 sm:py-6 max-w-4xl mx-auto w-full relative z-10 pt-10 sm:pt-14">
        <div className="absolute top-3 left-3 z-30">
          <Button variant="secondary" size="icon" className="rounded-full shadow-md h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16" onClick={() => setRulesOpen(true)}>
            <HelpCircle className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16" />
          </Button>
        </div>
        <div className="absolute top-3 right-3 z-30 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full shadow-md h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
            onClick={() => setSoundEnabled((prev) => !prev)}
          >
            {soundEnabled ? <Volume2 className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16" /> : <VolumeX className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16" />}
          </Button>
        </div>

        {gameStarted && !showGameOver && (
          <div className="mb-4 flex justify-center">
            <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-lg shadow-lg px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 border border-white/15 shadow-inner">
                  <Timer className={`w-5 h-5 ${timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-white"}`} />
                  <span className="text-sm sm:text-lg font-semibold text-white">{timeLeft}s</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-black/10 px-3 py-2 border border-white/15 shadow-inner">
                  <Lightbulb className="w-5 h-5 text-yellow-200" />
                  <span className="text-sm font-semibold text-white">Assists left: {Math.max(0, FREE_ASSISTS - (hintsUsed + searchesUsed))}</span>
                </div>
                <a
                  href="/demo-coins"
                  ref={coinAnchorRef}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-300/30 via-yellow-200/25 to-amber-200/20 px-3 py-2 border border-amber-200/40 shadow-lg backdrop-blur hover:from-amber-300/40 hover:to-amber-200/30 transition-colors"
                >
                  <CoinsIcon className="w-5 h-5 text-amber-200" />
                  <span className="text-base sm:text-lg font-bold text-white">{totalCoins}</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {!gameStarted ? (
          <GameStartScreen
            title="Astra Wordle"
            description="Guess the 5-letter word and earn coins!"
            icon={BookOpen}
            // heroImage={wordleHero}
            instructions={[]}
            onStartGame={startGame}
            startButtonIconOnly
            instructionLayout="list"
            hideHero
            /* Hide GameStartScreen's legacy bg to reveal WordleBackground */
            fullScreenBackground={false}
            backgroundOpacity={0}
            compactHeight
          />
        ) : showGameOver ? (
          <GameEndScreen
            won={won}
            stats={gameStats}
            coinsEarned={won ? WIN_REWARD : 0}
            onPlayAgain={resetGame}
            winMessage="You Solved It!"
            loseMessage="Game Over"
            compactHeight
          />
        ) : (
          <>
            <div className="flex flex-col min-h-[calc(100dvh-12rem)] gap-4 pb-8 md:pb-10">
              <div className="flex-1 flex flex-col justify-start gap-4">
                <WordleGrid
                  guesses={guesses}
                  guessResults={guessResults}
                  currentGuess={currentGuess}
                  maxAttempts={MAX_ATTEMPTS}
                  targetWord={targetWord}
                  shake={shake}
                  revealedLetters={revealedLetters}
                  revealedHints={revealedHints}
                />
              </div>

              <div className="pb-2">
                <WordleKeyboard
                  onKeyPress={handleKeyPress}
                  letterStatus={letterStatus}
                  disabled={gameOver}
                  targetWord={targetWord}
                  revealedLetters={revealedLetters}
                  revealedHints={revealedHints}
                  searchClues={searchClues}
                />
              </div>

              <WordleGameControls
                onHint={handleHint}
                onSearch={handleSearch}
                freeAssistsLeft={freeAssistsLeft}
                canUseHint={canUseHint}
                canUseSearch={canUseSearch}
                assistCost={ASSIST_COST}
              />
            </div>
          </>
        )}
      </div>

      <Dialog open={rulesOpen} onOpenChange={setRulesOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-yellow-50/80 border-yellow-300">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              How to play Wordle
            </DialogTitle>
            <DialogDescription>
              Guess the 5-letter word in six tries. Colors show how close you are. Use Search to reveal a letter that is in the word, and Hint to lock a letter into its correct position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-foreground/80">
            {wordleInstructions.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-yellow-100/60 rounded-lg border border-yellow-300"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center shadow-md flex-shrink-0">
                  <item.icon className="w-5 h-5 text-yellow-900" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-yellow-900 text-sm">{item.title}</h4>
                  <div className="text-sm text-yellow-800 leading-relaxed">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
          <style>{`
            .wordle-dialog-x {
              background: #f44336 !important;
              color: #fff !important;
              border-radius: 0.5rem;
              box-shadow: 0 2px 8px rgba(0,0,0,0.12);
              padding: 0.5rem 0.8rem;
              font-weight: bold;
              font-size: 1.2rem;
              border: none;
              transition: background 0.2s;
            }
            .wordle-dialog-x:hover {
              background: #d32f2f !important;
            }
          `}</style>
        </DialogContent>
      </Dialog>

      {/* New Game Confirmation */}
      <AlertDialog open={showNewGameConfirm} onOpenChange={setShowNewGameConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start a new game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end your current game. Any progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Playing</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowNewGameConfirm(false);
              resetGame();
            }}>
              New Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WordleGame;
