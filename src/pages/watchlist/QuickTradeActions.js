// client/src/pages/watchlist/QuickTradeActions.js
//
// Quick row-level CTAs: Trade / Analyze / Add Alert.
// Replaces the old "trash only" action cell with frictionless trade actions.

import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Zap, BarChart3, Bell, Trash2 } from 'lucide-react';
import { t } from '../marketReports/styles';

const Wrap = styled.div`
    display: flex;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
`;

const IconBtn = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 8px;
    cursor: pointer;
    background: ${(p) =>
        p.$primary ? t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef, #06b6d4)')
      : p.$danger ? 'rgba(239, 68, 68, 0.12)'
      : t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.6)')};
    color: ${(p) =>
        p.$primary ? '#fff'
      : p.$danger ? t(p, 'error', '#ef4444')
      : t(p, 'text.primary', '#f8fafc')};
    border: 1px solid ${(p) =>
        p.$primary ? 'transparent'
      : p.$danger ? 'rgba(239, 68, 68, 0.30)'
      : t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    transition: transform 0.12s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) =>
            p.$primary ? t(p, 'glow.primary', '0 0 14px rgba(0, 173, 237, 0.30)')
          : p.$danger ? '0 0 14px rgba(239, 68, 68, 0.30)'
          : t(p, 'glow.primary', '0 0 14px rgba(0, 173, 237, 0.18)')};
    }
`;

const QuickTradeActions = ({ symbol, onSetAlert, onRemove, theme }) => {
    const navigate = useNavigate();

    const trade = (e) => {
        e.stopPropagation();
        navigate(`/signals?symbol=${encodeURIComponent(symbol)}`);
    };
    const analyze = (e) => {
        e.stopPropagation();
        navigate(`/market-reports?tab=stock&symbol=${encodeURIComponent(symbol)}`);
    };
    const alert = (e) => {
        e.stopPropagation();
        if (onSetAlert) onSetAlert(e);
    };
    const remove = (e) => {
        e.stopPropagation();
        if (onRemove) onRemove(e);
    };

    return (
        <Wrap>
            <IconBtn theme={theme} $primary onClick={trade} title="Trade">
                <Zap size={14} />
            </IconBtn>
            <IconBtn theme={theme} onClick={analyze} title="Analyze">
                <BarChart3 size={14} />
            </IconBtn>
            <IconBtn theme={theme} onClick={alert} title="Add alert">
                <Bell size={14} />
            </IconBtn>
            <IconBtn theme={theme} $danger onClick={remove} title="Remove">
                <Trash2 size={14} />
            </IconBtn>
        </Wrap>
    );
};

export default QuickTradeActions;
