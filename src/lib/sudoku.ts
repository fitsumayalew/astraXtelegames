// Sudoku puzzle generation and validation utilities

export type SudokuGrid = (number | null)[][];
export type SudokuCell = {
  value: number | null;
  isFixed: boolean;
  isInvalid: boolean;
};

export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTY_CONFIG = {
  easy: { time: 300, cellsToFill: 35, reward: 10 },
  medium: { time: 180, cellsToFill: 45, reward: 25 },
  hard: { time: 120, cellsToFill: 55, reward: 50 },
};

// Check if a number is valid in a specific position
export const isValidPlacement = (
  grid: SudokuGrid,
  row: number,
  col: number,
  num: number
): boolean => {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (grid[x][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[boxRow + i][boxCol + j] === num) return false;
    }
  }

  return true;
};

// Solve sudoku using backtracking
const solveSudoku = (grid: SudokuGrid): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// Generate a complete valid sudoku grid
const generateCompleteGrid = (): SudokuGrid => {
  const grid: SudokuGrid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

  // Fill diagonal 3x3 boxes first
  for (let box = 0; box < 9; box += 3) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * nums.length);
        grid[box + i][box + j] = nums[randomIndex];
        nums.splice(randomIndex, 1);
      }
    }
  }

  // Solve the rest
  solveSudoku(grid);
  return grid;
};

// Generate a playable puzzle by removing numbers
export const generatePuzzle = (difficulty: Difficulty): {
  puzzle: SudokuGrid;
  solution: SudokuGrid;
} => {
  const solution = generateCompleteGrid();
  const puzzle = solution.map((row) => [...row]);

  const cellsToRemove = DIFFICULTY_CONFIG[difficulty].cellsToFill;
  let removed = 0;

  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      removed++;
    }
  }

  return { puzzle, solution };
};

// Validate if current grid matches solution
export const validateSolution = (
  current: SudokuGrid,
  solution: SudokuGrid
): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (current[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
};

// Check which cells are incorrect
export const getInvalidCells = (
  current: SudokuGrid,
  solution: SudokuGrid
): Set<string> => {
  const invalid = new Set<string>();
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (
        current[row][col] !== null &&
        current[row][col] !== solution[row][col]
      ) {
        invalid.add(`${row}-${col}`);
      }
    }
  }
  return invalid;
};

// Get a random empty cell for hint
export const getRandomEmptyCell = (grid: SudokuGrid): [number, number] | null => {
  const emptyCells: [number, number][] = [];
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        emptyCells.push([row, col]);
      }
    }
  }
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};
