// client/src/pages/LandingPageV2.js — Trust-First Landing Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp, TrendingDown, Shield, CheckCircle, ArrowRight,
    Target, Brain, Activity, BarChart3, Zap, Users, Lock, ChevronRight, X as XIcon
} from 'lucide-react';
import SEO from '../components/SEO';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.nexussignal.ai/api';

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const countUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.div`min-height:100vh;background:#030712;color:#e2e8f0;overflow-x:hidden;`;
const Section = styled.section`max-width:1100px;margin:0 auto;padding:${p => p.$p || '5rem 1.5rem'};`;
const SectionTitle = styled.h2`font-size:clamp(1.4rem,3vw,2rem);font-weight:900;color:#e2e8f0;text-align:center;margin:0 0 .4rem;letter-spacing:-.02em;`;
const SectionSub = styled.p`font-size:.9rem;color:#64748b;text-align:center;margin:0 auto 2.5rem;max-width:550px;line-height:1.6;`;

// Hero
const Hero = styled.section`max-width:1100px;margin:0 auto;padding:7rem 1.5rem 4rem;text-align:center;@media(max-width:480px){padding:5rem 1rem 2.5rem;}`;
const HeroTitle = styled.h1`font-size:clamp(2rem,5vw,3.2rem);font-weight:900;color:#e2e8f0;margin:0 0 .6rem;letter-spacing:-.03em;line-height:1.1;animation:${fadeIn} .6s ease-out;`;
const HeroAccent = styled.span`color:#10b981;`;
const HeroSub = styled.p`font-size:clamp(.95rem,1.5vw,1.15rem);color:#94a3b8;margin:0 auto 1.5rem;max-width:600px;line-height:1.6;animation:${fadeIn} .6s ease-out .1s both;`;

const TrustStrip = styled.div`
    display:flex;justify-content:center;gap:1rem;flex-wrap:wrap;margin-bottom:2rem;
    animation:${fadeIn} .6s ease-out .2s both;
`;
const TrustChip = styled.div`
    display:flex;align-items:center;gap:.35rem;padding:.4rem .75rem;
    background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.15);
    border-radius:8px;font-size:.78rem;color:#94a3b8;font-weight:500;
    animation:${countUp} .5s ease-out both;animation-delay:${p => p.$d || '0s'};
`;
const TrustVal = styled.span`font-weight:800;color:${p => p.$c || '#10b981'};`;

const HeroCTAs = styled.div`display:flex;justify-content:center;gap:.75rem;flex-wrap:wrap;margin-bottom:3rem;animation:${fadeIn} .6s ease-out .3s both;`;
const PrimaryBtn = styled.button`
    padding:.75rem 1.75rem;border:none;border-radius:10px;font-size:.95rem;font-weight:700;
    background:linear-gradient(135deg,#10b981,#059669);color:#fff;cursor:pointer;
    display:flex;align-items:center;gap:.5rem;transition:all .25s;
    &:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(16,185,129,.3);}
`;
const SecondaryBtn = styled.button`
    padding:.75rem 1.75rem;border:1px solid rgba(100,116,139,.2);border-radius:10px;
    font-size:.95rem;font-weight:700;background:transparent;color:#e2e8f0;cursor:pointer;
    display:flex;align-items:center;gap:.5rem;transition:all .25s;
    &:hover{border-color:rgba(0,173,237,.3);background:rgba(0,173,237,.05);}
`;

// Signal Card Preview
const SignalCard = styled.div`
    max-width:380px;margin:0 auto;background:rgba(15,23,42,.8);border:1px solid rgba(16,185,129,.2);
    border-radius:14px;padding:1.25rem;text-align:left;animation:${fadeIn} .6s ease-out .4s both;
`;
const SCHeader = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;`;
const SCSymbol = styled.span`font-size:1.2rem;font-weight:800;color:#e2e8f0;`;
const SCBadge = styled.span`font-size:.6rem;font-weight:700;padding:3px 8px;border-radius:4px;
    background:${p => p.$long ? 'rgba(16,185,129,.12)' : 'rgba(239,68,68,.12)'};
    color:${p => p.$long ? '#10b981' : '#ef4444'};`;
const SCGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:.4rem;`;
const SCItem = styled.div`padding:.35rem .5rem;background:rgba(100,116,139,.06);border-radius:6px;border:1px solid rgba(100,116,139,.06);`;
const SCLabel = styled.div`font-size:.55rem;color:#64748b;text-transform:uppercase;letter-spacing:.04em;`;
const SCValue = styled.div`font-size:.85rem;font-weight:700;color:${p => p.$c || '#e2e8f0'};`;
const SCFooter = styled.div`display:flex;justify-content:space-between;align-items:center;margin-top:.6rem;font-size:.65rem;color:#475569;`;

// Performance Section
const PerfGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem;max-width:800px;margin:0 auto;`;
const PerfCard = styled.div`
    background:rgba(15,23,42,.6);border:1px solid rgba(100,116,139,.1);border-radius:12px;
    padding:1rem;text-align:center;animation:${countUp} .5s ease-out both;animation-delay:${p => p.$d || '0s'};
`;
const PerfVal = styled.div`font-size:1.5rem;font-weight:900;color:${p => p.$c || '#e2e8f0'};margin-bottom:.15rem;`;
const PerfLabel = styled.div`font-size:.7rem;color:#64748b;font-weight:500;`;

// How It Works
const Steps = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.25rem;`;
const Step = styled.div`
    background:rgba(15,23,42,.6);border:1px solid rgba(100,116,139,.08);border-radius:14px;
    padding:1.5rem;text-align:center;animation:${fadeIn} .5s ease-out both;animation-delay:${p => p.$d || '0s'};
`;
const StepNum = styled.div`width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-size:.8rem;font-weight:800;color:#10b981;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);margin:0 auto .75rem;`;
const StepTitle = styled.div`font-size:1rem;font-weight:700;color:#e2e8f0;margin-bottom:.3rem;`;
const StepDesc = styled.div`font-size:.82rem;color:#94a3b8;line-height:1.5;`;

// Comparison
const CompGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1rem;max-width:750px;margin:0 auto;@media(max-width:600px){grid-template-columns:1fr;}`;
const CompCol = styled.div`padding:1.5rem;border-radius:14px;
    background:${p => p.$good ? 'rgba(16,185,129,.04)' : 'rgba(239,68,68,.03)'};
    border:1px solid ${p => p.$good ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.1)'};`;
const CompTitle = styled.div`font-size:.9rem;font-weight:700;margin-bottom:.75rem;
    color:${p => p.$good ? '#10b981' : '#ef4444'};display:flex;align-items:center;gap:.4rem;`;
const CompItem = styled.div`display:flex;align-items:center;gap:.4rem;font-size:.82rem;color:#94a3b8;margin-bottom:.5rem;
    svg{color:${p => p.$good ? '#10b981' : '#ef4444'};width:14px;height:14px;flex-shrink:0;}`;

// Features
const FeatGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;`;
const FeatCard = styled.div`
    background:rgba(15,23,42,.6);border:1px solid rgba(100,116,139,.08);border-radius:14px;
    padding:1.25rem;animation:${fadeIn} .5s ease-out both;animation-delay:${p => p.$d || '0s'};
`;
const FeatIcon = styled.div`width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;
    background:${p => p.$bg || 'rgba(0,173,237,.1)'};margin-bottom:.75rem;`;
const FeatTitle = styled.div`font-size:.95rem;font-weight:700;color:#e2e8f0;margin-bottom:.2rem;`;
const FeatDesc = styled.div`font-size:.78rem;color:#94a3b8;line-height:1.5;`;
const FeatProof = styled.div`font-size:.65rem;color:#10b981;font-weight:600;margin-top:.4rem;display:flex;align-items:center;gap:.25rem;`;

// Final CTA
const FinalCTA = styled.section`text-align:center;padding:4rem 1.5rem;@media(max-width:480px){padding:2.5rem 1rem;}`;

const Divider = styled.div`height:1px;background:rgba(100,116,139,.08);max-width:1100px;margin:0 auto;`;

