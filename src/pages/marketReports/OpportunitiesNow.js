// client/src/pages/marketReports/OpportunitiesNow.js
//
// Live trade ideas that align with the report bias. Bridges intelligence ->
// execution: each card has a "View Setup" CTA that deep-links into Signals.
//
// Reuses the SignalsPage data source: GET /predictions/recent
// (We do NOT import SignalsPage's buildSignal — too much coupling. We
//  normalize only the fields we need into a flat shape.)

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight, Loader, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { alignSignalsToReport } from './derive';
import {
    SectionCard,
    SectionHeader,
    SectionTitle,
    ActionButton,
    Muted,
    t,
} from './styles';

const Strip = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 0.85rem;

    @media (max-width: 720px) {
        grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

const SignalCard = styled.button`
    text-align: left;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
    border: 1px solid ${(p) =>
        p.$direction === 'LONG' ? 'rgba(16, 185, 129, 0.35)'
      : 'rgba(239, 68, 68, 0.35)'};
    border-radius: 12px;
    padding: 1rem 1.1rem;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: ${(p) =>
            p.$direction === 'LONG' ? 'linear-gradient(90deg, rgba(16,185,129,0.8), transparent)'
          : 'linear-gradient(90deg, rgba(239,68,68,0.8), transparent)'};
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${(p) =>
            p.$direction === 'LONG' ? '0 8px 24px rgba(16, 185, 129, 0.18)'
          : '0 8px 24px rgba(239, 68, 68, 0.18)'};
    }
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
`;

const Symbol = styled.div`
    font-size: 1.1rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    letter-spacing: 0.02em;
`;

const DirChip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.25rem 0.55rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    background: ${(p) =>
        p.$direction === 'LONG' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)'};
    color: ${(p) =>
        p.$direction === 'LONG' ? t(p, 'success', '#10b981') : t(p, 'error', '#ef4444')};
`;

const ConfBar = styled.div`
    height: 6px;
    border-radius: 4px;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    overflow: hidden;

    > span {
        display: block;
        height: 100%;
        width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
        background: ${(p) =>
            p.$direction === 'LONG'
                ? 'linear-gradient(90deg, rgba(16,185,129,0.6), rgba(16,185,129,1))'
                : 'linear-gradient(90deg, rgba(239,68,68,0.6), rgba(239,68,68,1))'};
        transition: width 0.4s ease;
    }
`;

const ConfRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-weight: 600;
`;

const CTA = styled.div`
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
    font-size: 0.8rem;
    font-weight: 700;
    margin-top: 0.15rem;
`;

const Empty = styled.div`
    padding: 1.25rem;
    text-align: center;
    border: 1px dashed ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.3)')};
    border-radius: 10px;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;
`;

const LoadingRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    font-size: 0.9rem;

    svg {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

// ---------- local normalizer ----------
// Just the fields we need. Mirrors SignalsPage.buildSignal lightly.
const normalize = (raw) => {
    const symbol = (raw.symbol || '').split(':')[0]?.replace(/USDT|USD$/i, '') || raw.symbol;
    const direction = raw.direction === 'UP' ? 'LONG' : 'SHORT';
    const confidence = Math.round(raw.confidence ?? 0);
    return {
        id: raw.id || raw._id || `${symbol}-${raw.createdAt || ''}`,
        symbol,
        direction,
        confidence,
        entry: raw.entryPrice ?? raw.entry ?? raw.livePrice,
    };
};

const OpportunitiesNow = ({ report }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [signals, setSignals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);

    const fetchSignals = useCallback(async () => {
        setLoading(true);
        setErrored(false);
        try {
            const res = await api.get('/predictions/recent?limit=100&includeLivePrices=true');
            const list = Array.isArray(res.data) ? res.data : [];
            setSignals(list.map(normalize));
        } catch (e) {
            setErrored(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSignals(); }, [fetchSignals]);

    const aligned = useMemo(
        () => alignSignalsToReport(signals, report, 5),
        [signals, report]
    );

    const handleOpen = (s) => navigate(`/signals?symbol=${encodeURIComponent(s.symbol)}`);

    return (
        <SectionCard theme={theme}>
            <SectionHeader>
                <SectionTitle theme={theme}>
                    <Sparkles size={14} /> Opportunities Right Now
                </SectionTitle>
                <ActionButton theme={theme} onClick={() => navigate('/signals')}>
                    View all signals <ArrowRight size={14} />
                </ActionButton>
            </SectionHeader>

            {loading && (
                <LoadingRow theme={theme}>
                    <Loader size={16} /> Loading aligned signals...
                </LoadingRow>
            )}

            {!loading && errored && (
                <Empty theme={theme}>
                    Couldn't load live signals. <Muted theme={theme}>Try refreshing the report.</Muted>
                </Empty>
            )}

            {!loading && !errored && aligned.length === 0 && (
                <Empty theme={theme}>
                    No high-conviction signals match this report's bias right now.
                </Empty>
            )}

            {!loading && !errored && aligned.length > 0 && (
                <Strip>
                    {aligned.map((s) => (
                        <SignalCard
                            key={s.id}
                            theme={theme}
                            $direction={s.direction}
                            onClick={() => handleOpen(s)}
                        >
                            <Row>
                                <Symbol theme={theme}>{s.symbol}</Symbol>
                                <DirChip theme={theme} $direction={s.direction}>
                                    {s.direction === 'LONG' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {s.direction}
                                </DirChip>
                            </Row>
                            <div>
                                <ConfRow theme={theme}>
                                    <span>Confidence</span>
                                    <span>{s.confidence}%</span>
                                </ConfRow>
                                <ConfBar theme={theme} $pct={s.confidence} $direction={s.direction}>
                                    <span />
                                </ConfBar>
                            </div>
                            <CTA theme={theme}>
                                View setup <ArrowRight size={14} />
                            </CTA>
                        </SignalCard>
                    ))}
                </Strip>
            )}
        </SectionCard>
    );
};

export default OpportunitiesNow;
