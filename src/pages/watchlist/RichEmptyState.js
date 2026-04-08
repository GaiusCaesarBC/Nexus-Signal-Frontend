// client/src/pages/watchlist/RichEmptyState.js
//
// Replaces the bare "Your Watchlist is Empty" with suggested-asset chips,
// popular watchlist presets, and trending tickers. Click any chip → adds it.

import React, { useState } from 'react';
import styled from 'styled-components';
import { Eye, Plus, Sparkles, Flame, TrendingUp, Bitcoin, Loader } from 'lucide-react';
import { SUGGESTED_ASSETS } from './derive';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    max-width: 760px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 18px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    animation: ${fadeIn} 0.5s ease-out both;
`;

const Top = styled.div`
    text-align: center;
    margin-bottom: 1.5rem;
`;

const IconBox = styled.div`
    width: 72px;
    height: 72px;
    margin: 0 auto 1rem;
    border-radius: 18px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.18), rgba(0, 173, 237, 0.04));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.35)')};
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Title = styled.h2`
    margin: 0 0 0.4rem 0;
    font-size: 1.4rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
`;

const Sub = styled.p`
    margin: 0;
    font-size: 0.92rem;
    color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
    line-height: 1.5;
`;

const Group = styled.div`
    margin-top: 1.4rem;
`;

const GroupHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 0.45rem;
    margin-bottom: 0.7rem;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${(p) => t(p, 'text.tertiary', '#64748b')};

    svg { color: ${(p) => t(p, 'brand.primary', '#00adef')}; }
`;

const Chips = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
`;

const Chip = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.85rem;
    border-radius: 10px;
    cursor: pointer;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.7)')};
    border: 1px solid ${(p) => t(p, 'border.card', 'rgba(100, 116, 139, 0.20)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.85rem;
    font-weight: 700;
    transition: transform 0.15s ease, border-color 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }

    .name {
        color: ${(p) => t(p, 'text.tertiary', '#64748b')};
        font-weight: 600;
        font-size: 0.75rem;
    }
    svg.kind {
        color: ${(p) => t(p, 'brand.primary', '#00adef')};
    }
`;

const PresetRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
`;

const PresetCard = styled.button`
    flex: 1 1 200px;
    text-align: left;
    padding: 0.95rem 1.05rem;
    border-radius: 12px;
    cursor: pointer;
    background: ${(p) => t(p, 'bg.card', 'rgba(30, 41, 59, 0.6)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.30)')};
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    transition: transform 0.15s ease, box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 18px rgba(0, 173, 237, 0.20)')};
    }
    &:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
    }

    .head {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.8rem;
        font-weight: 800;
        margin-bottom: 0.4rem;
    }
    .tickers {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
        font-size: 0.7rem;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        font-weight: 700;
    }
`;

const ManualBtn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.4rem;
    padding: 0.7rem 1.1rem;
    border-radius: 10px;
    cursor: pointer;
    background: ${(p) => t(p, 'brand.gradient', 'linear-gradient(135deg, #00adef, #06b6d4)')};
    color: #fff;
    border: none;
    font-size: 0.9rem;
    font-weight: 700;
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: ${(p) => t(p, 'glow.primary', '0 0 18px rgba(0, 173, 237, 0.30)')};
    }
`;

const KindIcon = ({ kind }) =>
    kind === 'crypto' ? <Bitcoin size={13} className="kind" /> : <TrendingUp size={13} className="kind" />;

const RichEmptyState = ({ onAdd, onOpenAddModal, theme }) => {
    const [busy, setBusy] = useState(null); // symbol currently being added

    const addOne = async (sym) => {
        if (busy) return;
        setBusy(sym);
        try {
            await onAdd(sym);
        } finally {
            setBusy(null);
        }
    };

    const addPreset = async (list) => {
        if (busy) return;
        setBusy('preset');
        try {
            for (const a of list) {
                await onAdd(a.symbol);
            }
        } finally {
            setBusy(null);
        }
    };

    return (
        <Wrap theme={theme}>
            <Top>
                <IconBox theme={theme}><Eye size={32} /></IconBox>
                <Title theme={theme}>Build your watchlist in 1 click</Title>
                <Sub theme={theme}>
                    Pick a popular ticker, load a preset, or add your own — your watchlist
                    will instantly start surfacing actionable signals and movers.
                </Sub>
            </Top>

            <Group>
                <GroupHeader theme={theme}><Sparkles size={11} /> Popular Picks</GroupHeader>
                <Chips>
                    {SUGGESTED_ASSETS.popular.map((a) => (
                        <Chip
                            key={a.symbol}
                            theme={theme}
                            onClick={() => addOne(a.symbol)}
                            disabled={busy != null}
                        >
                            <KindIcon kind={a.kind} />
                            {a.symbol}
                            <span className="name">{a.name}</span>
                            {busy === a.symbol ? <Loader size={12} /> : <Plus size={12} />}
                        </Chip>
                    ))}
                </Chips>
            </Group>

            <Group>
                <GroupHeader theme={theme}><Flame size={11} /> Trending</GroupHeader>
                <Chips>
                    {SUGGESTED_ASSETS.trending.map((a) => (
                        <Chip
                            key={a.symbol}
                            theme={theme}
                            onClick={() => addOne(a.symbol)}
                            disabled={busy != null}
                        >
                            <KindIcon kind={a.kind} />
                            {a.symbol}
                            <span className="name">{a.name}</span>
                            {busy === a.symbol ? <Loader size={12} /> : <Plus size={12} />}
                        </Chip>
                    ))}
                </Chips>
            </Group>

            <Group>
                <GroupHeader theme={theme}><TrendingUp size={11} /> Popular Watchlists</GroupHeader>
                <PresetRow>
                    <PresetCard
                        theme={theme}
                        onClick={() => addPreset(SUGGESTED_ASSETS.techGrowth)}
                        disabled={busy != null}
                    >
                        <div className="head">Tech Growth</div>
                        <div className="tickers">
                            {SUGGESTED_ASSETS.techGrowth.map((a) => <span key={a.symbol}>{a.symbol}</span>)}
                        </div>
                    </PresetCard>
                    <PresetCard
                        theme={theme}
                        onClick={() => addPreset([
                            { symbol: 'BTC' }, { symbol: 'ETH' }, { symbol: 'SOL' },
                        ])}
                        disabled={busy != null}
                    >
                        <div className="head">Crypto Majors</div>
                        <div className="tickers">
                            <span>BTC</span><span>ETH</span><span>SOL</span>
                        </div>
                    </PresetCard>
                </PresetRow>
            </Group>

            <ManualBtn theme={theme} onClick={onOpenAddModal}>
                <Plus size={16} />
                Add a custom ticker
            </ManualBtn>
        </Wrap>
    );
};

export default RichEmptyState;
