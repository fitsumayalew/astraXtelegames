import { Gamepad2, Trophy, Puzzle, Zap, Plus, Grid3x3, CircleDot } from "lucide-react";
import GameCard from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { useCoins } from "@/contexts/CoinContext";
import { useNavigate } from "react-router-dom";
import AnimatedCoin from "@/components/ui/animated-coin";
import popQuizLogo from "@/assets/pop-quiz-logo.png";
import sudokuHero from "@/assets/sudoku-hero.png";
import bubblesHero from "@/assets/bubbles-hero.png";
import potionsHero from "@/assets/potions-hero.png";
import wordleHero from "@/assets/wordle-hero.png";
import astraLogo from "@/assets/astra-logo.png";

const GameSelector = () => {
  const { totalCoins } = useCoins();
  const navigate = useNavigate();

  const games = [
    {
      title: "Pop Quiz",
      description: "Test your knowledge with timed questions",
      icon: popQuizLogo,
      route: "/quiz",
      cost: 100,
      comingSoon: false,
    },
    {
      title: "Astra Wordle",
      description: "Guess the 5-letter word in 6 tries",
      icon: wordleHero,
      route: "/wordle",
      cost: 20,
      comingSoon: false,
    },
    {
      title: "Astra Sudoku",
      description: "Fill the grid with numbers 1-9",
      icon: sudokuHero,
      route: "/sudoku",
      cost: 0,
      comingSoon: false,
    },
    {
      title: "Astra Bubbles",
      description: "Pop colorful bubbles and clear the board",
      icon: bubblesHero,
      route: "/bubbles",
      cost: 15,
      comingSoon: true,
    },
    {
      title: "Astra Potions",
      description: "Mix magical potions and master alchemy",
      icon: potionsHero,
      route: "/potions",
      cost: 25,
      comingSoon: true,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden py-8 px-4">
      {/* Full-page background */}
      <div
        className="absolute inset-0 -z-10 bg-center bg-cover"
        style={{ backgroundImage: 'url(/image/whole-bg.png)' }}
      />

      {/* Page content */}
      <div className="max-w-6xl mx-auto">
        <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-sm shadow-[var(--shadow-card)] rounded-none md:rounded-2xl p-3 md:p-6 mb-4 md:mb-8 animate-slide-in">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <div className="flex-1 min-w-0 flex items-center gap-3 md:gap-4">
              <img 
                src={astraLogo} 
                alt="Astra" 
                className="h-10 md:h-14 lg:h-16 w-auto"
              />
              <div>
                <h1 className="text-xl md:text-3xl lg:text-5xl font-bold text-foreground mb-0 md:mb-1 truncate">
                  Games
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm lg:text-base hidden sm:block">
                  Choose your game and earn coins!
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-3 md:px-4 lg:px-6 py-1.5 md:py-2 lg:py-3">
                <AnimatedCoin size={28} className="md:w-5 md:h-5 lg:w-7 lg:h-7" />
                <span className="font-bold text-base md:text-xl lg:text-2xl text-foreground">{totalCoins}</span>
              </div>
              
              <Button
                onClick={() => navigate("/demo-coins")}
                variant="outline"
                size="sm"
                className="gap-1 md:gap-2 text-xs md:text-sm px-2 md:px-4"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Add Coins</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {games.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>

        <div className="mt-12 bg-card/50 backdrop-blur-sm rounded-2xl p-6 text-center">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Earn More Coins</h2>
          <p className="text-muted-foreground">
            Play games to earn coins and unlock new features!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameSelector;
