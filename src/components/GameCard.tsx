import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCoins } from "@/contexts/CoinContext";
import { useToast } from "@/hooks/use-toast";
import AnimatedCoin from "./ui/animated-coin";

interface GameCardProps {
  title: string;
  description: string;
  icon: LucideIcon | string;
  route: string;
  cost: number;
  comingSoon?: boolean;
}

const GameCard = ({ title, description, icon, route, cost, comingSoon }: GameCardProps) => {
  const navigate = useNavigate();
  const { totalCoins } = useCoins();
  const { toast } = useToast();

  const handlePlay = () => {
    navigate(route);
  };

  const canAfford = totalCoins >= cost || cost === 0;

  return (
    <Card 
      className="relative overflow-hidden group cursor-pointer shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all hover:scale-105 h-80"
      onClick={handlePlay}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <Badge className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
          Coming Soon
        </Badge>
      )}
      
      {/* Background Image/Icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
        {typeof icon === 'string' ? (
          <img 
            src={icon} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        ) : (
          (() => {
            const Icon = icon;
            return (
              <div className="p-8 rounded-full bg-gradient-to-br from-primary to-secondary">
                <Icon className="w-24 h-24 text-primary-foreground" />
              </div>
            );
          })()
        )}
      </div>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6">
        <CardTitle className="text-2xl mb-3">{title}</CardTitle>
        <CardDescription className="text-base mb-4 text-center">{description}</CardDescription>
        
        {!comingSoon && (
          <div className="flex items-center justify-center gap-2 mb-6 text-sm font-semibold">
            <AnimatedCoin size={16} />
            <span className={canAfford ? "text-foreground" : "text-destructive"}>
              {cost === 0 ? "Free" : `${cost} coins`}
            </span>
          </div>
        )}

        <Button
          className="w-full"
          variant={comingSoon ? "outline" : canAfford ? "default" : "destructive"}
          disabled={!comingSoon && !canAfford}
        >
          {comingSoon ? "View Details" : canAfford ? "Play Now" : "Not Enough Coins"}
        </Button>
      </div>
    </Card>
  );
};

export default GameCard;
