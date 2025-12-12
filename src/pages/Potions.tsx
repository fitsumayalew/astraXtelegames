import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCoins } from "@/contexts/CoinContext";
import GameHeader from "@/components/shared/GameHeader";
import GameStartScreen from "@/components/shared/GameStartScreen";
import { Sparkles, Heart, Coins, Trophy, FlaskConical, Timer, Target } from "lucide-react";
import potionsHero from "@/assets/potions-hero.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Potions = () => {
  const navigate = useNavigate();
  const { totalCoins } = useCoins();
  const [gameStarted, setGameStarted] = useState(false);

  const instructions = [
    {
      icon: FlaskConical,
      title: "Mix Ingredients",
      description: "Combine the right potions to create powerful elixirs",
    },
    {
      icon: Timer,
      title: "Time Challenge",
      description: "Complete your potions before the time runs out",
    },
    {
      icon: Target,
      title: "Match Colors",
      description: "Match potion colors to create magical combinations",
    },
    {
      icon: Coins,
      title: "Earn Rewards",
      description: "Get coins for each successful potion creation",
    },
    {
      icon: Heart,
      title: "Limited Chances",
      description: "Be careful - failed potions cost you lives",
    },
    {
      icon: Trophy,
      title: "Master Alchemist",
      description: "Become the greatest potion maker in Astra",
    },
  ];

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-deep via-primary/20 to-purple-deep">
        <GameHeader coins={totalCoins} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="text-center">
            <Sparkles className="w-16 h-16 text-yellow-bright mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold text-white mb-4">Coming Soon!</h1>
            <p className="text-white/80 mb-6">The potion lab is being prepared...</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-purple-deep"
            >
              Back to Games
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-emerald-900/20 relative overflow-hidden">
      {/* Mystical particles effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-20 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-48 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <GameHeader coins={totalCoins} />
      
      <div className="px-4 py-6 max-w-4xl mx-auto relative z-10">
        <GameStartScreen
          title="Astra Potions"
          description="Mix magical ingredients and create powerful potions"
          icon={FlaskConical}
          heroImage={potionsHero}
          instructions={instructions}
          onStartGame={handleStartGame}
          startButtonText="Coming Soon"
          startButtonDisabled={true}
          additionalContent={
            <div className="text-center -mt-4">
              <p className="text-muted-foreground mb-4">
                The potion lab is being prepared for your magical journey!
              </p>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
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

export default Potions;
