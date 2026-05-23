import React, { useState, useRef, useEffect } from 'react';
import useGameStore from '../store';
import { EventBus } from '../game/events';

const Terminal: React.FC = () => {
    const { isTerminalOpen, setTerminalOpen, stolenElements } = useGameStore();
    const [history, setHistory] = useState<React.ReactNode[]>([
        'Project DOM-Breaker OS v1.0.0', 
        'Type "help" for a list of commands.',
        'WARNING: Unknown "firewall" node detected blocking progress.'
    ]);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isTerminalOpen && inputRef.current) {
            inputRef.current.focus();
            EventBus.dispatchEvent(new CustomEvent('terminalToggle', { detail: true }));
        }
        return () => {
            EventBus.dispatchEvent(new CustomEvent('terminalToggle', { detail: false }));
        };
    }, [isTerminalOpen]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history]);

    const handleCommand = (cmd: string) => {
        const output: React.ReactNode[] = [...history, `user@dom:~$ ${cmd}`];
        
        switch (cmd.toLowerCase().trim()) {
            case 'help':
                output.push('Available commands: help, clear, rm [target], reset --hard');
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'rm firewall':
                if (stolenElements.includes('kunci-t')) {
                    output.push(<span style={{ color: '#00ff00' }}>Success: target [firewall] destroyed.</span>);
                    EventBus.dispatchEvent(new CustomEvent('destroyFirewall'));
                } else {
                    output.push(<span style={{ color: '#ff0000' }}>Error: Insufficient privileges. (Hint: find the missing key)</span>);
                }
                break;
            case 'reset --hard':
                output.push(<span style={{ color: '#00ffff' }}>Wiping system memory and rebooting...</span>);
                localStorage.removeItem('horrorMode');
                setTimeout(() => window.location.reload(), 1000);
                break;
            default:
                if (cmd.trim() !== '') {
                    output.push(`bash: ${cmd}: command not found`);
                }
        }
        setHistory(output);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        }
    };

    if (!isTerminalOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            height: '250px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid #33ff33',
            borderRadius: '4px',
            color: '#33ff33',
            fontFamily: '"Courier New", Courier, monospace',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            boxShadow: '0 0 15px rgba(51, 255, 51, 0.2)',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #33ff33', paddingBottom: '5px', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>TERMINAL</span>
                <span 
                    style={{ fontSize: '12px', cursor: 'pointer' }}
                    onClick={() => setTerminalOpen(false)}
                >
                    [X]
                </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', fontSize: '14px', lineHeight: '1.4' }} onClick={() => inputRef.current?.focus()}>
                {history.map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
                <div style={{ display: 'flex' }}>
                    <span style={{ marginRight: '8px' }}>user@dom:~$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            handleKeyDown(e);
                        }}
                        onKeyUp={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                        }}
                        onKeyPress={(e) => {
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#33ff33',
                            fontFamily: 'inherit',
                            fontSize: 'inherit',
                            flex: 1,
                            outline: 'none'
                        }}
                    />
                </div>
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default Terminal;
