import React, { useState, useEffect, useRef } from 'react';
import StartGame from './game/main';
import useGameStore from './store';
import Terminal from './components/Terminal';
import { emitElementDrop, EventBus } from './game/events';

const App: React.FC = () => {
    const { isGameStarted, setGameStarted, stolenElements, addStolenElement, resetStolenElements, setTerminalOpen } = useGameStore();
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
            <nav className="navbar">
                <div className="logo">ANDRE.DEV</div>
                <ul className="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>

            <section id="home" className="hero-section">
                <h1>{texts.header}</h1>
                <p className="subtitle">{texts.subtitle}</p>
                
                <div 
                    id="game-box" 
                    ref={gameBoxRef} 
                    onClick={handlePlayClick}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const elementId = e.dataTransfer.getData('elementId');
                        const text = e.dataTransfer.getData('text/plain');
                        
                        if (text === 'contact-input' && showPhaser && gameBoxRef.current) {
                            const rect = gameBoxRef.current.getBoundingClientRect();
                            setInputDropPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                            setIsInputStolen(true);
                            return;
                        }

                        if (text === 'avatar' && showPhaser && gameBoxRef.current) {
                            const rect = gameBoxRef.current.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            addStolenElement('avatar');
                            EventBus.dispatchEvent(new CustomEvent('avatarDropped', { detail: { x, y } }));
                            return;
                        }

                        if (elementId && gameBoxRef.current && showPhaser) {
                            const rect = gameBoxRef.current.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            addStolenElement(elementId);
                            emitElementDrop({ id: elementId, text, x, y });
                        }
                    }}
                >
                    {!showPhaser && (
                        <span id="play-text">
                            {isHorrorMode ? (
                                <span style={{ color: '#ff0000', animation: 'glitch-anim 0.2s infinite', display: 'inline-block' }}>DO NOT PLAY</span>
                            ) : (
                                <>PLAY GA<span id="letter-m">M</span>E</>
                            )}
                        </span>
                    )}
                    <div 
                        id="game-container" 
                        style={{ display: showPhaser ? 'block' : 'none', width: '100%', height: '100%' }}
                        onDragOver={(e) => e.preventDefault()}
                    ></div>
                    {inputDropPos && showPhaser && (
                        <input 
                            type="text" 
                            placeholder="ENTER PASSCODE"
                            style={{
                                position: 'absolute',
                                left: inputDropPos.x,
                                top: inputDropPos.y,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                                background: '#000',
                                color: '#ff0000',
                                border: '2px solid #ff0000',
                                padding: '10px',
                                fontFamily: 'monospace',
                                outline: 'none'
                            }}
                            onChange={(e) => {
                                if (e.target.value === '0451') {
                                    EventBus.dispatchEvent(new CustomEvent('unlockVault'));
                                    setInputDropPos(null);
                                }
                            }}
                            autoFocus
                        />
                    )}
                </div>
            </section>

            <section id="about" className="about-section">
                <h2>About {stolenElements.includes('kunci-t') ? (
                    <span className="scar" style={{ display: 'inline-block', width: '24px', height: '36px', border: '1px dashed red', backgroundColor: 'rgba(255,0,0,0.1)', verticalAlign: 'bottom' }}></span>
                ) : (
                    <span 
                        id="kunci-t" 
                        draggable="true" 
                        title="Coba tarik gua!"
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', 'T');
                            e.dataTransfer.setData('elementId', 'kunci-t');
                        }}
                    >T</span>
                )}his Concept</h2>
                
                <div style={{ marginBottom: '40px' }}>
                    {!stolenElements.includes('avatar') ? (
                        <div style={{ display: 'inline-block', position: 'relative' }}>
                            {isHorrorMode && (
                                <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', color: '#ff0000', fontWeight: 'bold', width: 'max-content' }}>[HEAVY MASS]</span>
                            )}
                            <img 
                                id="avatar" 
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Andre" 
                                alt="Avatar"
                                style={{ 
                                    width: '100px', height: '100px', borderRadius: '50%', 
                                    border: isHorrorMode ? '3px solid #ff0000' : '3px solid #ddd',
                                    cursor: isHorrorMode ? 'grab' : 'auto'
                                }}
                                draggable={isHorrorMode}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('text/plain', 'avatar');
                                    e.dataTransfer.setData('elementId', 'avatar');
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '2px dashed #ff0000', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff0000', fontSize: '12px' }}>MISSING</div>
                    )}
                </div>

                <div className="content-grid">
                    <div className="card">
                        <h3>{texts.card1}</h3>
                        <p>No clutter, just the essentials.</p>
                    </div>
                    <div className="card">
                        <h3>{texts.card2}</h3>
                        <p>Looks good on any screen.</p>
                    </div>
                    <div className="card">
                        <h3>{texts.card3}</h3>
                        <p>React and Phaser working together.</p>
                    </div>
                </div>
            </section>

            <section id="contact" className="section contact-section">
                <h2>Contact</h2>
                <div className="contact-form">
                    {!isInputStolen ? (
                        <div 
                            draggable={isHorrorMode}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', 'contact-input');
                            }}
                            style={{ 
                                cursor: isHorrorMode ? 'grab' : 'auto', 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: isHorrorMode ? '#330000' : 'transparent',
                                marginBottom: '1rem',
                                padding: isHorrorMode ? '5px' : '0'
                            }}
                        >
                            {isHorrorMode && (
                                <span style={{ marginRight: '10px', fontSize: '10px', color: '#ff0000', fontWeight: 'bold' }}>[DRAG ME]</span>
                            )}
                            <input type="email" placeholder="Your Email" style={{ pointerEvents: isHorrorMode ? 'none' : 'auto', flex: 1 }} />
                        </div>
                    ) : (
                        <div style={{ height: '40px', border: '1px dashed #ff0000', marginBottom: '1rem' }}></div>
                    )}
                    <textarea placeholder="Your Message"></textarea>
                    <button className="btn">Send Message</button>
                </div>
            </section>

            <footer className="footer">
                <p>&copy; 2026 Andre.dev. All rights reserved.</p>
                {isHorrorMode && (
                    <p style={{ color: '#ff0000', fontFamily: 'monospace', fontSize: '12px', marginTop: '10px', letterSpacing: '2px', fontWeight: 'bold' }}>
                        ERR_VAULT_LOCKED // PASSCODE: 0451
                    </p>
                )}
                <button 
                    onClick={() => setTerminalOpen(true)}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.5)',
                        padding: '4px 8px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        marginTop: '10px'
                    }}
                >
                    &gt;_ DEV CONSOLE
                </button>
            </footer>

            <Terminal />
        </div>
    );
};

export default App;
