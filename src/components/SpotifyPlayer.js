// client/src/components/SpotifyPlayer.js
//
// Minimal floating Spotify embed player. Sits in the bottom-left corner
// (opposite the AI chat widget). Persists across all pages — music keeps
// playing during navigation. Toggled open/closed via the exported
// useSpotifyPlayer() hook so the Navbar can trigger it from the
// Community dropdown.
//
// Uses Spotify's iframe embed API — no auth, no API keys, no premium
// requirement. Users get 30-second previews unless they're logged into
// Spotify in the same browser (then they get full tracks).
//
// To change the playlist, swap the PLAYLIST_ID below.

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Music, X, ChevronUp } from 'lucide-react';

// ─── Config ─────────────────────────────────────────────────
// Swap this ID to change the playlist. Find it in Spotify:
// right-click playlist → Share → Copy Spotify URI → grab the ID.
const PLAYLIST_ID = '37i9dQZF1DX4sWSpwq3LiO'; // "Peaceful Piano" — chill focus music
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

// ─── Context (toggle from anywhere) ─────────────────────────
const SpotifyContext = createContext(null);

export const SpotifyPlayerProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const toggle = useCallback(() => setOpen(o => !o), []);
    const value = useMemo(() => ({ open, toggle, setOpen }), [open, toggle]);

    return (
        <SpotifyContext.Provider value={value}>
            {children}
        </SpotifyContext.Provider>
    );
};

export const useSpotifyPlayer = () => {
    const ctx = useContext(SpotifyContext);
    return ctx || { open: false, toggle: () => {}, setOpen: () => {} };
};

// ─── Animations ─────────────────────────────────────────────
const slideUp = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ──────────────────────────────────────
const Wrap = styled.div`
    position: fixed;
    bottom: 95px;
    left: 20px;
    z-index: 9980;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    @media (max-width: 640px) {
        bottom: 12px;
        left: 12px;
    }
`;

const PlayerCard = styled.div`
    width: 320px;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid rgba(0, 173, 237, 0.30);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
    animation: ${slideUp} 0.3s ease-out;

    @media (max-width: 640px) {
        width: calc(100vw - 24px);
        max-width: 360px;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.85rem;
    background: rgba(0, 173, 237, 0.08);
    border-bottom: 1px solid rgba(0, 173, 237, 0.15);

    .left {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #00adef;
    }
`;

const CloseBtn = styled.button`
    width: 26px;
    height: 26px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;

    &:hover {
        background: rgba(30, 41, 59, 0.7);
        color: #f8fafc;
    }
`;

const IframeWrap = styled.div`
    width: 100%;
    height: 352px;

    iframe {
        border: none;
        width: 100%;
        height: 100%;
        border-radius: 0;
    }
`;

const ToggleBtn = styled.button`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    cursor: pointer;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(0, 173, 237, 0.35);
    color: #00adef;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    }
`;

// ─── Component ──────────────────────────────────────────────
const SpotifyPlayer = () => {
    const { open, toggle } = useSpotifyPlayer();

    return (
        <Wrap>
            {open && (
                <PlayerCard>
                    <Header>
                        <span className="left"><Music size={13} /> Trading Vibes</span>
                        <CloseBtn onClick={toggle} title="Close player"><X size={14} /></CloseBtn>
                    </Header>
                    <IframeWrap>
                        <iframe
                            title="Spotify Player"
                            src={EMBED_URL}
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                        />
                    </IframeWrap>
                </PlayerCard>
            )}

            {!open && (
                <ToggleBtn onClick={toggle} title="Open music player">
                    <Music size={20} />
                </ToggleBtn>
            )}
        </Wrap>
    );
};

export default SpotifyPlayer;
