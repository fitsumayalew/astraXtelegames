import { useState, useEffect, useCallback } from "react";
import { useCoins } from "@/contexts/CoinContext";
import { useToast } from "@/hooks/use-toast";
import { getRandomWord, isValidWord } from "@/data/wordleWords";
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
import confetti from "canvas-confetti";
import { BookOpen, Timer, Lightbulb, Trophy, Coins as CoinsIcon } from "lucide-react";
import wordleHero from "@/assets/wordle-hero.png";

const MAX_ATTEMPTS = 6;
const TIMER_DURATION = 60;
const HINT_COST = 10;
const MAX_HINTS = 3;
const WIN_REWARD = 50;

const WordleGame = () => {
  const { totalCoins, addCoins, spendCoins } = useCoins();
  const { toast } = useToast();

  const [targetWord, setTargetWord] = useState(getRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [letterStatus, setLetterStatus] = useState<Map<string, "correct" | "present" | "absent">>(new Map());
  const [shake, setShake] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set());

  // Timer
  useEffect(() => {
    if (gameOver || !gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          setWon(false);
          setShowGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver, gameStarted]);

  // Keyboard listener
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
  }, [currentGuess, guesses, gameOver, showWelcome]);

  const playSound = useCallback((frequency: number, duration: number) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      // Silently fail if audio context not available
    }
  }, []);

  const updateLetterStatus = useCallback((guess: string) => {
    const newStatus = new Map(letterStatus);
    
    guess.split("").forEach((letter, index) => {
      if (targetWord[index] === letter) {
        newStatus.set(letter, "correct");
      } else if (targetWord.includes(letter) && newStatus.get(letter) !== "correct") {
        newStatus.set(letter, "present");
      } else if (!targetWord.includes(letter)) {
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
      addCoins(WIN_REWARD);
      playSound(523.25, 0.2);
      setTimeout(() => playSound(659.25, 0.2), 100);
      setTimeout(() => playSound(783.99, 0.3), 200);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      playSound(220, 0.5);
    }
  }, [addCoins, playSound]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    playSound(400, 0.05);

    if (key === "ENTER") {
      // Count how many non-revealed positions we need
      const nonRevealedCount = 5 - revealedLetters.size;
      
      if (currentGuess.length !== nonRevealedCount) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast({
          title: "Not enough letters",
          description: "Please enter all remaining letters",
          variant: "destructive",
        });
        playSound(200, 0.2);
        return;
      }

      // Build the full word by merging revealed letters and user input
      let fullGuess = "";
      let userInputIndex = 0;
      for (let i = 0; i < 5; i++) {
        if (revealedLetters.has(i)) {
          fullGuess += targetWord[i];
        } else {
          fullGuess += currentGuess[userInputIndex];
          userInputIndex++;
        }
      }

      if (!isValidWord(fullGuess)) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast({
          title: "Invalid word",
          description: "Word not in dictionary",
          variant: "destructive",
        });
        playSound(200, 0.2);
        return;
      }

      const newGuesses = [...guesses, fullGuess];
      setGuesses(newGuesses);
      updateLetterStatus(fullGuess);
      
      if (fullGuess === targetWord) {
        endGame(true);
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        endGame(false);
      } else {
        playSound(300, 0.1);
      }

      setCurrentGuess("");
    } else if (key === "⌫") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key)) {
      // Only allow typing up to the number of non-revealed positions
      const maxLength = 5 - revealedLetters.size;
      if (currentGuess.length < maxLength) {
        setCurrentGuess((prev) => prev + key);
      }
    }
  }, [currentGuess, guesses, gameOver, targetWord, toast, playSound, updateLetterStatus, endGame, revealedLetters]);

  const handleHint = useCallback(() => {
    if (hintsUsed >= MAX_HINTS) {
      toast({
        title: "No hints left",
        description: `You've used all ${MAX_HINTS} hints for this game`,
        variant: "destructive",
      });
      return;
    }

    if (!spendCoins(HINT_COST)) {
      toast({
        title: "Not enough coins!",
        description: `You need ${HINT_COST} coins to use a hint`,
        variant: "destructive",
      });
      return;
    }

    const unrevealedIndices = Array.from({ length: 5 }, (_, i) => i).filter(
      (i) => !revealedLetters.has(i)
    );

    if (unrevealedIndices.length === 0) {
      toast({
        title: "All letters revealed!",
        description: "All letters in the word have been revealed",
      });
      addCoins(HINT_COST); // Refund
      return;
    }

    const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    const newRevealed = new Set(revealedLetters);
    newRevealed.add(randomIndex);
    setRevealedLetters(newRevealed);
    setHintsUsed((prev) => prev + 1);

    playSound(600, 0.2);
  }, [hintsUsed, revealedLetters, targetWord, spendCoins, addCoins, playSound]);

  const resetGame = useCallback(() => {
    setTargetWord(getRandomWord());
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
    setTimeLeft(TIMER_DURATION);
    setLetterStatus(new Map());
    setShake(false);
    setShowGameOver(false);
    setGameStarted(false);
    setHintsUsed(0);
    setRevealedLetters(new Set());
  }, []);

  const startGame = () => {
    setGameStarted(true);
  };

  const handleNewGame = useCallback(() => {
    if (guesses.length > 0 && !gameOver) {
      setShowNewGameConfirm(true);
    } else {
      resetGame();
    }
  }, [guesses.length, gameOver, resetGame]);

  const canUseHint = !gameOver && hintsUsed < MAX_HINTS && totalCoins >= HINT_COST;

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
      description: "10 coins each, max 3 per game",
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
        { label: "Time", value: `${TIMER_DURATION - timeLeft}s` },
      ]
    : [
        { label: "The Word Was", value: targetWord },
        { label: "Your Guesses", value: guesses.length },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#567a7a] via-[#5a8080] to-[#4d7070] flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-400/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-400/5 rounded-full blur-3xl"></div>
      </div>

      <GameHeader
        coins={totalCoins}
        timeLeft={timeLeft}
        onHint={handleHint}
        hintsUsed={hintsUsed}
        maxHints={MAX_HINTS}
        canUseHint={canUseHint}
        gameStarted={gameStarted && !showGameOver}
      />

      <div className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full relative z-10">

        {!gameStarted ? (
          <GameStartScreen
            title="Astra Wordle"
            description="Guess the 5-letter word and earn coins!"
            icon={BookOpen}
            heroImage={wordleHero}
            instructions={wordleInstructions}
            onStartGame={startGame}
          />
        ) : showGameOver ? (
          <GameEndScreen
            won={won}
            stats={gameStats}
            coinsEarned={won ? WIN_REWARD : 0}
            onPlayAgain={resetGame}
            winMessage="You Solved It!"
            loseMessage="Game Over"
          />
        ) : (
          <>
            <div className="flex flex-col min-h-[calc(100vh-12rem)] gap-4">
              <div className="flex-1 flex flex-col justify-start gap-4">
                <WordleGrid
                  guesses={guesses}
                  currentGuess={currentGuess}
                  maxAttempts={MAX_ATTEMPTS}
                  targetWord={targetWord}
                  shake={shake}
                  revealedLetters={revealedLetters}
                />
              </div>

              <div className="pb-4">
                <WordleKeyboard
                  onKeyPress={handleKeyPress}
                  letterStatus={letterStatus}
                  disabled={gameOver}
                  targetWord={targetWord}
                  revealedLetters={revealedLetters}
                />
              </div>
            </div>
          </>
        )}
      </div>

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
