// client/src/pages/smartAlerts/NotificationBell.js
//
// In-page notification bell with badge count + dropdown of recent
// triggered alerts. Sits in the page header alongside the title.

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Bell, X, ChevronRight } from 'lucide-react';
import { t } from '../marketReports/styles';

const ring = keyframes`
    0%, 100% { transform: rotate(0); }
    10% { transform: rotate(15deg); }
    20% { transform: rotate(-12deg); }
    30% { transform: rotate(8deg); }
    40% { transform: rotate(-6deg); }
    50% { transform: rotate(0); }
`;

const Wrap = styled.div`
    position: relative;
`;

const BellBtn = styled.button`
    position: relative;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    cursor: pointer;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 18px rgba(0, 173, 237, 0.30)')};
    }

    ${(p) => p.$ringing && css`
        svg { animation: ${ring} 0.9s ease-in-out 1; }
    `}
`;

const Badge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: ${(p) => t(p, 'error', '#ef4444')};
    color: #fff;
    font-size: 0.62rem;
    font-weight: 800;
    display: grid;
    place-items: center;
    border: 2px solid ${(p) => t(p, 'bg.page', '#0a0e27')};
`;

const Dropdown = styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 340px;
    max-height: 460px;
    overflow-y: auto;
    border-radius: 14px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.97)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    z-index: 100;

    @media (max-width: 480px) {
        width: calc(100vw - 2rem);
        right: -1rem;
    }
`;

const DropHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};

    .title {
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
    button {
        display: grid;
        place-items: center;
        background: transparent;
        border: none;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        cursor: pointer;
    }
`;

const NotifList = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

const NotifItem = styled.li`
    padding: 0.7rem 0.85rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .top {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.85rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    }
    .body {
        font-size: 0.78rem;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        line-height: 1.4;
    }
    .time {
        font-size: 0.68rem;
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-weight: 600;
    }
`;

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};
    font-size: 0.85rem;
`;

const Footer = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    width: 100%;
    padding: 0.7rem;
    background: transparent;
    border: none;
    border-top: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: rgba(0, 173, 237, 0.08);
    }
`;

const NotificationBell = ({ notifications, onClear, theme, ringing }) => {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const count = notifications?.length || 0;

    return (
        <Wrap ref={wrapRef}>
            <BellBtn theme={theme} $ringing={ringing} onClick={() => setOpen((o) => !o)} title="Notifications">
                <Bell size={18} />
                {count > 0 && <Badge theme={theme}>{count > 99 ? '99+' : count}</Badge>}
            </BellBtn>

            {open && (
                <Dropdown theme={theme}>
                    <DropHeader theme={theme}>
                        <span className="title">Notifications</span>
                        {count > 0 && (
                            <button onClick={onClear} title="Clear all">
                                <X size={16} />
                            </button>
                        )}
                    </DropHeader>

                    {count === 0 ? (
                        <Empty theme={theme}>No new notifications.</Empty>
                    ) : (
                        <>
                            <NotifList>
                                {notifications.map((n) => (
                                    <NotifItem key={n.id} theme={theme}>
                                        <div className="top">
                                            <Bell size={12} />
                                            {n.title}
                                        </div>
                                        {n.body && <div className="body">{n.body}</div>}
                                        <div className="time">{n.timeLabel}</div>
                                    </NotifItem>
                                ))}
                            </NotifList>
                            <Footer onClick={onClear}>
                                Clear all <ChevronRight size={12} />
                            </Footer>
                        </>
                    )}
                </Dropdown>
            )}
        </Wrap>
    );
};

export default NotificationBell;
