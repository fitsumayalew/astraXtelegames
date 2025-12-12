import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCoins } from "@/contexts/CoinContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import AnimatedCoin from "@/components/ui/animated-coin";

const DemoCoins = () => {
  const { totalCoins, addCoins } = useCoins();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddCoins = async (amount: number) => {
    const result = await addCoins(amount);
    toast({
      title: result !== null ? "Coins Added!" : "Failed to add coins",
      description:
        result !== null
          ? `Added ${amount} coins to your balance`
          : "Please try again. If this keeps happening, check the backend.",
      variant: result !== null ? "default" : "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="w-full bg-card shadow-[var(--shadow-card)] rounded-2xl p-6 mb-8 animate-slide-in">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Demo Coins
              </h1>
              <p className="text-muted-foreground text-sm">
                Add or remove coins for testing
              </p>
            </div>
            
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="icon"
              className="rounded-full border-2 border-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <Card className="bg-card/95 backdrop-blur-sm shadow-[var(--shadow-card)] mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-4">Current Balance</CardTitle>
            <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full px-8 py-4 mx-auto w-fit">
              <AnimatedCoin size={40} />
              <span className="font-bold text-4xl text-foreground">{totalCoins}</span>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          <Card className="bg-card/95 backdrop-blur-sm shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Add Coins
              </CardTitle>
              <CardDescription>Increase your coin balance</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[10, 50, 100, 500].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => handleAddCoins(amount)}
                  variant="default"
                  className="w-full"
                >
                  +{amount}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoCoins;
