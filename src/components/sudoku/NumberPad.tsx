import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface NumberPadProps {
  onNumberClick: (num: number | null) => void;
  disabled: boolean;
}

const NumberPad = ({ onNumberClick, disabled }: NumberPadProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <Button
          key={num}
          onClick={() => onNumberClick(num)}
          disabled={disabled}
          size="sm"
          className="w-10 h-10 md:w-14 md:h-14 text-base md:text-xl font-bold rounded-full"
          variant="default"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onNumberClick(null)}
        disabled={disabled}
        size="sm"
        className="w-10 h-10 md:w-14 md:h-14 rounded-full"
        variant="outline"
      >
        <Eraser className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
    </div>
  );
};

export default NumberPad;
