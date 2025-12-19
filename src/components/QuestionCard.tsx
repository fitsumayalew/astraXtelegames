import { useState, useEffect } from "react";
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
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Reset and start typing when question changes
  useEffect(() => {
    if (!question) return;
    setDisplayedText("");
    setIsTyping(true);
    let i = 0;
    const fullText = question.question;
    const speed = 25; // ms per char

    // Play typing sound when question starts revealing
    const audio = new Audio('/media/quiz/typing.webm');
    audio.volume = 0.3;
    audio.play().catch(() => { });

    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [question]);

  if (!question) {
    return (
      <Card className="w-full bg-[#fce5ba] shadow-[0_10px_0_rgba(0,0,0,1)] rounded-3xl p-6 border-4 border-black/10">
        <div className="text-center text-lg font-bold text-amber-900 animate-pulse">Loading question...</div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#fce5ba] shadow-[0_10px_0_rgba(0,0,0,1)] rounded-3xl pb-4 pt-4 px-4 relative border-none ring-4 ring-black/5 flex flex-col h-full justify-between">

      {/* Question Text (Inside Orange Box) */}
      <div className="mt-[10px] mx-auto bg-[#c87022] text-white py-3 px-4 rounded-2xl border-b-4 border-black/20 w-[95%] text-center mb-4 z-20 relative">
        <div className="min-h-[3rem] flex items-center justify-center">
          <h2 className="text-base sm:text-lg font-normal leading-snug">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </h2>
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#c87022] rotate-45 border-r-4 border-b-4 border-black/20 z-10"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center w-full">
        <div className="grid grid-cols-1 gap-2 ring-offset-2 w-full">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isWrongAnswer = isSelected && isCorrect === false;
            const isRightAnswer = isSelected && isCorrect === true;
            const isHidden = hiddenOptions?.has(index);

            let btnColorClass = "bg-[#2241d5] border-[#152a8a] text-white hover:bg-[#3355ff] hover:mt-[-2px] hover:pb-[calc(0.5rem+2px)] hover:shadow-[0_4px_0_#152a8a]"; // Default Blue

            if (isRightAnswer) {
              btnColorClass = "bg-[#4caf50] border-[#2e7d32] text-white shadow-[0_3px_0_#2e7d32]"; // Green
            } else if (isWrongAnswer) {
              btnColorClass = "bg-[#f44336] border-[#c62828] text-white shadow-[0_3px_0_#c62828] animate-shake"; // Red
            } else if (isHidden) {
              btnColorClass = "bg-gray-400 border-gray-600 text-gray-200 opacity-50 cursor-not-allowed shadow-[0_2px_0_#555]";
            }

            return (
              <Button
                key={index}
                onClick={() => onSelectAnswer(index)}
                disabled={disabled || !!isHidden}
                className={`h-auto w-full py-2 px-3 sm:py-3 sm:px-4 
                  border-b-4 rounded-full text-left justify-start relative
                  transition-all duration-100 ease-in-out text-sm sm:text-base mb-1
                  disabled:opacity-100 disabled:pointer-events-none
                  ${btnColorClass}
                  ${!isSelected && !disabled && !isHidden ? "shadow-[0_3px_0_#152a8a] active:shadow-none active:translate-y-[3px] active:border-b-0" : ""}
                  ${isSelected ? "" : "shadow-[0_3px_0_#152a8a]"}
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm flex-shrink-0 bg-white/20`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1 font-medium tracking-wide">{option}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;
