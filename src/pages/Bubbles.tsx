import { useNavigate } from "react-router-dom";
import { useCoins } from "@/contexts/CoinContext";
import GameHeader from "@/components/shared/GameHeader";
import GameStartScreen from "@/components/shared/GameStartScreen";
import { Button } from "@/components/ui/button";
import { CircleDot, Target, Zap, Trophy } from "lucide-react";
import bubblesHero from "@/assets/bubbles-hero.png";

const Bubbles = () => {
  const navigate = useNavigate();
  const { totalCoins } = useCoins();

  const bubblesInstructions = [
    {
      icon: Target,
      title: "Match & Pop",
      description: "Shoot bubbles to create groups of 3 or more of the same color",
    },
    {
      icon: CircleDot,
      title: "Aim Carefully",
      description: "Use the aiming guide to bounce bubbles off walls for tricky shots",
    },
    {
      icon: Zap,
      title: "Clear Fast",
      description: "Pop bubbles quickly to earn combo bonuses and extra points",
    },
    {
      icon: Trophy,
      title: "Earn Rewards",
      description: "Complete levels to unlock power-ups and earn coins",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500/20 via-pink-500/20 to-purple-500/20 relative overflow-hidden">
      {/* Floating bubbles background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-40 h-40 bg-pink-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-36 h-36 bg-purple-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-blue-400 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <GameHeader coins={totalCoins} />
      
      <div className="px-4 py-6 max-w-4xl mx-auto relative z-10">
        <GameStartScreen
          title="Astra Bubbles"
          description="Pop colorful bubbles and clear the board"
          icon={CircleDot}
          heroImage={bubblesHero}
          instructions={bubblesInstructions}
          onStartGame={() => {}}
          startButtonText="Coming Soon"
          startButtonDisabled={true}
          additionalContent={
            <div className="text-center space-y-4 -mt-4">
              <p className="text-muted-foreground">
                Get ready for an exciting bubble-popping adventure!
              </p>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="mt-4"
              >
                Back to Games
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default Bubbles;
