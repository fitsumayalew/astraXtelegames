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
import { Card } from "@/components/ui/card";
import confetti from "canvas-confetti";
import { Clock, Grid3x3, Target, Lightbulb, CheckCircle, Info } from "lucide-react";
import sudokuHero from "@/assets/sudoku-hero.png";

const HINT_COST = 10;
const FREE_HINTS = 5;

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
    } catch (err) {
      toast({ title: "Failed to start Sudoku", description: (err as Error).message, variant: "destructive" });
    }
  }, [toast]);

  const handleCellClick = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    if (gameOver || fixedCells.has(cellKey) || hintCells.has(cellKey)) return;
    setSelectedCell([row, col]);
    setInvalidCells(new Set()); // Clear invalid highlights when selecting new cell
  };

  const handleNumberClick = (num: number | null) => {
    if (!selectedCell || gameOver) return;

    const [row, col] = selectedCell;
    const cellKey = `${row}-${col}`;
    if (fixedCells.has(cellKey) || hintCells.has(cellKey)) return;

    const newGrid = currentGrid.map((r) => [...r]);
    newGrid[row][col] = num;
    setCurrentGrid(newGrid);

    // Completion will be checked through backend on demand
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
      } else {
        toast({ title: "Looking good!", description: "All filled cells are correct so far" });
      }
      if (res.complete) {
        handleGameOver(true);
      }
    } catch (err) {
      toast({ title: "Check failed", description: (err as Error).message, variant: "destructive" });
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
        return;
      }
    }
    try {
      if (!sessionId) return;
      const res = await apiSudokuHint(sessionId, currentGrid);
      if (res.message === "No empty cells" || res.row === undefined || res.col === undefined || res.value === undefined) {
        toast({ title: "No empty cells", description: "The puzzle is already complete" });
        if (!usingFree) await addCoins(HINT_COST);
        return;
      }
      const { row, col, value } = res;
      const newGrid = currentGrid.map((r) => [...r]);
      newGrid[row!][col!] = value!;
      setCurrentGrid(newGrid);
      const newHintCells = new Set(hintCells);
      newHintCells.add(`${row}-${col}`);
      setHintCells(newHintCells);
      if (usingFree) {
        setFreeHintsLeft((prev) => Math.max(0, prev - 1));
        toast({ title: "Hint revealed (free)", description: `Cell filled at row ${row! + 1}, column ${col! + 1}` });
      } else {
        toast({ title: "Hint revealed!", description: `Cell filled at row ${row! + 1}, column ${col! + 1}` });
      }
    } catch (err) {
      toast({ title: "Hint failed", description: (err as Error).message, variant: "destructive" });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      <GameHeader coins={totalCoins} onNewGame={handleNewGame} gameStarted={gameStarted} />
      
      <div className="max-w-4xl mx-auto px-4 py-6">{!gameStarted && !gameOver && (
          <GameStartScreen
            title="Astra Sudoku"
            description="Fill the 9×9 grid with logic and strategy"
            icon={Grid3x3}
            heroImage={sudokuHero}
            instructions={sudokuInstructions}
            onStartGame={handleStartGame}
            startButtonDisabled={!selectedDifficulty}
            startButtonText={selectedDifficulty ? `Start ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}` : "Select Difficulty"}
            additionalContent={
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-center">Select Difficulty</h3>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((diff) => {
                    const config = DIFFICULTY_CONFIG[diff];
                    const isSelected = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-md scale-105"
                            : "border-border bg-card/50 hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedDifficulty(diff)}
                      >
                        <div className="text-xs md:text-sm font-bold capitalize mb-1">
                          {diff}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>{Math.floor(config.time / 60)}m</div>
                          <div className="text-primary font-semibold">+{config.reward}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            }
          />
        )}

        {gameStarted && !gameOver && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 w-full justify-center flex-wrap">
                <div className="flex items-center gap-2 bg-secondary/20 rounded-full px-4 py-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Time:</span>
                  <span
                    className={`font-bold text-lg ${
                      timeLeft < 30 ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleHint} variant="outline" size="sm">
                    <Lightbulb className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Hint (10)</span>
                  </Button>
                  <Button onClick={handleCheckSolution} variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Check</span>
                  </Button>
                </div>
              </div>

              <SudokuGrid
                grid={currentGrid}
                fixedCells={fixedCells}
                hintCells={hintCells}
                selectedCell={selectedCell}
                invalidCells={invalidCells}
                onCellClick={handleCellClick}
              />
            </div>

            <NumberPad onNumberClick={handleNumberClick} disabled={false} />
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
          />
        )}

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
