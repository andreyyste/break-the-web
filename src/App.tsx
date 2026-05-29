import React, { useState, useEffect, useRef } from 'react';
import StartGame from './game/main';
import useGameStore from './store';
import Terminal from './components/Terminal';
import { EventBus } from './game/events';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

const App: React.FC = () => {
    const { isGameStarted, setGameStarted, resetStolenElements } = useGameStore();
    const gameBoxRef = useRef<HTMLDivElement>(null);
    const [showPhaser, setShowPhaser] = useState(false);
    const [isGlitching, setIsGlitching] = useState(false);
    const [hasCrashed, setHasCrashed] = useState(false);
    const [isHorrorMode, setIsHorrorMode] = useState(false);
    const [isInputStolen, setIsInputStolen] = useState(false);
    const [inputDropPos, setInputDropPos] = useState<{x: number, y: number} | null>(null);
    
    const initialTexts = {
        header: 'Welcome Project',
        subtitle: 'Web Interactivity',
        card1: 'Clean Design',
        card2: 'Responsive Layout',
        card3: 'Dynamic Elements'
    };
    const horrorTexts = {
        header: 'Y O U  B R O K E  I T',
        subtitle: 'THERE IS NO ESCAPE',
        card1: 'Corrupted Design',
        card2: 'Fatal Error',
        card3: 'System Destroyed'
    };
    const [texts, setTexts] = useState(initialTexts);

    const handlePlayClick = () => {
        if (isGameStarted) return;
        setGameStarted(true);

        if (gameBoxRef.current) {
            gameBoxRef.current.classList.add('expanded');
            setTimeout(() => {
                gameBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }

        setTimeout(() => {
            const playText = document.getElementById('play-text');
            const letterM = document.getElementById('letter-m');
            if (playText) playText.classList.add('fade-out-text');
            if (letterM) {
                letterM.style.color = '#00ff00';
                letterM.classList.add('falling');
            }
        }, 1200);

        setTimeout(() => {
            setShowPhaser(true);
        }, 2800);
    };

    const gameInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (localStorage.getItem('horrorMode') === 'true') {
            setIsHorrorMode(true);
            setTexts(horrorTexts);
            (window as any).isHorrorMode = true;
        }
    }, []);

    useEffect(() => {
        const handleReset = () => {
            resetStolenElements();
            setTexts(isHorrorMode ? horrorTexts : initialTexts);
            setIsInputStolen(false);
            setInputDropPos(null);
        };
        EventBus.addEventListener('resetReactState', handleReset as EventListener);

        let corruptionInterval: any;
        const handleStartCorruption = () => {
            let currentTexts = { ...(isHorrorMode ? horrorTexts : initialTexts) };
            const keys = Object.keys(currentTexts) as (keyof typeof initialTexts)[];
            let idx = 0;
            
            corruptionInterval = setInterval(() => {
                if (idx >= keys.length) {
                    clearInterval(corruptionInterval);
                    return;
                }
                const key = keys[idx];
                let str = currentTexts[key];
                
                const numToSteal = Math.floor(Math.random() * 3) + 2; // 2 to 4 letters
                const lettersToSpawn: string[] = [];
                const strArr = str.split('');
                
                const validIndices = [];
                for(let i = 0; i < strArr.length; i++) {
                    if (strArr[i] !== ' ' && strArr[i] !== '\u00A0') validIndices.push(i);
                }
                
                validIndices.sort(() => Math.random() - 0.5);
                const stealIndices = validIndices.slice(0, numToSteal);
                
                stealIndices.forEach(i => {
                    lettersToSpawn.push(strArr[i]);
                    strArr[i] = '\u00A0'; // replace with non-breaking space to preserve width
                });
                
                currentTexts[key] = strArr.join('');
                setTexts({ ...currentTexts });
                
                EventBus.dispatchEvent(new CustomEvent('spawnDebris', { detail: { letters: lettersToSpawn } }));
                idx++;
            }, 3000); // 3 seconds delay for even easier dodging
        };
        EventBus.addEventListener('startCorruption', handleStartCorruption as EventListener);

        const handleSystemCrash = () => {
            setIsGlitching(true);
            setTimeout(() => {
                localStorage.setItem('horrorMode', 'true');
                setHasCrashed(true);
            }, 7000);
        };


        EventBus.addEventListener('systemCrash', handleSystemCrash as EventListener);

        return () => {
            EventBus.removeEventListener('resetReactState', handleReset as EventListener);
            EventBus.removeEventListener('startCorruption', handleStartCorruption as EventListener);
            EventBus.removeEventListener('systemCrash', handleSystemCrash as EventListener);
            if (corruptionInterval) clearInterval(corruptionInterval);
        };
    }, [resetStolenElements, isHorrorMode, showPhaser]);

    useEffect(() => {
        if (showPhaser && !gameInstanceRef.current) {
            gameInstanceRef.current = StartGame('game-container');
        }
        return () => {
            // Avoid destroying game instance on every HMR or re-render
        };
    }, [showPhaser]);

    if (hasCrashed) {
        return (
            <div className="kernel-panic">
                <h1>KERNEL PANIC</h1>
                <p>FATAL ERROR: DOM ENGINE DESTROYED</p>
                <p style={{ marginTop: '20px', fontSize: '16px', color: '#555' }}>[ Please refresh your browser to reboot ]</p>
            </div>
        );
    }

    return (
        <div className={`${isGlitching ? 'glitch-mode' : ''} ${isHorrorMode ? 'horror-theme' : ''}`}>
            <Navbar />
            <HeroSection 
                texts={{ header: texts.header, subtitle: texts.subtitle }}
                showPhaser={showPhaser}
                isHorrorMode={isHorrorMode}
                gameBoxRef={gameBoxRef}
                handlePlayClick={handlePlayClick}
                inputDropPos={inputDropPos}
                setInputDropPos={setInputDropPos}
                setIsInputStolen={setIsInputStolen}
            />
            <AboutSection 
                texts={{ card1: texts.card1, card2: texts.card2, card3: texts.card3 }}
                isHorrorMode={isHorrorMode}
            />
            <ContactSection 
                isHorrorMode={isHorrorMode}
                isInputStolen={isInputStolen}
            />
            <Footer isHorrorMode={isHorrorMode} />
            <Terminal />
        </div>
    );
};

export default App;
