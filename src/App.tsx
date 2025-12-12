import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CoinProvider } from "./contexts/CoinContext";
import GameSelector from "./pages/GameSelector";
import Index from "./pages/Index";
import Wordle from "./pages/Wordle";
import Sudoku from "./pages/Sudoku";
import Bubbles from "./pages/Bubbles";
import Potions from "./pages/Potions";
import DemoCoins from "./pages/DemoCoins";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CoinProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GameSelector />} />
            <Route path="/quiz" element={<Index />} />
            <Route path="/wordle" element={<Wordle />} />
            <Route path="/sudoku" element={<Sudoku />} />
            <Route path="/bubbles" element={<Bubbles />} />
            <Route path="/potions" element={<Potions />} />
            <Route path="/demo-coins" element={<DemoCoins />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CoinProvider>
  </QueryClientProvider>
);

export default App;
