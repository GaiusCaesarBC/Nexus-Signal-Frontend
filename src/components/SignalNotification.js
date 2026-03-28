// src/components/SignalNotification.js - Real-time Signal Alert Notifications
// Shows toast notifications when new AI signals are generated

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, X, Brain, Zap } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// ─── Animations ───────────────────────────────────────────
const slideIn = keyframes`
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
`;
const slideOut = keyframes`
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(120%); opacity: 0; }
`;
const glow = keyframes`
    0%, 100% { box-shadow: 0 0 16px rgba(0, 173, 237, 0.2); }
    50% { box-shadow: 0 0 32px rgba(0, 173, 237, 0.45); }
`;

// ─── Styled Components ────────────────────────────────────
const Container = styled.div`
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 9998;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 360px;
    pointer-events: none;
    @media (max-width: 480px) { right: 10px; left: 10px; max-width: none; }
`;

const Toast = styled.div`
    background: linear-gradient(135deg, rgba(12, 16, 32, 0.98), rgba(20, 25, 45, 0.98));
    border: 1px solid ${p => p.$long ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'};
    border-radius: 12px;
    padding: 0.85rem 1rem;
    animation: ${p => p.$exiting ? slideOut : slideIn} 0.3s ease-out forwards;
    cursor: pointer;
    pointer-events: auto;
    backdrop-filter: blur(12px);
    position: relative;
    overflow: hidden;

    ${p => p.$highConf && css`animation: ${slideIn} 0.3s ease-out, ${glow} 2.5s ease-in-out infinite;`}

    &:hover { transform: scale(1.02); }

    &::before {
        content: '';
        position: absolute; top: 0; left: 0;
        width: 3px; height: 100%;
        background: ${p => p.$long ? '#10b981' : '#ef4444'};
    }
`;

const ToastHeader = styled.div`
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 0.4rem;
`;

const ToastTitle = styled.div`
    display: flex; align-items: center; gap: 0.4rem;
    font-weight: 700; font-size: 0.8rem;
    color: #00adef;
`;

const CloseBtn = styled.button`
    background: rgba(255,255,255,0.08); border: none;
    color: #94a3b8; width: 22px; height: 22px;
    border-radius: 5px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s;
    &:hover { background: rgba(255,255,255,0.15); color: #fff; }
`;

const ToastBody = styled.div`
    display: flex; align-items: center; gap: 0.75rem;
`;

const IconBox = styled.div`
    width: 36px; height: 36px; border-radius: 8px;
    background: ${p => p.$long ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    display: flex; align-items: center; justify-content: center;
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
    flex-shrink: 0;
`;

const Content = styled.div`flex: 1; min-width: 0;`;

const SymbolRow = styled.div`
    display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.15rem;
`;

const Symbol = styled.span`font-weight: 800; font-size: 1.05rem; color: #e0e6ed;`;

const DirBadge = styled.span`
    font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 4px;
    background: ${p => p.$long ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};
    color: ${p => p.$long ? '#10b981' : '#ef4444'};
`;

const ConfBadge = styled.span`
    font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 4px;
    background: rgba(0,173,237,0.12); color: #00adef;
`;

const Desc = styled.div`font-size: 0.8rem; color: #94a3b8;`;

const ProgressBar = styled.div`
    position: absolute; bottom: 0; left: 0; height: 2px;
    background: ${p => p.$long ? '#10b981' : '#ef4444'};
    width: ${p => p.$progress}%;
    transition: width 0.1s linear;
`;

// ─── Component ────────────────────────────────────────────
const SignalNotification = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const seenIds = useRef(new Set());
    const initialized = useRef(false);

    const removeNotif = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.nid === id ? { ...n, exiting: true } : n));
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.nid !== id));
        }, 300);
    }, []);

    const addNotif = useCallback((signal) => {
        const nid = `sig-${signal._id}-${Date.now()}`;

        setNotifications(prev => {
            const next = [...prev];
            if (next.length >= 3) next.shift();
            return [...next, { ...signal, nid, progress: 100, exiting: false }];
        });

        // Auto-dismiss after 10 seconds with progress bar
        const duration = 10000;
        const tick = 100;
        let progress = 100;

        const iv = setInterval(() => {
            progress -= (tick / duration) * 100;
            setNotifications(prev => prev.map(n => n.nid === nid ? { ...n, progress } : n));
            if (progress <= 0) {
                clearInterval(iv);
                setNotifications(prev => prev.map(n => n.nid === nid ? { ...n, exiting: true } : n));
                setTimeout(() => setNotifications(prev => prev.filter(n => n.nid !== nid)), 300);
            }
        }, tick);

        return () => clearInterval(iv);
    }, []);

    // Poll for new signals
    useEffect(() => {
        if (!isAuthenticated) return;
        let mounted = true;

        const fetchSignals = async () => {
            try {
                const res = await fetch(`${API_URL}/predictions/recent?limit=10`);
                if (!res.ok) return;
                const data = await res.json();
                const signals = Array.isArray(data) ? data : [];

                if (!initialized.current) {
                    // First load — mark all as seen, don't notify
                    signals.forEach(s => seenIds.current.add(s._id));
                    initialized.current = true;
                    return;
                }

                // Check for new signals
                signals.forEach(s => {
                    if (seenIds.current.has(s._id)) return;
                    seenIds.current.add(s._id);

                    // Only notify for recent signals (< 5 minutes old)
                    const age = Date.now() - new Date(s.createdAt).getTime();
                    if (age < 5 * 60 * 1000 && mounted) {
                        addNotif(s);
                    }
                });
            } catch (e) { /* silent */ }
        };

        fetchSignals();
        const iv = setInterval(fetchSignals, 60000); // Check every 60s
        return () => { mounted = false; clearInterval(iv); };
    }, [isAuthenticated, addNotif]);

    const handleClick = (s) => {
        navigate(`/signal/${s._id}`);
        removeNotif(s.nid);
    };

    if (notifications.length === 0) return null;

    return (
        <Container>
            {notifications.map(s => {
                const long = s.direction === 'UP';
                const conf = Math.round(s.confidence || 0);
                const sym = s.symbol?.split(':')[0]?.replace(/USDT|USD/i, '') || s.symbol;
                const target = s.targetPrice;
                const highConf = conf >= 70;

                return (
                    <Toast
                        key={s.nid}
                        $long={long}
                        $highConf={highConf}
                        $exiting={s.exiting}
                        onClick={() => handleClick(s)}
                    >
                        <ToastHeader>
                            <ToastTitle>
                                <Brain size={14} /> AI Signal Generated
                                {highConf && ' 🔥'}
                            </ToastTitle>
                            <CloseBtn onClick={(e) => { e.stopPropagation(); removeNotif(s.nid); }}>
                                <X size={12} />
                            </CloseBtn>
                        </ToastHeader>

                        <ToastBody>
                            <IconBox $long={long}>
                                {long ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            </IconBox>
                            <Content>
                                <SymbolRow>
                                    <Symbol>{sym}</Symbol>
                                    <DirBadge $long={long}>{long ? '↑ LONG' : '↓ SHORT'}</DirBadge>
                                    <ConfBadge>{conf}%</ConfBadge>
                                </SymbolRow>
                                <Desc>
                                    Target: ${target >= 1 ? target.toFixed(2) : target.toFixed(6)}
                                </Desc>
                            </Content>
                        </ToastBody>

                        <ProgressBar $progress={s.progress} $long={long} />
                    </Toast>
                );
            })}
        </Container>
    );
};

export default SignalNotification;
