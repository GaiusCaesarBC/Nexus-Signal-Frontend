// client/src/pages/smartAlerts/AlertCardV2.js
//
// Enhanced alert card. Adds:
//   - Status badge with new "Near Trigger" state (yellow + glow)
//   - Distance-to-trigger %
//   - Direction indicator (toward / away)
//   - Edit / Pause / Delete actions
//   - Triggered cards flash green/red on first render
//   - Linked-to-signal chip when alert.signalId is set
//
// All prop-driven — drops in for the existing inline AlertCard.

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import {
    DollarSign, Activity, Triangle, Bell, CheckCircle, XCircle,
    Pause, Play, Trash2, Edit3, TrendingUp, TrendingDown, Target, Zap,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { fmtUSD } from './derive';
import { t, fadeIn } from '../marketReports/styles';

// ─── animations ──────────────────────────────────────────────
const flashGreen = keyframes`
    0%   { box-shadow: 0 0 0 rgba(16, 185, 129, 0); background-color: rgba(16, 185, 129, 0.18); }
    50%  { box-shadow: 0 0 36px rgba(16, 185, 129, 0.55); }
    100% { box-shadow: 0 0 0 rgba(16, 185, 129, 0); background-color: transparent; }
`;
const flashRed = keyframes`
    0%   { box-shadow: 0 0 0 rgba(239, 68, 68, 0); background-color: rgba(239, 68, 68, 0.18); }
    50%  { box-shadow: 0 0 36px rgba(239, 68, 68, 0.55); }
    100% { box-shadow: 0 0 0 rgba(239, 68, 68, 0); background-color: transparent; }
`;
const pulseBlue = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(0, 173, 237, 0); }
    50%      { box-shadow: 0 0 24px rgba(0, 173, 237, 0.30); }
`;
const pulseYellow = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(245, 158, 11, 0); }
    50%      { box-shadow: 0 0 28px rgba(245, 158, 11, 0.45); }
`;

// ─── styled atoms ────────────────────────────────────────────

const Card = styled.div`
    position: relative;
    padding: 1.1rem 1.2rem;
    border-radius: 14px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.65)')};
    border: 1px solid ${(p) =>
        p.$status === 'triggered' && p.$bias === 'bull' ? 'rgba(16, 185, 129, 0.45)'
      : p.$status === 'triggered' && p.$bias === 'bear' ? 'rgba(239, 68, 68, 0.45)'
      : p.$status === 'near_trigger' ? 'rgba(245, 158, 11, 0.55)'
      : p.$status === 'expired' ? 'rgba(100, 116, 139, 0.30)'
      : p.$status === 'paused' ? 'rgba(100, 116, 139, 0.40)'
      : t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    animation: ${fadeIn} 0.4s ease-out both;
    overflow: hidden;
    transition: transform 0.15s ease;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) =>
            p.$status === 'triggered' && p.$bias === 'bull' ? 'linear-gradient(90deg, rgba(16,185,129,0.9), transparent)'
          : p.$status === 'triggered' && p.$bias === 'bear' ? 'linear-gradient(90deg, rgba(239,68,68,0.9), transparent)'
          : p.$status === 'near_trigger' ? 'linear-gradient(90deg, rgba(245,158,11,0.9), transparent)'
          : 'linear-gradient(90deg, rgba(0,173,237,0.9), transparent)'};
    }

    &:hover { transform: translateY(-2px); }

    ${(p) => p.$status === 'active' && css`
        animation: ${fadeIn} 0.4s ease-out both, ${pulseBlue} 3s ease-in-out infinite;
    `}
    ${(p) => p.$status === 'near_trigger' && css`
        animation: ${fadeIn} 0.4s ease-out both, ${pulseYellow} 1.6s ease-in-out infinite;
    `}
    ${(p) => p.$flash === 'green' && css`
        animation: ${fadeIn} 0.4s ease-out both, ${flashGreen} 1.4s ease-out 1;
    `}
    ${(p) => p.$flash === 'red' && css`
        animation: ${fadeIn} 0.4s ease-out both, ${flashRed} 1.4s ease-out 1;
    `}
`;

const TopRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const SymBlock = styled.div`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;

    .sym {
        font-size: 1.2rem;
        font-weight: 900;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        letter-spacing: 0.02em;
    }
    .label {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.18rem 0.5rem;
        border-radius: 5px;
        background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-size: 0.62rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
`;

const Status = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    background: ${(p) =>
        p.$status === 'triggered' && p.$bias === 'bull' ? 'rgba(16, 185, 129, 0.20)'
      : p.$status === 'triggered' && p.$bias === 'bear' ? 'rgba(239, 68, 68, 0.20)'
      : p.$status === 'near_trigger' ? 'rgba(245, 158, 11, 0.20)'
      : p.$status === 'expired' ? 'rgba(100, 116, 139, 0.20)'
      : p.$status === 'paused' ? 'rgba(100, 116, 139, 0.20)'
      : 'rgba(0, 173, 237, 0.20)'};
    color: ${(p) =>
        p.$status === 'triggered' && p.$bias === 'bull' ? t(p, 'success', '#10b981')
      : p.$status === 'triggered' && p.$bias === 'bear' ? t(p, 'error', '#ef4444')
      : p.$status === 'near_trigger' ? t(p, 'warning', '#f59e0b')
      : p.$status === 'expired' ? t(p, 'text.tertiary', '#64748b')
      : p.$status === 'paused' ? t(p, 'text.tertiary', '#64748b')
      : t(p, 'brand.primary', '#00adef')};
`;

const Condition = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.92rem;
    font-weight: 700;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};

    svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
`;

const PriceRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.7rem;
    border-radius: 8px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.18)')};
    font-size: 0.78rem;

    .label {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 700;
        font-size: 0.62rem;
    }
    .value {
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        font-weight: 800;
    }
`;

const ProxBar = styled.div`
    height: 5px;
    border-radius: 4px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    overflow: hidden;

    > span {
        display: block;
        height: 100%;
        width: ${(p) => Math.max(0, Math.min(100, 100 - p.$pct * 8))}%;
        background: ${(p) =>
            p.$near ? 'linear-gradient(90deg, rgba(245,158,11,0.6), rgba(245,158,11,1))'
                    : 'linear-gradient(90deg, rgba(0,173,237,0.6), rgba(0,173,237,1))'};
        transition: width 0.5s ease;
    }
`;

const SignalChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(0, 173, 237, 0.10));
    border: 1px solid rgba(168, 85, 247, 0.40);
    color: #c4b5fd;
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

const Actions = styled.div`
    display: flex;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
    margin-top: 0.2rem;
`;

const IconBtn = styled.button`
    width: 28px;
    height: 28px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    cursor: pointer;
    background: ${(p) => p.$danger ? 'rgba(239, 68, 68, 0.10)' : t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    color: ${(p) => p.$danger ? t(p, 'error', '#ef4444') : t(p, 'text.primary', '#f8fafc')};
    border: 1px solid ${(p) => p.$danger ? 'rgba(239, 68, 68, 0.30)' : t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    transition: transform 0.12s ease;

    &:hover { transform: translateY(-1px); }
`;

// ─── component ───────────────────────────────────────────────

const CategoryIcon = ({ category }) => {
    if (category === 'price')     return <DollarSign size={14} />;
    if (category === 'technical') return <Activity size={14} />;
    if (category === 'pattern')   return <Triangle size={14} />;
    return <Bell size={14} />;
};

const StatusIcon = ({ status, bias }) => {
    if (status === 'triggered') return bias === 'bear' ? <TrendingDown size={11} /> : <TrendingUp size={11} />;
    if (status === 'near_trigger') return <Target size={11} />;
    if (status === 'expired') return <XCircle size={11} />;
    if (status === 'paused') return <Pause size={11} />;
    return <CheckCircle size={11} />;
};

const statusLabel = (s) => ({
    triggered: 'Triggered',
    near_trigger: '🎯 Near Trigger',
    active: 'Active',
    expired: 'Expired',
    paused: 'Paused',
})[s] || s;

const AlertCardV2 = ({ alert, onDelete, onPause, onEdit, freshlyTriggered }) => {
    const { theme } = useTheme();

    // bias for triggered styling: price_above hit = bull; price_below hit = bear
    const bias = alert.type === 'price_below' ? 'bear' : 'bull';
    const flash = freshlyTriggered ? (bias === 'bear' ? 'red' : 'green') : null;
    const cur = alert.currentPrice ?? alert.livePrice;

    const [confirmDel, setConfirmDel] = useState(false);

    const handleDelete = (e) => {
        e.stopPropagation();
        if (!confirmDel) {
            setConfirmDel(true);
            setTimeout(() => setConfirmDel(false), 2000);
            return;
        }
        onDelete?.(alert._id);
    };

    return (
        <Card theme={theme} $status={alert._statusV2} $bias={bias} $flash={flash}>
            <TopRow>
                <SymBlock theme={theme}>
                    <span className="sym">{alert.symbol || 'Portfolio'}</span>
                    <span className="label">
                        <CategoryIcon category={alert._category} />
                        {alert._category}
                    </span>
                    {alert.signalId && (
                        <SignalChip><Zap size={10} /> Linked Signal</SignalChip>
                    )}
                </SymBlock>
                <Status theme={theme} $status={alert._statusV2} $bias={bias}>
                    <StatusIcon status={alert._statusV2} bias={bias} />
                    {statusLabel(alert._statusV2)}
                </Status>
            </TopRow>

            <Condition theme={theme}>
                <Bell size={14} />
                {alert._condition}
            </Condition>

            {(cur != null || alert._proximity != null) && (
                <PriceRow theme={theme}>
                    <div>
                        <div className="label">Current</div>
                        <div className="value">{cur != null ? fmtUSD(cur) : '—'}</div>
                    </div>
                    {alert._proximity != null && (
                        <div style={{ textAlign: 'right' }}>
                            <div className="label">Distance</div>
                            <div className="value">
                                {alert._proximity.pct.toFixed(2)}%
                                {alert._proximity.direction === 'toward' && ' ↗'}
                                {alert._proximity.direction === 'away' && ' ↘'}
                            </div>
                        </div>
                    )}
                </PriceRow>
            )}

            {alert._proximity != null && (
                <ProxBar theme={theme} $pct={alert._proximity.pct} $near={alert._proximity.near}>
                    <span />
                </ProxBar>
            )}

            <Actions>
                {onEdit && (
                    <IconBtn theme={theme} onClick={(e) => { e.stopPropagation(); onEdit(alert); }} title="Edit">
                        <Edit3 size={14} />
                    </IconBtn>
                )}
                {onPause && (
                    <IconBtn theme={theme} onClick={(e) => { e.stopPropagation(); onPause(alert); }} title={alert.status === 'paused' ? 'Resume' : 'Pause'}>
                        {alert.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                    </IconBtn>
                )}
                <IconBtn theme={theme} $danger onClick={handleDelete} title={confirmDel ? 'Click again to confirm' : 'Delete'}>
                    <Trash2 size={14} />
                </IconBtn>
            </Actions>
        </Card>
    );
};

export default AlertCardV2;
