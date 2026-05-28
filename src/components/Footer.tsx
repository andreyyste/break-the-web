import React from 'react';
import useGameStore from '../store';

interface FooterProps {
    isHorrorMode: boolean;
}

const Footer: React.FC<FooterProps> = ({ isHorrorMode }) => {
    const { setTerminalOpen } = useGameStore();

    return (
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
    );
};

export default Footer;
