import React from 'react';

interface ContactSectionProps {
    isHorrorMode: boolean;
    isInputStolen: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({ isHorrorMode, isInputStolen }) => {
    return (
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
    );
};

export default ContactSection;
