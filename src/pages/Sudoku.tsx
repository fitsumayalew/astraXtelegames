import { useState, useEffect, useCallback } from "react";
import { useCoins } from "@/contexts/CoinContext";
import { useToast } from "@/hooks/use-toast";
import { SudokuGrid as GridType, Difficulty, DIFFICULTY_CONFIG } from "@/lib/sudoku";
import { apiSudokuStart, apiSudokuCheck, apiSudokuHint } from "@/lib/api";
import GameHeader from "@/components/shared/GameHeader";
import SudokuGrid from "@/components/sudoku/SudokuGrid";
import NumberPad from "@/components/sudoku/NumberPad";
import GameStartScreen from "@/components/shared/GameStartScreen";
import GameEndScreen from "@/components/shared/GameEndScreen";
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
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { Clock, Grid3x3, Target, Lightbulb, CheckCircle, Info, Volume2, VolumeX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import sudokuHero from "@/assets/sudoku-hero.png";

const HINT_COST = 10;
const FREE_HINTS = 5;

const getMediaUrl = (fileName: string) => `/media/${encodeURIComponent(fileName)}`;
const SOUND_URLS = {
  click: getMediaUrl("clickbuton.webm"),
  wrong: getMediaUrl("wrong answer.webm"),
  win: getMediaUrl("word found.webm"),
  lose: getMediaUrl("whoosh2.webm"),
  start: getMediaUrl("woosh.webm"),
  hint: getMediaUrl("hint found.webm"),
} as const;
type SoundKey = keyof typeof SOUND_URLS;
const SOUND_VOLUMES: Record<SoundKey, number> = {
  click: 0.4,
  wrong: 0.6,
  win: 0.7,
  lose: 0.55,
  start: 0.55,
  hint: 0.5,
};

const Sudoku = () => {
  const { totalCoins, addCoins, spendCoins } = useCoins();
  const { toast } = useToast();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [puzzle, setPuzzle] = useState<GridType>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentGrid, setCurrentGrid] = useState<GridType>([]);
  const [fixedCells, setFixedCells] = useState<Set<string>>(new Set());
  const [hintCells, setHintCells] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [freeHintsLeft, setFreeHintsLeft] = useState(FREE_HINTS);
  const [howToPlayOpen, setHowToPlayOpen] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("sudokuSound") !== "off" : true));

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleGameOver(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, timeLeft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("sudokuSound", soundEnabled ? "on" : "off");
    window.dispatchEvent(new CustomEvent("sudoku:sound-changed", { detail: soundEnabled }));
  }, [soundEnabled]);

  const playSound = useCallback((sound: SoundKey) => {
    if (!soundEnabled) return;
    const audio = new Audio(SOUND_URLS[sound]);
    audio.volume = SOUND_VOLUMES[sound] ?? 0.4;
    audio.play().catch(() => { });
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const initializeGame = useCallback(async (diff: Difficulty) => {
    try {
      const res = await apiSudokuStart(diff);
      const newPuzzle = res.puzzle as GridType;
      const fixed = new Set<string>();
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (newPuzzle[row][col] !== null) fixed.add(`${row}-${col}`);
        }
      }
      setPuzzle(newPuzzle);
      setCurrentGrid(newPuzzle.map((row) => [...row]));
      setFixedCells(fixed);
      setHintCells(new Set());
      setSelectedCell(null);
      setInvalidCells(new Set());
      setDifficulty(diff);
      setTimeLeft(res.time);
      setElapsedTime(0);
      setFreeHintsLeft(FREE_HINTS);
      setGameStarted(true);
      setGameOver(false);
      setWon(false);
      setSessionId(res.sessionId);
      playSound("start");
    } catch (err) {
      toast({ title: "Failed to start Sudoku", description: (err as Error).message, variant: "destructive" });
      playSound("wrong");
    }
  }, [toast, playSound]);

  const handleCellClick = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    if (gameOver || fixedCells.has(cellKey) || hintCells.has(cellKey)) return;
    setSelectedCell([row, col]);
    setInvalidCells(new Set());
  };

  const handleNumberClick = (num: number | null) => {
    if (!selectedCell || gameOver) return;
    const [row, col] = selectedCell;
    const cellKey = `${row}-${col}`;
    if (fixedCells.has(cellKey) || hintCells.has(cellKey)) return;

    const newGrid = currentGrid.map((r) => [...r]);
    newGrid[row][col] = num;
    setCurrentGrid(newGrid);

    playSound("click");
  };

  const handleCheckSolution = async () => {
    if (!sessionId) return;
    try {
      const res = await apiSudokuCheck(sessionId, currentGrid);
      const invalidSet = new Set<string>(res.invalidCells);
      setInvalidCells(invalidSet);
      if (res.invalidCells.length > 0) {
        toast({
          title: "Incorrect cells found",
          description: `${res.invalidCells.length} cell${res.invalidCells.length > 1 ? "s are" : " is"} highlighted in red`,
          variant: "destructive",
        });
        playSound("wrong");
      } else {
        toast({ title: res.complete ? "Puzzle complete!" : "Looks good", description: res.complete ? "All cells are correct." : "All filled cells are correct so far" });
      }
      if (res.complete) {
        handleGameOver(true);
      }
    } catch (err) {
      toast({ title: "Check failed", description: (err as Error).message, variant: "destructive" });
      playSound("wrong");
    }
  };

  const handleHint = async () => {
    const usingFree = freeHintsLeft > 0;
    if (!usingFree) {
      const paid = await spendCoins(HINT_COST);
      if (!paid) {
        toast({
          title: "Not enough coins",
          description: `You need ${HINT_COST} coins to use a hint`,
          variant: "destructive",
        });
        playSound("wrong");
        return;
      }
    }
    try {
      if (!sessionId) return;
      const res = await apiSudokuHint(sessionId, currentGrid);
      if (res.message === "No empty cells" || res.row === undefined || res.col === undefined || res.value === undefined) {
        toast({ title: "No empty cells", description: "The puzzle is already complete", variant: "destructive" });
        if (!usingFree) await addCoins(HINT_COST);
        playSound("wrong");
        return;
      }
      const { row, col, value } = res;
      const newGrid = currentGrid.map((r) => [...r]);
      newGrid[row][col] = value!;
      setCurrentGrid(newGrid);
      const newHintCells = new Set(hintCells);
      newHintCells.add(`${row}-${col}`);
      setHintCells(newHintCells);
      setFreeHintsLeft((prev) => Math.max(0, prev - 1));
      playSound("hint");
    } catch (err) {
      toast({ title: "Hint failed", description: (err as Error).message, variant: "destructive" });
      playSound("wrong");
    }
  };

  const handleGameOver = (isWin: boolean) => {
    setGameOver(true);
    setWon(isWin);

    if (difficulty) {
      setElapsedTime(DIFFICULTY_CONFIG[difficulty].time - timeLeft);
    }

    if (isWin && difficulty) {
      const reward = DIFFICULTY_CONFIG[difficulty].reward;
      void addCoins(reward);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      playSound("win");
    } else {
      playSound("lose");
    }
  };

  const handleNewGame = () => {
    if (gameStarted && !gameOver) {
      setShowNewGameConfirm(true);
    } else {
      resetGame();
    }
  };

  const confirmNewGame = () => {
    setShowNewGameConfirm(false);
    resetGame();
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setWon(false);
    setDifficulty(null);
    setSelectedDifficulty(null);
    setSelectedCell(null);
    setInvalidCells(new Set());
    setHintCells(new Set());
  };

  const handleStartGame = () => {
    if (selectedDifficulty) {
      initializeGame(selectedDifficulty);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sudokuInstructions = [
    {
      icon: Target,
      title: "Fill the Grid",
      description: "Each row, column, and 3×3 box must contain digits 1-9",
    },
    {
      icon: Clock,
      title: "Beat the Timer",
      description: "Complete the puzzle before time runs out",
    },
    {
      icon: Lightbulb,
      title: "Use Hints",
      description: "Spend 10 coins to reveal a random cell",
    },
    {
      icon: CheckCircle,
      title: "Check Progress",
      description: "Validate your solution and see incorrect cells",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#4a3264] text-white">
      {/* Backgrounds */}
      {(!gameStarted && !gameOver) && (
        <>
          <div
            className="absolute inset-0 z-0 bg-center bg-cover pointer-events-none"
            style={{ backgroundImage: 'url(/images/sudoku/bghash-sheet0.png)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
          />
          <div
            className="absolute inset-0 z-0 bg-center bg-cover pointer-events-none"
            style={{ backgroundImage: 'url(/images/sudoku/bgsquares-sheet0.png)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
          />
        </>
      )}
      {(gameStarted || gameOver) && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/images/sudoku/mainbg0-sheet0.png)',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center'
          }}
        />
      )}

      <GameHeader coins={totalCoins} onNewGame={handleNewGame} gameStarted={gameStarted} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-4 md:py-6">
        {!gameStarted && !gameOver && (
          <GameStartScreen
            title="Astra Sudoku"
            description="Fill the 9×9 grid with logic and strategy"
            icon={Grid3x3}
            hideHero
            backgroundImage=""
            backgroundOpacity={0}
            fullScreenBackground={false}
            compactHeight
            showBackgroundAlways={false}
            instructions={[]}
            onStartGame={handleStartGame}
            startButtonDisabled={!selectedDifficulty}
            startButtonText={selectedDifficulty ? `Start ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}` : "Select Difficulty"}
            startButtonIconOnly
            additionalContent={
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <Button
                    size="icon"
                    onClick={() => setHowToPlayOpen(true)}
                    className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/70 shadow-lg hover:opacity-90"
                  >
                    <Info className="w-6 h-6 md:w-7 md:h-7" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={toggleSound}
                    className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 text-white border-2 border-white/70 shadow-lg hover:opacity-90"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-6 h-6 md:w-7 md:h-7" />
                    ) : (
                      <VolumeX className="w-6 h-6 md:w-7 md:h-7" />
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => {
                    const config = DIFFICULTY_CONFIG[diff];
                    const isSelected = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        className={`group p-3 rounded-2xl border-2 transition-all text-left shadow-md backdrop-blur ${isSelected
                          ? "border-yellow-300 bg-white/20 scale-105 shadow-yellow-500/30"
                          : "border-white/40 bg-white/10 hover:border-yellow-200 hover:scale-102"
                          }`}
                        onClick={() => setSelectedDifficulty(diff)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs md:text-sm font-bold capitalize text-white drop-shadow">{diff}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-amber-200 border border-white/30">+{config.reward}c</span>
                        </div>
                        <div className="text-[11px] text-amber-50/80 mt-1">{Math.floor(config.time / 60)} min</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            }
          />
        )}

        {gameStarted && !gameOver && (
          <div className="space-y-4 md:space-y-5">
            <div className="bg-black/40 border border-white/10 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-md flex flex-col gap-3 md:gap-4">
              <div className="flex items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 shadow-sm">
                  <Clock className={`w-5 h-5 ${timeLeft < 30 ? "text-red-300" : "text-white"}`} />
                  <span className="text-sm font-semibold">{formatTime(timeLeft)}</span>
                </div>

                <div className="flex items-center gap-2 md:gap-3 ml-auto">
                  <Button
                    onClick={handleHint}
                    size="icon"
                    className="relative rounded-full w-12 h-12 md:w-14 md:h-14 bg-[#8963cd] hover:bg-[#7f57c8] text-white font-extrabold border-2 border-white/40 shadow-lg hover:shadow-purple-500/30"
                    aria-label="Use hint"
                  >
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/80 text-[10px] font-bold text-amber-200 border border-white/60">
                      {freeHintsLeft > 0 ? freeHintsLeft : HINT_COST}
                    </span>
                  </Button>
                  <Button
                    onClick={handleCheckSolution}
                    size="icon"
                    className="rounded-full w-12 h-12 md:w-14 md:h-14 bg-[#8d4e8f] hover:bg-[#7f437f] text-white font-bold border-2 border-white/40 shadow-lg hover:shadow-purple-500/30"
                    aria-label="Check solution"
                  >
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6" />
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl bg-[#8d4e8f] text-white shadow-2xl p-3 md:p-6 border border-[#8d4e8f]">
                <div className="flex justify-center">
                  <SudokuGrid
                    grid={currentGrid}
                    fixedCells={fixedCells}
                    hintCells={hintCells}
                    selectedCell={selectedCell}
                    invalidCells={invalidCells}
                    onCellClick={handleCellClick}
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-transparent text-white shadow-xl p-2 md:p-4 border border-[#8d4e8f] backdrop-blur-sm">
                <NumberPad onNumberClick={handleNumberClick} disabled={false} />
              </div>
            </div>
          </div>
        )}

        {gameOver && (
          <GameEndScreen
            won={won}
            stats={[
              { label: "Difficulty", value: difficulty?.toUpperCase() || "N/A" },
              { label: "Time Taken", value: formatTime(elapsedTime) },
            ]}
            coinsEarned={won && difficulty ? DIFFICULTY_CONFIG[difficulty].reward : 0}
            onPlayAgain={resetGame}
            winMessage="Puzzle Solved!"
            loseMessage="Time's Up!"
            compactHeight
          />
        )}

        {/* How to play dialog */}
        <Dialog open={howToPlayOpen} onOpenChange={setHowToPlayOpen}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md px-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Grid3x3 className="w-5 h-5" /> How to play Sudoku</DialogTitle>
              <DialogDescription>
                Fill every row, column, and 3×3 box with digits 1-9 without repeating a number in any row, column, or box.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="p-3 rounded-xl bg-secondary/20 border border-border">Tap a cell, then use the number pad to fill it. Fixed cells are highlighted.</div>
              <div className="p-3 rounded-xl bg-secondary/20 border border-border">You have {FREE_HINTS} free hints; after that each hint costs {HINT_COST} coins.</div>
              <div className="p-3 rounded-xl bg-secondary/20 border border-border">Use Check to highlight incorrect cells. Time runs out based on difficulty.</div>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Game Confirmation */}
        <AlertDialog open={showNewGameConfirm} onOpenChange={setShowNewGameConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start New Game?</AlertDialogTitle>
              <AlertDialogDescription>
                Your current progress will be lost. Are you sure you want to start a new game?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmNewGame}>Start New Game</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Sudoku;
