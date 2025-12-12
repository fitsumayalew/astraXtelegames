import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface WordleKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatus: Map<string, "correct" | "present" | "absent">;
  disabled: boolean;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const WordleKeyboard = ({ onKeyPress, letterStatus, disabled }: WordleKeyboardProps) => {
  const getKeyColor = (key: string) => {
    const status = letterStatus.get(key);
    if (status === "correct") return "bg-[#6aaa64] hover:bg-[#5a9a54] text-white border-white/30 shadow-md";
    if (status === "present") return "bg-[#c9b458] hover:bg-[#b9a448] text-white border-white/30 shadow-md";
    if (status === "absent") return "bg-[#787c7e] hover:bg-[#686c7e] text-white/70 border-white/20";
    return "bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/30 hover:border-white/50 text-white hover:shadow-md transition-all";
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
                  ${isSpecial ? "px-2 md:px-3 flex-1 max-w-[60px] md:max-w-[72px]" : "flex-1 max-w-[34px] md:max-w-[46px] p-0"}
                  h-10 md:h-12 rounded-lg
                  font-bold text-sm md:text-base transition-all border-2
                  ${getKeyColor(key)}
                `}
                variant="outline"
              >
                {key === "⌫" ? <Delete className="w-4 h-4 md:w-5 md:h-5" /> : key}
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WordleKeyboard;
