import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface WordleKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatus: Map<string, "correct" | "present" | "absent">;
  disabled: boolean;
  targetWord: string;
  revealedLetters: Set<number>;
  revealedHints?: Map<number, string>;
  searchClues?: Set<string>;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const WordleKeyboard = ({ onKeyPress, letterStatus, disabled, targetWord, revealedLetters, revealedHints = new Map(), searchClues = new Set() }: WordleKeyboardProps) => {
  const getKeyColor = (key: string) => {
    // Check if this letter is revealed as a hint
    const revealedLettersArray = Array.from(revealedLetters).map(i => revealedHints.get(i) ?? "");
    if (revealedLettersArray.includes(key)) {
      return "bg-[#6aaa64] hover:bg-[#5a9a54] text-white border-green-300 shadow-md";
    }
    
    if (searchClues.has(key)) {
      return "bg-cyan-500 hover:bg-cyan-400 text-white border-green-200 shadow-md";
    }

    const status = letterStatus.get(key);
    if (status === "correct") return "bg-[#6aaa64] hover:bg-[#5a9a54] text-white border-green-300 shadow-md";
    if (status === "present") return "bg-[#c9b458] hover:bg-[#b9a448] text-white border-green-200 shadow-md";
    if (status === "absent") return "bg-[#787c7e] hover:bg-[#686c6e] text-white/80 border-green-200/60";
    return "bg-green-50 text-green-900 border-green-300 hover:bg-green-100 hover:border-green-400 hover:shadow-md transition-all";
  };

  return (
    <div className="w-full px-1 space-y-1.5">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isSpecial = key === "ENTER" || key === "⌫";
            return (
              <Button
                key={key}
                onClick={() => onKeyPress(key)}
                disabled={disabled}
                className={`
                  ${isSpecial ? "px-3 md:px-5 flex-1 max-w-[80px] md:max-w-[95px]" : "flex-1 max-w-[46px] md:max-w-[60px] p-0"}
                  h-14 md:h-16 rounded-lg
                  font-bold text-base md:text-lg transition-all border-2
                  ${getKeyColor(key)}
                `}
                variant="outline"
              >
                {key === "⌫" ? <Delete className="w-6 h-6 md:w-7 md:h-7" /> : key}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WordleKeyboard;
