import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { LucideIcon, Play } from "lucide-react";
import { ReactNode } from "react";

interface GameStartScreenProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  heroImage?: string;
  instructions: Array<{
    icon: LucideIcon;
    title: string;
    description: ReactNode;
  }>;
  onStartGame: () => void;
  additionalContent?: ReactNode;
  startButtonText?: string;
  startButtonDisabled?: boolean;
  startButtonIcon?: ReactNode;
  startButtonIconOnly?: boolean;
  instructionLayout?: "carousel" | "list";
  hideHero?: boolean;
  theme?: {
    titleColor?: string;
    textColor?: string;
    accentColor?: string;
  };
  /**
   * Optional transparency for the hero background when present; 1 means opaque.
   */
  backgroundOpacity?: number;
  /**
   * When true, the background image spans the entire viewport instead of just the component.
   */
  fullScreenBackground?: boolean;
  /**
   * Use a shorter min-height to avoid stacking with page headers.
   */
  compactHeight?: boolean;
}

const GameStartScreen = ({
  title,
  description,
  icon: Icon,
  heroImage,
  instructions,
  onStartGame,
  additionalContent,
  startButtonText = "Start Game",
  startButtonDisabled = false,
  startButtonIcon = null,
  startButtonIconOnly = false,
  instructionLayout = "carousel",
  hideHero = false,
  backgroundOpacity = 1,
  fullScreenBackground = false,
  compactHeight = false,
}: GameStartScreenProps) => {
  // Show background image on the first page (no instructions/additional content)
  const showBgImage = instructions.length === 0 && !additionalContent;

  const heightClass = compactHeight
    ? "min-h-[calc(100vh-10rem)] md:min-h-[calc(100vh-12rem)]"
    : "min-h-screen";

  const buttonContent = startButtonIconOnly ? (
    <>
      {startButtonIcon ?? <Play className="h-14 w-14 animate-pulse-icon" />}
      <span className="sr-only">{startButtonText}</span>
    </>
  ) : (
    startButtonText
  );

  const buttonClasses = startButtonIconOnly
    ? "h-20 w-20 rounded-full p-0 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 border-2 border-white/80"
    : "w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 border-2 border-white/80";

  const renderInstructions = () => {
    if (!instructions.length) return null;

    if (instructionLayout === "list") {
      return (
        <div className="flex-1 flex items-center justify-center overflow-hidden py-2">
          <div className="w-full max-w-md space-y-3">
            {instructions.map((instruction, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-4 shadow-lg border border-border flex items-start gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md flex-shrink-0">
                  <instruction.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">{instruction.title}</h3>
                  <div className="text-sm text-muted-foreground leading-relaxed">{instruction.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center overflow-hidden py-2">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
          className="w-full max-w-md"
        >
          <CarouselContent>
            {instructions.map((instruction, index) => (
              <CarouselItem key={index}>
                <div className="bg-card rounded-2xl p-6 shadow-lg mx-2 border border-border">
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                      <instruction.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-foreground">
                        {instruction.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  };

  return (
    <div className={`${heightClass} flex flex-col p-4 animate-fade-in relative overflow-hidden`}>
      {showBgImage && (
        <div
          className={`${fullScreenBackground ? "fixed" : "absolute"} inset-0 z-0 bg-center bg-cover animate-wordle-bg pointer-events-none`}
          style={{ backgroundImage: `url(/image/wordle.png)`, opacity: backgroundOpacity }}
        ></div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center gap-6 relative z-10">
        {/* Hero Section */}
        {!hideHero && (
          <div className="text-center pb-2 -mx-4 md:mx-0">
            {heroImage ? (
              <img
                src={heroImage}
                alt={title}
                className="w-full md:w-80 md:h-80 lg:w-56 lg:h-56 h-auto mx-auto object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="w-32 h-32 mx-auto p-6 rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-xl">
                <Icon className="w-full h-full text-white" />
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {renderInstructions()}

        {additionalContent && (
          <div className="pb-3">
            {additionalContent}
          </div>
        )}
      </div>

      {/* Start Button */}
      <div className="pt-4 pb-6 flex justify-center relative z-10 mt-auto">
        <Button
          onClick={onStartGame}
          size="lg"
          disabled={startButtonDisabled}
          className={`${buttonClasses} border-4 border-yellow-400 animate-pulse-wordle-btn`}
        >
          <span className="flex items-center justify-center">{buttonContent}</span>
        </Button>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes wordleBgIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes wordleBgOut {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        .animate-wordle-bg {
          animation: wordleBgIn 1.2s cubic-bezier(.4,0,.2,1);
        }
        .wordle-bg-exit {
          animation: wordleBgOut 0.8s cubic-bezier(.4,0,.2,1);
        }
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 193, 7, 0.7); }
          50% { box-shadow: 0 0 16px 8px rgba(255, 193, 7, 0.4); }
        }
        .animate-pulse-wordle-btn {
          animation: pulseBtn 1.2s infinite;
        }
        @keyframes pulseIcon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-pulse-icon {
          animation: pulseIcon 1.2s infinite;
        }
      `}</style>
    </div>
  );
};

export default GameStartScreen;
