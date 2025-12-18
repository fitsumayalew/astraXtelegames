interface WordleBackgroundProps {
    gameStarted: boolean;
    showGameOver: boolean;
}

const WordleBackground = ({ gameStarted, showGameOver }: WordleBackgroundProps) => {
    // Background color logic:
    // - Playing (gameStarted && !showGameOver): Soft Purple (bg-purple-300)
    // - Home OR Game Over: Sky Blue (bg-sky-300)
    const isPlaying = gameStarted && !showGameOver;
    const bgColor = isPlaying ? "bg-purple-300" : "bg-sky-300";

    return (
        <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-700 ${bgColor}`}>
            {/* Home Image: bg-snap.png (Only when not started) */}
            <div
                className={`absolute inset-0 bg-no-repeat bg-center bg-cover transition-opacity duration-700 ${!gameStarted ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: "url('/images/bg-snap.png')" }}
            />

            {/* Game Pattern Image: bgpattern-sheet0.png (Playing AND Game Over) */}
            <div
                className={`absolute inset-0 bg-repeat transition-opacity duration-700 ${gameStarted ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: "url('/images/bgpattern-sheet0.png')", backgroundSize: '400px' }}
            />
        </div>
    );
};

export default WordleBackground;
