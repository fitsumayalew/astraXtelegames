interface WordleGridProps {
  guesses: string[];
  currentGuess: string;
  maxAttempts: number;
  targetWord: string;
  shake: boolean;
  revealedLetters: Set<number>;
}

const WordleGrid = ({ guesses, currentGuess, maxAttempts, targetWord, shake, revealedLetters }: WordleGridProps) => {
  const getCellColor = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) {
      return "bg-[#6aaa64] border-[#4d7c45] text-white shadow-lg ring-1 ring-white/70";
    }
    if (targetWord.includes(letter)) {
      return "bg-[#c9b458] border-[#9f8933] text-white shadow-lg ring-1 ring-white/70";
    }
    return "bg-[#787c7e] border-[#5a5d60] text-white shadow-lg ring-1 ring-white/70";
  };

  const rows = Array.from({ length: maxAttempts }, (_, i) => {
    if (i < guesses.length) {
      return guesses[i];
    } else if (i === guesses.length) {
      // Build current guess with revealed letters merged in correct positions
      let displayGuess = "";
      let userInputIndex = 0;
      for (let j = 0; j < 5; j++) {
        if (revealedLetters.has(j)) {
          displayGuess += targetWord[j];
        } else if (userInputIndex < currentGuess.length) {
          displayGuess += currentGuess[userInputIndex];
          userInputIndex++;
        } else {
          displayGuess += " ";
        }
      }
      return displayGuess;
    }
    // For future rows, show revealed letters
    let futureGuess = "";
    for (let j = 0; j < 5; j++) {
      futureGuess += revealedLetters.has(j) ? targetWord[j] : " ";
    }
    return futureGuess;
  });

  return (
    <div className="space-y-2">
      {rows.map((row, rowIndex) => {
        const isCurrentRow = rowIndex === guesses.length && currentGuess;
        const isSubmittedRow = rowIndex < guesses.length;
        const isFutureRow = rowIndex > guesses.length;
        
        return (
          <div
            key={rowIndex}
            className={`flex justify-center gap-2 ${
              isCurrentRow && shake ? "animate-shake" : ""
            }`}
          >
            {Array.from({ length: 5 }).map((_, colIndex) => {
              const letter = row[colIndex] || "";
              const hasLetter = letter.trim() !== "";
              const isRevealed = revealedLetters.has(colIndex);
              
              return (
                <div
                  key={colIndex}
                  className={`
                    w-11 h-11 sm:w-13 sm:h-13 md:w-15 md:h-15 border-3 flex items-center justify-center
                    text-xl md:text-2xl font-bold transition-all duration-300
                    shadow-inner shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]
                    ${
                      isSubmittedRow
                        ? getCellColor(letter, colIndex, row)
                        : isRevealed
                        ? "bg-[#6aaa64] border-[#4d7c45] text-white shadow-lg ring-1 ring-white/70"
                        : hasLetter
                        ? "border-white bg-[#f7e9a3] text-[#2f2400] scale-105 shadow-inner shadow-[inset_0_3px_8px_rgba(0,0,0,0.4)]"
                        : "border-white bg-[#f2e6b3] backdrop-blur-sm text-white shadow-inner shadow-[inset_0_2px_6px_rgba(0,0,0,0.35)]"
                    }
                  `}
                  style={{
                    animationDelay: isSubmittedRow ? `${colIndex * 100}ms` : "0ms",
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default WordleGrid;
