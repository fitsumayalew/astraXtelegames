import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    className?: string;
    startDelay?: number;
    soundSrc?: string;
}

const TypewriterText = ({
    text,
    speed = 25,
    onComplete,
    className = "",
    startDelay = 0,
    soundSrc = '/media/quiz/typing.webm'
}: TypewriterTextProps) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(soundSrc);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;

        let timeoutId: NodeJS.Timeout;

        const startTyping = () => {
            setDisplayedText("");
            if (text.length === 0) {
                setIsTyping(false);
                if (onComplete) onComplete();
                return;
            }

            setIsTyping(true);
            audioRef.current?.play().catch(() => { });

            let i = 0;
            const step = () => {
                setDisplayedText(text.slice(0, i + 1));
                i++;
                if (i < text.length) {
                    timeoutId = setTimeout(step, speed);
                } else {
                    setIsTyping(false);
                    if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                    }
                    if (onComplete) onComplete();
                }
            };

            // kick off immediately to avoid any character gaps
            step();
        };

        if (startDelay > 0) {
            timeoutId = setTimeout(startTyping, startDelay);
        } else {
            startTyping();
        }

        return () => {
            clearTimeout(timeoutId);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current = null;
            }
        };
    }, [text, speed, startDelay, onComplete, soundSrc]);

    return (
        <span className={className}>
            {displayedText}
            {isTyping && <span className="animate-pulse inline-block ml-0.5">|</span>}
        </span>
    );
};

export default TypewriterText;
