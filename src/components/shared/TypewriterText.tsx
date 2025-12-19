import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
    startDelay?: number;
}

const TypewriterText = ({
    text,
    speed = 25,
    onComplete,
    className = "",
    startDelay = 0
}: TypewriterTextProps) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio
        audioRef.current = new Audio('/media/quiz/typing.webm');
        audioRef.current.volume = 0.3;

        let timeoutId: NodeJS.Timeout;
        let intervalId: NodeJS.Timeout;

        const startTyping = () => {
            setDisplayedText("");
            setIsTyping(true);

            // Play sound once when starting (similar to QuestionCard implementation)
            audioRef.current?.play().catch(() => { });

            let i = 0;
            intervalId = setInterval(() => {
                if (i < text.length) {
                    setDisplayedText((prev) => prev + text.charAt(i));
                    i++;
                } else {
                    setIsTyping(false);
                    clearInterval(intervalId);
                    if (onComplete) onComplete();
                }
            }, speed);
        };

        if (startDelay > 0) {
            timeoutId = setTimeout(startTyping, startDelay);
        } else {
            startTyping();
        }

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [text, speed, startDelay, onComplete]);

    return (
        <span className={className}>
            {displayedText}
            {isTyping && <span className="animate-pulse inline-block ml-0.5">|</span>}
        </span>
    );
};

export default TypewriterText;
