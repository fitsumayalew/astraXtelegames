import { Question } from "@/data/questions";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface QuestionCardProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  disabled: boolean;
  isCorrect: boolean | null;
  hiddenOptions?: Set<number>;
}

const QuestionCard = ({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  disabled,
  isCorrect,
  hiddenOptions,
}: QuestionCardProps) => {
  if (!question) {
    return (
      <Card className="w-full bg-card/95 backdrop-blur-sm rounded-2xl p-4 border-2 border-border/50">
        <div className="text-center text-sm text-muted-foreground">Loading question…</div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card/95 backdrop-blur-sm shadow-[var(--shadow-card)] rounded-2xl p-3 sm:p-4 md:p-6 animate-bounce-in border-2 border-border/50">
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <span className="text-[11px] sm:text-sm font-bold text-secondary bg-secondary/10 px-2.5 py-1.5 sm:px-3 rounded-full border border-secondary/20">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold text-primary bg-gradient-to-r from-primary/10 to-primary/5 px-2.5 sm:px-3 py-1.5 rounded-full border border-primary/20">
            <span>+{question.coins ?? 0}</span>
            <span className="text-[10px] sm:text-xs">coins</span>
          </div>
        </div>
        <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-foreground leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isWrongAnswer = isSelected && isCorrect === false;
          const isRightAnswer = isSelected && isCorrect === true;
          const isHidden = hiddenOptions?.has(index);
          
          return (
            <Button
              key={index}
              onClick={() => onSelectAnswer(index)}
              disabled={disabled || !!isHidden}
              variant="outline"
              className={`h-auto py-2.5 px-3 sm:py-3.5 sm:px-4 md:py-5 md:px-6 text-left justify-start font-medium text-[13px] sm:text-base md:text-lg transition-all duration-300 border-2 ${
                isRightAnswer
                  ? "bg-primary/10 text-primary border-primary shadow-[0_0_20px_rgba(148,205,87,0.3)] scale-[1.02]"
                  : isWrongAnswer
                  ? "bg-destructive/10 text-destructive border-destructive animate-shake"
                  : isHidden
                  ? "bg-muted text-muted-foreground border-border opacity-60"
                  : "bg-card border-secondary/20"
              }`}
            >
              <span className="flex items-center gap-2.5 sm:gap-4 w-full">
                <span className={`flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full font-bold text-[11px] sm:text-sm md:text-base flex-shrink-0 transition-all ${
                  isRightAnswer 
                    ? "bg-primary text-primary-foreground" 
                    : isWrongAnswer 
                    ? "bg-destructive text-destructive-foreground"
                    : isHidden
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary/10 text-secondary"
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1 text-[13px] sm:text-base">{option}</span>
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuestionCard;
