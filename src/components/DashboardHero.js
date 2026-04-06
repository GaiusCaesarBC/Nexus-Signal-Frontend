// components/DashboardHero.js — Trust-first header + action cards for dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Radio, TrendingUp, DollarSign, Shield, CheckCircle, Target, ArrowUpRight, Activity } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.nexussignal.ai/api';

const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;

const Section = styled.div`margin-bottom:1.25rem;`;

const TrustHeader = styled.div`
    display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1rem;
`;
const TrustLeft = styled.div``;
const TrustTitle = styled.h1`font-size:clamp(1.3rem,2.5vw,1.8rem);font-weight:900;color:#e2e8f0;margin:0 0 .2rem;letter-spacing:-.02em;`;
const TrustSub = styled.p`font-size:.8rem;color:#64748b;margin:0;display:flex;align-items:center;gap:.35rem;`;
const TrustStats = styled.div`display:flex;gap:.75rem;flex-wrap:wrap;`;
const TrustStat = styled.div`
    display:flex;flex-direction:column;align-items:center;gap:1px;padding:.4rem .6rem;
    background:rgba(100,116,139,.04);border:1px solid rgba(100,116,139,.08);border-radius:8px;
    animation:${fadeIn} .4s ease-out both;animation-delay:${p => p.$d || '0s'};
`;
const TSVal = styled.span`font-size:.9rem;font-weight:800;color:${p => p.$c || '#e2e8f0'};`;
const TSLbl = styled.span`font-size:.55rem;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:.04em;`;

const CardsGrid = styled.div`
    display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:.75rem;
`;

const ActionCard = styled.div`
    background:${p => p.$bg};border:1px solid ${p => p.$border};border-radius:14px;
    padding:1.2rem;cursor:pointer;transition:all .25s ease;
    animation:${fadeIn} .5s ease-out both;animation-delay:${p => p.$d || '0s'};
    &:hover{transform:translateY(-3px);box-shadow:0 8px 24px ${p => p.$glow};}
`;
const CardTop = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem;`;
const CardIcon = styled.div`width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:${p => p.$bg};`;
const CardTitle = styled.div`font-size:1.05rem;font-weight:800;color:#e2e8f0;margin-bottom:.15rem;`;
const CardDesc = styled.div`font-size:.78rem;color:#94a3b8;line-height:1.45;`;
const CardCTA = styled.div`margin-top:.7rem;font-size:.75rem;font-weight:700;color:${p => p.$c};`;

const DashboardHero = ({ paperTradingStats, formatCurrency }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/predictions/stats`)
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d); })
            .catch(() => {});
    }, []);

    return (
        <Section>
            <TrustHeader>
                <TrustLeft>
                    <TrustTitle>Your AI Trading Dashboard</TrustTitle>
                    <TrustSub><Shield size={14} color="#10b981"/> Every trade tracked publicly. No edits. No cherry-picking.</TrustSub>
                </TrustLeft>
                {stats && (
                    <TrustStats>
                        <TrustStat $d="0s"><TSVal $c="#00adef">{stats.total}</TSVal><TSLbl>Trades</TSLbl></TrustStat>
                        <TrustStat $d=".05s"><TSVal $c={stats.winRate >= 50 ? '#10b981' : '#f59e0b'}>{stats.winRate}%</TSVal><TSLbl>Win Rate</TSLbl></TrustStat>
                        <TrustStat $d=".1s"><TSVal $c="#10b981">{stats.wins}</TSVal><TSLbl>Winners</TSLbl></TrustStat>
                        <TrustStat $d=".15s"><TSVal $c="#e2e8f0">{stats.active}</TSVal><TSLbl>Active</TSLbl></TrustStat>
                        <TrustStat $d=".2s">
                            <div style={{display:'flex',alignItems:'center',gap:'.2rem'}}><CheckCircle size={10} color="#10b981"/><TSVal $c="#10b981" style={{fontSize:'.7rem'}}>Verified</TSVal></div>
                            <TSLbl>Track Record</TSLbl>
                        </TrustStat>
                    </TrustStats>
                )}
            </TrustHeader>

            <CardsGrid>
                <ActionCard $bg="linear-gradient(135deg,rgba(16,185,129,.07),rgba(6,40,25,.5))" $border="rgba(16,185,129,.18)" $glow="rgba(16,185,129,.1)" $d="0s" onClick={() => navigate('/signals')}>
                    <CardTop>
                        <CardIcon $bg="rgba(16,185,129,.1)"><Radio size={18} color="#10b981"/></CardIcon>
                        <ArrowUpRight size={16} color="#10b981"/>
                    </CardTop>
                    <CardTitle>Live Signals</CardTitle>
                    <CardDesc>AI-generated trade setups with entry, stop loss & targets — tracked in real time.</CardDesc>
                    <CardCTA $c="#10b981">View Signals →</CardCTA>
                </ActionCard>

                <ActionCard $bg="linear-gradient(135deg,rgba(0,173,237,.07),rgba(6,25,40,.5))" $border="rgba(0,173,237,.18)" $glow="rgba(0,173,237,.1)" $d=".08s" onClick={() => navigate('/performance')}>
                    <CardTop>
                        <CardIcon $bg="rgba(0,173,237,.1)"><TrendingUp size={18} color="#00adef"/></CardIcon>
                        <ArrowUpRight size={16} color="#00adef"/>
                    </CardTop>
                    <CardTitle>Verified Performance</CardTitle>
                    <CardDesc>Every trade publicly tracked — wins and losses. Full transparency.</CardDesc>
                    <CardCTA $c="#00adef">View Track Record →</CardCTA>
                </ActionCard>

                <ActionCard $bg="linear-gradient(135deg,rgba(245,158,11,.07),rgba(40,30,6,.5))" $border="rgba(245,158,11,.18)" $glow="rgba(245,158,11,.1)" $d=".16s" onClick={() => navigate('/paper-trading')}>
                    <CardTop>
                        <CardIcon $bg="rgba(245,158,11,.1)"><DollarSign size={18} color="#f59e0b"/></CardIcon>
                        <span style={{fontSize:'.7rem',fontWeight:700,color:'#f59e0b'}}>{formatCurrency ? formatCurrency(paperTradingStats?.portfolioValue) : '$100,000'}</span>
                    </CardTop>
                    <CardTitle>Paper Trade</CardTitle>
                    <CardDesc>Practice strategies with $100K virtual cash — zero risk, real market data.</CardDesc>
                    <CardCTA $c="#f59e0b">Start Paper Trading →</CardCTA>
                </ActionCard>
            </CardsGrid>
        </Section>
    );
};

export default DashboardHero;
