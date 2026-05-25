import React from 'react';
import useGameStore from '../store';
import { emitElementDrop, EventBus } from '../game/events';

interface HeroSectionProps {
    texts: {
        header: string;
        subtitle: string;
    };
    showPhaser: boolean;
    isHorrorMode: boolean;
    gameBoxRef: React.RefObject<HTMLDivElement | null>;
    handlePlayClick: () => void;
    inputDropPos: { x: number; y: number } | null;
    setInputDropPos: (pos: { x: number; y: number } | null) => void;
    setIsInputStolen: (val: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
    texts,
    showPhaser,
    isHorrorMode,
    gameBoxRef,
    handlePlayClick,
    inputDropPos,
    setInputDropPos,
    setIsInputStolen,
}) => {
    const { addStolenElement } = useGameStore();

    return (
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
    );
};

export default HeroSection;
