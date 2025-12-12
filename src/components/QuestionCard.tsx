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
}

const QuestionCard = ({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  disabled,
  isCorrect,
}: QuestionCardProps) => {
  return (
    <Card className="w-full bg-card/95 backdrop-blur-sm shadow-[var(--shadow-card)] rounded-2xl p-6 md:p-8 animate-bounce-in border-2 border-border/50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm font-bold text-secondary bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2 text-sm font-bold text-primary bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-full border border-primary/20">
            <span>+{question.coins}</span>
            <span className="text-xs">coins</span>
          </div>
        </div>
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isWrongAnswer = isSelected && isCorrect === false;
          const isRightAnswer = isSelected && isCorrect === true;
          
          return (
            <Button
              key={index}
              onClick={() => onSelectAnswer(index)}
              disabled={disabled}
              variant="outline"
              className={`h-auto py-5 px-6 text-left justify-start font-medium text-base md:text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-2 ${
                isRightAnswer
                  ? "bg-primary/10 text-primary border-primary shadow-[0_0_20px_rgba(148,205,87,0.3)] scale-[1.02]"
                  : isWrongAnswer
                  ? "bg-destructive/10 text-destructive border-destructive animate-shake"
                  : "bg-card hover:bg-secondary/5 hover:border-secondary/30"
              }`}
            >
              <span className="flex items-center gap-4 w-full">
                <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-base flex-shrink-0 transition-all ${
                  isRightAnswer 
                    ? "bg-primary text-primary-foreground" 
                    : isWrongAnswer 
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary/10 text-secondary"
                }`}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuestionCard;
