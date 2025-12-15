import { SudokuGrid as GridType } from "@/lib/sudoku";

interface SudokuGridProps {
  grid: GridType;
  fixedCells: Set<string>;
  hintCells: Set<string>;
  selectedCell: [number, number] | null;
  invalidCells: Set<string>;
  onCellClick: (row: number, col: number) => void;
}

const SudokuGrid = ({
  grid,
  fixedCells,
  hintCells,
  selectedCell,
  invalidCells,
  onCellClick,
}: SudokuGridProps) => {
  const getCellClasses = (row: number, col: number) => {
    const cellKey = `${row}-${col}`;
    const isFixed = fixedCells.has(cellKey);
    const isHint = hintCells.has(cellKey);
    const isSelected = selectedCell?.[0] === row && selectedCell?.[1] === col;
    const isInvalid = invalidCells.has(cellKey);
    const isSameRow = selectedCell?.[0] === row;
    const isSameCol = selectedCell?.[1] === col;
    const isSameBox =
      selectedCell &&
      Math.floor(selectedCell[0] / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell[1] / 3) === Math.floor(col / 3);

    // Smaller cells on mobile to reduce height; keep desktop size similar
    let classes = "w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-base md:text-xl font-semibold transition-all ";

    // Cursor
    if (isFixed || isHint) {
      classes += "cursor-not-allowed ";
    } else {
      classes += "cursor-pointer ";
    }

    // Background colors
    if (isInvalid) {
      classes += "bg-destructive/20 text-destructive ";
    } else if (isHint) {
      classes += "bg-accent/40 text-accent-foreground ";
    } else if (isSelected) {
      classes += "bg-primary/30 text-foreground ";
    } else if (isFixed) {
      classes += "bg-secondary/30 text-foreground ";
    } else if (isSameRow || isSameCol || isSameBox) {
      classes += "bg-primary/10 text-foreground ";
    } else {
      classes += "bg-card text-foreground hover:bg-primary/5 ";
    }

    // Borders - thicker for 3x3 boxes
    classes += "border-border ";
    if (row % 3 === 0) classes += "border-t-2 ";
    else classes += "border-t ";
    if (col % 3 === 0) classes += "border-l-2 ";
    else classes += "border-l ";
    if (row === 8) classes += "border-b-2 ";
    if (col === 8) classes += "border-r-2 ";

    return classes;
  };

  return (
    <div className="inline-block bg-border p-0.5 rounded-lg">
      <div className="grid grid-cols-9 gap-0">
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClasses(rowIndex, colIndex)}
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {cell || ""}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SudokuGrid;
