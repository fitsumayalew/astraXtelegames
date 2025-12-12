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
          size="lg"
          className="w-14 h-14 md:w-16 md:h-16 text-xl font-bold rounded-full"
          variant="default"
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={() => onNumberClick(null)}
        disabled={disabled}
        size="lg"
        className="w-14 h-14 md:w-16 md:h-16 rounded-full"
        variant="outline"
      >
        <Eraser className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default NumberPad;
