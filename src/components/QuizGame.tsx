import { useState, useEffect } from "react";
import { questions, Question } from "@/data/questions";
import GameHeader from "./shared/GameHeader";
import Lives from "./Lives";
import Timer from "./Timer";
import QuestionCard from "./QuestionCard";
import ResultsScreen from "./ResultsScreen";
import StartScreen from "./StartScreen";
import AnswerFeedback from "./AnswerFeedback";
import { useCoins } from "@/contexts/CoinContext";
import { useToast } from "@/hooks/use-toast";

const TIMER_DURATION = 10;
const MAX_LIVES = 3;
const ENTRY_COST = 100;

const QuizGame = () => {
  const { totalCoins, addCoins, spendCoins } = useCoins();
  const { toast } = useToast();
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [lastLostLife, setLastLostLife] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (showResults || isAnswered || !gameStarted || showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return TIMER_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showResults, isAnswered, gameStarted, showFeedback]);

  const handleTimeout = () => {
    const newLives = lives - 1;
    setLastLostLife(lives - 1);
    setLives(newLives);

    if (newLives <= 0) {
      endGame();
    } else {
      moveToNextQuestion();
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    const correct = index === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      setCoinsEarned(coinsEarned + currentQuestion.coins);
      void addCoins(currentQuestion.coins);
    } else {
      const newLives = lives - 1;
      setLastLostLife(lives - 1);
      setLives(newLives);

      if (newLives <= 0) {
        setTimeout(() => endGame(), 1500);
        setShowFeedback(true);
        return;
      }
    }

    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
      moveToNextQuestion();
    }, 1500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(TIMER_DURATION);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      endGame();
    }
  };

  const endGame = () => {
    setShowFeedback(false);
    setShowResults(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setLives(MAX_LIVES);
    setScore(0);
    setCoinsEarned(0);
    setTimeLeft(TIMER_DURATION);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setShowResults(false);
    setLastLostLife(null);
    setShowFeedback(false);
  };

  const startGame = async () => {
    const ok = await spendCoins(ENTRY_COST);
    if (ok) {
      setGameStarted(true);
      return;
    }

    toast({
      title: "Not enough coins",
      description: `You need ${ENTRY_COST} coins to enter this quiz`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 relative overflow-hidden">
      {/* Enhanced stars background with twinkling effect */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-40 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-60 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-40 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-yellow-300 rounded-full animate-pulse-slow" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-1/3 right-1/2 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse-slow" style={{ animationDelay: '1.2s' }}></div>
        {/* Planets/celestial bodies */}
        <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <GameHeader coins={totalCoins} onNewGame={gameStarted ? resetGame : undefined} />
      
      <div className="max-w-4xl mx-auto relative z-10 px-4 py-6 space-y-6">
        {!gameStarted ? (
          <StartScreen 
            onStartGame={startGame}
          />
        ) : !showResults ? (
          <>
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="flex-1">
                <Timer timeLeft={timeLeft} maxTime={TIMER_DURATION} />
              </div>
              <Lives lives={lives} lastLostLife={lastLostLife} />
            </div>
            <QuestionCard
              question={currentQuestion}
              currentQuestion={currentQuestionIndex}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              onSelectAnswer={handleSelectAnswer}
              disabled={isAnswered}
              isCorrect={isCorrect}
            />
          </>
        ) : (
          <ResultsScreen
            score={score}
            totalQuestions={questions.length}
            coinsEarned={coinsEarned}
            onPlayAgain={resetGame}
          />
        )}
      </div>

      {/* Answer Feedback Overlay */}
      {showFeedback && isCorrect !== null && (
        <AnswerFeedback
          isCorrect={isCorrect}
          coins={isCorrect ? currentQuestion.coins : 0}
        />
      )}
    </div>
  );
};

export default QuizGame;
