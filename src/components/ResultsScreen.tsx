import GameEndScreen from "./shared/GameEndScreen";

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  coinsEarned: number;
  onPlayAgain: () => void;
}

const ResultsScreen = ({
  score,
  totalQuestions,
  coinsEarned,
  onPlayAgain,
}: ResultsScreenProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassed = percentage >= 50;

  const stats = [
    {
      label: "Correct Answers",
      value: `${score}/${totalQuestions}`,
    },
    {
      label: "Score",
      value: `${percentage}%`,
    },
  ];

  return (
    <GameEndScreen
      won={isPassed}
      stats={stats}
      coinsEarned={coinsEarned}
      onPlayAgain={onPlayAgain}
      winMessage="Great Job!"
      loseMessage="Better Luck Next Time"
    />
  );
};

export default ResultsScreen;
