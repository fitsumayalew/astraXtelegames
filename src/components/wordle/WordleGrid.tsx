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
      return "bg-[#6aaa64] border-white/40 text-white shadow-lg";
    }
    if (targetWord.includes(letter)) {
      return "bg-[#c9b458] border-white/40 text-white shadow-lg";
    }
    return "bg-[#787c7e] border-white/30 text-white shadow-lg";
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
                    w-16 h-16 md:w-20 md:h-20 border-3 flex items-center justify-center
                    text-2xl md:text-3xl font-bold transition-all duration-300
                    ${
                      isSubmittedRow
                        ? getCellColor(letter, colIndex, row)
                        : isRevealed
                        ? "bg-[#6aaa64] border-white/40 text-white shadow-lg"
                        : hasLetter
                        ? "border-white/60 bg-white/10 text-white scale-105 shadow-md"
                        : "border-white/30 bg-white/5 backdrop-blur-sm text-white"
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
