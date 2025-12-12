import GameStartScreen from "./shared/GameStartScreen";
import { Clock, Heart, Coins, Trophy, HelpCircle } from "lucide-react";
import popQuizLogo from "@/assets/pop-quiz-logo.png";
import { useCoins } from "@/contexts/CoinContext";

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen = ({ onStartGame }: StartScreenProps) => {
  const { totalCoins } = useCoins();
  const ENTRY_COST = 100;
  const canAfford = totalCoins >= ENTRY_COST;

  const instructions = [
    {
      icon: Clock,
      title: "10 Seconds Per Question",
      description: "Answer before time runs out!",
    },
    {
      icon: Heart,
      title: "3 Lives",
      description: "Wrong answers or timeouts cost a life",
    },
    {
      icon: Coins,
      title: "Earn Coins",
      description: "Get 10-15 coins for each correct answer",
    },
    {
      icon: Trophy,
      title: "10 Questions",
      description: "Complete all questions to finish",
    },
  ];

  return (
    <GameStartScreen
      title="Astra Pop Quiz"
      description="Test your knowledge across various topics"
      icon={HelpCircle}
      heroImage={popQuizLogo}
      instructions={instructions}
      onStartGame={onStartGame}
      startButtonText={canAfford ? `Start Game (${ENTRY_COST} coins)` : `Not Enough Coins (Need ${ENTRY_COST})`}
      startButtonDisabled={!canAfford}
      startButtonIconOnly
      startCost={ENTRY_COST}
    />
  );
};

export default StartScreen;
