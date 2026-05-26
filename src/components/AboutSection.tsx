import React from 'react';
import useGameStore from '../store';

interface AboutSectionProps {
    texts: {
        card1: string;
        card2: string;
        card3: string;
    };
    isHorrorMode: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({ texts, isHorrorMode }) => {
    const { stolenElements } = useGameStore();

    return (
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
    );
};

export default AboutSection;
