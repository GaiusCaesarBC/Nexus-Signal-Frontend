// src/components/KeyboardShortcutsHelp.js - Keyboard shortcuts help modal
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { X, Keyboard } from 'lucide-react';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideIn = keyframes`
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${fadeIn} 0.15s ease-out;
`;

const Modal = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    animation: ${slideIn} 0.2s ease-out;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
`;

const Title = styled.h2`
    font-size: 1.25rem;
    font-weight: 700;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
`;

const CloseButton = styled.button`
    background: rgba(100, 116, 139, 0.2);
    border: none;
    border-radius: 8px;
    padding: 0.5rem;
    cursor: pointer;
    color: #94a3b8;
    transition: all 0.2s;

    &:hover {
        background: rgba(100, 116, 139, 0.3);
        color: #e0e6ed;
    }
`;

const ShortcutsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

const ShortcutRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(100, 116, 139, 0.1);
    border-radius: 8px;
`;

const ShortcutDescription = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
`;

const KeyBadge = styled.kbd`
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(100, 116, 139, 0.4);
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
    font-family: monospace;
    font-size: 0.85rem;
    color: #00adef;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Footer = styled.div`
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
    text-align: center;
    color: #64748b;
    font-size: 0.8rem;
`;

const shortcuts = [
    { key: '/', description: 'Focus search bar' },
    { key: 'Esc', description: 'Close modals & dropdowns' },
    { key: '?', description: 'Show this help' },
];

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>
                        <Keyboard size={20} />
                        Keyboard Shortcuts
                    </Title>
                    <CloseButton onClick={onClose}>
                        <X size={18} />
                    </CloseButton>
                </Header>

                <ShortcutsList>
                    {shortcuts.map(({ key, description }) => (
                        <ShortcutRow key={key}>
                            <ShortcutDescription>{description}</ShortcutDescription>
                            <KeyBadge>{key}</KeyBadge>
                        </ShortcutRow>
                    ))}
                </ShortcutsList>

                <Footer>
                    Press <KeyBadge style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>Esc</KeyBadge> to close
                </Footer>
            </Modal>
        </Overlay>
    );
};

export default KeyboardShortcutsHelp;