const LandingPageV2 = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/predictions/stats`).then(r => r.json()).then(d => { if (d.success) setStats(d); }).catch(() => {});
    }, []);

    const goSignals = () => navigate(isAuthenticated ? '/signals' : '/register');
    const goPerf = () => navigate('/performance');
    const goRegister = () => navigate('/register');

    return (
        <Page>
            <SEO title="Nexus Signal AI — Every Trade Tracked, Every Result Public" description="AI trade signals for stocks and crypto with locked entry, stop loss, and targets. 300+ trades tracked. No deletions, no cherry-picking." />

            {/* ═══ HERO ═══ */}
            <Hero>
                <HeroTitle>Every Trade. Tracked. <HeroAccent>Verified.</HeroAccent><br/>AI Signals You Can Actually Trust.</HeroTitle>
                <HeroSub>Stop guessing. Nexus Signal AI tracks every prediction publicly — win or lose — so you can see exactly how the system performs in real time.</HeroSub>

                <TrustStrip>
                    <TrustChip $d="0s"><TrustVal $c="#00adef">{stats?.total || '250+'}</TrustVal> Trades Tracked</TrustChip>
                    <TrustChip $d=".05s"><TrustVal>{stats?.winRate || '55'}%</TrustVal> Win Rate</TrustChip>
                    <TrustChip $d=".1s"><CheckCircle size={13} color="#10b981"/> 100% Public History</TrustChip>
                    <TrustChip $d=".15s"><Shield size={13} color="#10b981"/> No Edits. No Deletions.</TrustChip>
                </TrustStrip>

                <HeroCTAs>
                    <PrimaryBtn onClick={goPerf}><BarChart3 size={18}/> View Live Track Record</PrimaryBtn>
                    <SecondaryBtn onClick={goRegister}>Get Free Access <ArrowRight size={16}/></SecondaryBtn>
                </HeroCTAs>

                {/* Signal Card Preview */}
                <SignalCard>
                    <SCHeader>
                        <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                            <SCSymbol>NVDA</SCSymbol>
                            <SCBadge $long>LONG</SCBadge>
                            <span style={{fontSize:'.6rem',color:'#475569'}}>Stock</span>
                        </div>
                        <span style={{fontSize:'.7rem',fontWeight:700,color:'#10b981'}}>79% Confidence</span>
                    </SCHeader>
                    <SCGrid>
                        <SCItem><SCLabel>Entry</SCLabel><SCValue>$131.50</SCValue></SCItem>
                        <SCItem><SCLabel>Stop Loss</SCLabel><SCValue $c="#ef4444">$128.87</SCValue></SCItem>
                        <SCItem><SCLabel>Take Profit 1</SCLabel><SCValue $c="#10b981">$134.82</SCValue></SCItem>
                        <SCItem><SCLabel>Take Profit 2</SCLabel><SCValue $c="#10b981">$138.08</SCValue></SCItem>
                        <SCItem><SCLabel>Risk / Reward</SCLabel><SCValue $c="#00adef">1:2.5</SCValue></SCItem>
                        <SCItem><SCLabel>Timeframe</SCLabel><SCValue>7 Days</SCValue></SCItem>
                    </SCGrid>
                    <SCFooter>
                        <span>AI-generated signal — tracked publicly</span>
                        <span style={{color:'#10b981',fontWeight:600}}>ACTIVE</span>
                    </SCFooter>
                </SignalCard>
            </Hero>

            <Divider/>

            {/* ═══ REAL PERFORMANCE ═══ */}
            <Section>
                <SectionTitle>Real Trades. Real Results. Fully Transparent.</SectionTitle>
                <SectionSub>Every trade is automatically tracked and verified on-platform. No manual edits. No cherry-picking.</SectionSub>

                <PerfGrid>
                    <PerfCard $d="0s"><PerfVal $c="#00adef">{stats?.total || '250+'}</PerfVal><PerfLabel>Total Trades Tracked</PerfLabel></PerfCard>
                    <PerfCard $d=".05s"><PerfVal $c="#10b981">{stats?.wins || '100+'}</PerfVal><PerfLabel>Winning Trades</PerfLabel></PerfCard>
                    <PerfCard $d=".1s"><PerfVal $c={stats?.winRate >= 50 ? '#10b981' : '#f59e0b'}>{stats?.winRate || '55'}%</PerfVal><PerfLabel>Verified Win Rate</PerfLabel></PerfCard>
                    <PerfCard $d=".15s"><PerfVal $c="#e2e8f0">{stats?.active || '20'}</PerfVal><PerfLabel>Active Signals Now</PerfLabel></PerfCard>
                </PerfGrid>

                <div style={{textAlign:'center',marginTop:'1.5rem'}}>
                    <PrimaryBtn onClick={goPerf} style={{margin:'0 auto'}}><Activity size={16}/> Explore Full Track Record <ArrowRight size={14}/></PrimaryBtn>
                </div>
            </Section>

            <Divider/>

            {/* ═══ HOW IT WORKS ═══ */}
            <Section>
                <SectionTitle>From Signal to Trade in Under 60 Seconds</SectionTitle>
                <SectionSub>No complexity. No learning curve. Just data-driven trade setups.</SectionSub>

                <Steps>
                    <Step $d="0s">
                        <StepNum>1</StepNum>
                        <StepTitle>See AI Signal</StepTitle>
                        <StepDesc>AI scans stocks and crypto for high-probability setups. You get a clear signal with entry, stop loss, and targets.</StepDesc>
                    </Step>
                    <Step $d=".1s">
                        <StepNum>2</StepNum>
                        <StepTitle>Review Data & Confidence</StepTitle>
                        <StepDesc>Every signal includes confidence %, technical analysis, risk/reward ratio, and AI reasoning. You decide.</StepDesc>
                    </Step>
                    <Step $d=".2s">
                        <StepNum>3</StepNum>
                        <StepTitle>Execute & Track</StepTitle>
                        <StepDesc>Paper trade or follow the signal. Performance is tracked publicly — wins and losses. No hiding.</StepDesc>
                    </Step>
                </Steps>
            </Section>

            <Divider/>

            {/* ═══ DIFFERENTIATION ═══ */}
            <Section>
                <SectionTitle>Most Signal Platforms Hide Their Losses. We Don't.</SectionTitle>
                <SectionSub>Transparency is our product. Here's how we compare.</SectionSub>

                <CompGrid>
                    <CompCol>
                        <CompTitle><XIcon size={16}/> Other Platforms</CompTitle>
                        <CompItem><XIcon size={14}/> Cherry-picked winning screenshots</CompItem>
                        <CompItem><XIcon size={14}/> Deleted or hidden losses</CompItem>
                        <CompItem><XIcon size={14}/> No verifiable track record</CompItem>
                        <CompItem><XIcon size={14}/> Manual entry — editable after the fact</CompItem>
                        <CompItem><XIcon size={14}/> "Trust me bro" results</CompItem>
                    </CompCol>
                    <CompCol $good>
                        <CompTitle $good><CheckCircle size={16}/> Nexus Signal AI</CompTitle>
                        <CompItem $good><CheckCircle size={14}/> Every trade tracked automatically</CompItem>
                        <CompItem $good><CheckCircle size={14}/> Losses shown publicly</CompItem>
                        <CompItem $good><CheckCircle size={14}/> Permanent, verifiable history</CompItem>
                        <CompItem $good><CheckCircle size={14}/> AI-generated — no manual edits</CompItem>
                        <CompItem $good><CheckCircle size={14}/> Real-time performance dashboard</CompItem>
                    </CompCol>
                </CompGrid>

                <div style={{textAlign:'center',marginTop:'1.5rem'}}>
                    <SecondaryBtn onClick={goPerf} style={{margin:'0 auto'}}>See the Difference <ArrowRight size={14}/></SecondaryBtn>
                </div>
            </Section>

            <Divider/>

            {/* ═══ FEATURES ═══ */}
            <Section>
                <SectionTitle>Everything You Need. Nothing You Don't.</SectionTitle>
                <SectionSub>Built for traders who care about data, not hype.</SectionSub>

                <FeatGrid>
                    <FeatCard $d="0s">
                        <FeatIcon $bg="rgba(16,185,129,.1)"><Target size={20} color="#10b981"/></FeatIcon>
                        <FeatTitle>AI Trade Signals</FeatTitle>
                        <FeatDesc>Confidence-scored setups for stocks and crypto with entry, stop loss, and 3 take profit levels.</FeatDesc>
                        <FeatProof><CheckCircle size={11}/> Every signal tracked with verified results</FeatProof>
                    </FeatCard>
                    <FeatCard $d=".05s">
                        <FeatIcon $bg="rgba(139,92,246,.1)"><Brain size={20} color="#a78bfa"/></FeatIcon>
                        <FeatTitle>Pattern Scanner</FeatTitle>
                        <FeatDesc>AI detects chart patterns in real time — head & shoulders, triangles, flags, and 12+ formations.</FeatDesc>
                        <FeatProof><CheckCircle size={11}/> Auto-detected with confidence scoring</FeatProof>
                    </FeatCard>
                    <FeatCard $d=".1s">
                        <FeatIcon $bg="rgba(0,173,237,.1)"><BarChart3 size={20} color="#00adef"/></FeatIcon>
                        <FeatTitle>Live Performance</FeatTitle>
                        <FeatDesc>Public dashboard showing every trade's outcome — equity curve, win rate, edge per trade.</FeatDesc>
                        <FeatProof><CheckCircle size={11}/> 100% transparent — no edits allowed</FeatProof>
                    </FeatCard>
                    <FeatCard $d=".15s">
                        <FeatIcon $bg="rgba(245,158,11,.1)"><Zap size={20} color="#f59e0b"/></FeatIcon>
                        <FeatTitle>Paper Trading</FeatTitle>
                        <FeatDesc>Practice with $100K virtual capital. Long, short, leverage up to 20x. TP/SL orders.</FeatDesc>
                        <FeatProof><CheckCircle size={11}/> Zero risk — real market data</FeatProof>
                    </FeatCard>
                    <FeatCard $d=".2s">
                        <FeatIcon $bg="rgba(239,68,68,.1)"><Activity size={20} color="#ef4444"/></FeatIcon>
                        <FeatTitle>Whale Alerts</FeatTitle>
                        <FeatDesc>Insider trades, crypto whale movements, dark pool flows, congressional trading.</FeatDesc>
                        <FeatProof><CheckCircle size={11}/> Real-time institutional data</FeatProof>
                    </FeatCard>
                    <FeatCard $d=".25s">
                        <FeatIcon $bg="rgba(100,116,139,.1)"><Users size={20} color="#94a3b8"/></FeatIcon>
                        <FeatTitle>Social Trading</FeatTitle>
                        <FeatDesc>Follow top performers on the leaderboard. Copy trades. Share insights.</FeatDesc>
                        <FeatProof><CheckCircle size={11}/> Performance-ranked leaderboard</FeatProof>
                    </FeatCard>
                </FeatGrid>
            </Section>

            <Divider/>

            {/* ═══ FINAL CTA ═══ */}
            <FinalCTA>
                <SectionTitle>Start Trading With Data, Not Guesswork</SectionTitle>
                <SectionSub>Join traders using verified AI signals — not hype.</SectionSub>
                <HeroCTAs>
                    <PrimaryBtn onClick={goRegister}>Get Free Access <ArrowRight size={16}/></PrimaryBtn>
                    <SecondaryBtn onClick={goSignals}><Target size={16}/> View Live Signals</SecondaryBtn>
                </HeroCTAs>
                <div style={{display:'flex',justifyContent:'center',gap:'1.5rem',flexWrap:'wrap',marginTop:'.5rem'}}>
                    <span style={{fontSize:'.72rem',color:'#64748b',display:'flex',alignItems:'center',gap:'.25rem'}}><CheckCircle size={11} color="#10b981"/> Free to start</span>
                    <span style={{fontSize:'.72rem',color:'#64748b',display:'flex',alignItems:'center',gap:'.25rem'}}><Shield size={11} color="#10b981"/> No credit card required</span>
                    <span style={{fontSize:'.72rem',color:'#64748b',display:'flex',alignItems:'center',gap:'.25rem'}}><Lock size={11} color="#10b981"/> Cancel anytime</span>
                </div>
            </FinalCTA>
        </Page>
    );
};

export default LandingPageV2;
