// src/hooks/useKeyboardShortcuts.js - Global keyboard shortcuts
import { useEffect, useState, useCallback } from 'react';

export const useKeyboardShortcuts = () => {
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

    const handleKeyDown = useCallback((e) => {
        // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable
        const target = e.target;
        const isInput = target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.isContentEditable;

        // Esc always works - close modals/dropdowns
        if (e.key === 'Escape') {
            setShowShortcutsHelp(false);
            // Dispatch custom event for other components to listen to
            window.dispatchEvent(new CustomEvent('nexus:close-modals'));
            return;
        }

        // Skip other shortcuts if in input
        if (isInput) return;

        // "/" - Focus search bar
        if (e.key === '/') {
            e.preventDefault();
            const searchInput = document.querySelector('[data-search-input]');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // "?" - Show shortcuts help
        if (e.key === '?' && e.shiftKey) {
            e.preventDefault();
            setShowShortcutsHelp(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return { showShortcutsHelp, setShowShortcutsHelp };
};

export default useKeyboardShortcuts;
