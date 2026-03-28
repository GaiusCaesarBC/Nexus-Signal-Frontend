// client/src/pages/WhitepaperPage.js — Nexus Signal AI Whitepaper
import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import {
    FileText, Target, Rocket, Shield, Brain, Trophy, Users,
    Zap, Lock, Code, Calendar, AlertTriangle, CheckCircle,
    Star, TrendingUp, BarChart3, Activity, Radio, Eye,
    ArrowRight, Globe, MessageSquare
} from 'lucide-react';
import SEO from '../components/SEO';

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

// ─── Layout ───────────────────────────────────────────────
const Page = styled.div`min-height:100vh;padding-top:80px;color:#e0e6ed;`;
const Wrap = styled.div`max-width:860px;margin:0 auto;padding:3rem 2rem 5rem;animation:${fadeIn} .5s ease-out;@media(max-width:768px){padding:2rem 1.25rem 4rem;}`;

// ─── Header ───────────────────────────────────────────────
const Header = styled.div`text-align:center;margin-bottom:3.5rem;`;
const DocBadge = styled.div`display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .8rem;background:rgba(0,173,237,.08);border:1px solid rgba(0,173,237,.2);border-radius:100px;font-size:.75rem;font-weight:600;color:#00adef;margin-bottom:1.5rem;`;
const Title = styled.h1`font-size:clamp(2rem,4vw,2.8rem);font-weight:900;color:#fff;margin-bottom:.5rem;`;
const Tagline = styled.p`font-size:1.15rem;color:#94a3b8;margin-bottom:1rem;`;
const Version = styled.p`font-size:.8rem;color:#475569;`;

// ─── TOC ──────────────────────────────────────────────────
const TOC = styled.div`background:rgba(15,20,38,.8);border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:1.5rem;margin-bottom:3rem;`;
const TOCTitle = styled.h3`font-size:.95rem;font-weight:700;color:#e0e6ed;margin-bottom:1rem;display:flex;align-items:center;gap:.4rem;`;
const TOCGrid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;@media(max-width:600px){grid-template-columns:1fr;}`;
const TOCLink = styled.a`color:#64748b;text-decoration:none;font-size:.85rem;padding:.3rem 0;display:flex;align-items:center;gap:.4rem;transition:color .2s;&:hover{color:#00adef;}svg{width:14px;height:14px;color:#00adef;flex-shrink:0;}`;

// ─── Sections ─────────────────────────────────────────────
const Section = styled.section`margin-bottom:3rem;scroll-margin-top:100px;`;
const SH = styled.div`display:flex;align-items:center;gap:.6rem;margin-bottom:1.25rem;`;
const SIcon = styled.div`width:36px;height:36px;border-radius:10px;background:${p=>p.$bg||'rgba(0,173,237,.1)'};display:flex;align-items:center;justify-content:center;color:${p=>p.$c||'#00adef'};flex-shrink:0;`;
const STitle = styled.h2`font-size:1.4rem;font-weight:800;color:#e0e6ed;`;
const SubTitle = styled.h3`font-size:1.1rem;font-weight:700;color:#e0e6ed;margin:1.5rem 0 .75rem;display:flex;align-items:center;gap:.4rem;svg{width:16px;height:16px;color:#00adef;}`;
const P = styled.p`font-size:.95rem;color:#94a3b8;line-height:1.7;margin-bottom:1rem;&:last-child{margin-bottom:0;}`;
const UL = styled.ul`list-style:none;padding:0;margin:0 0 1rem;`;
const LI = styled.li`font-size:.92rem;color:#94a3b8;line-height:1.6;padding:.3rem 0 .3rem 1.5rem;position:relative;&::before{content:'';position:absolute;left:0;top:.7rem;width:6px;height:6px;background:#00adef;border-radius:50%;}`;

// ─── Cards ────────────────────────────────────────────────
const CardGrid = styled.div`display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;margin:1rem 0;`;
const Card = styled.div`background:rgba(15,20,38,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1.25rem;`;
const CardTitle = styled.h4`font-size:.95rem;font-weight:700;color:#e0e6ed;margin-bottom:.5rem;display:flex;align-items:center;gap:.4rem;svg{width:16px;height:16px;color:${p=>p.$c||'#00adef'};}`;
const CardText = styled.p`font-size:.85rem;color:#64748b;line-height:1.6;`;

// ─── Highlight / Warning boxes ────────────────────────────
const HighlightBox = styled.div`background:rgba(0,173,237,.04);border:1px solid rgba(0,173,237,.12);border-radius:12px;padding:1.25rem;margin:1.25rem 0;`;
const HBTitle = styled.h4`font-size:.9rem;font-weight:700;color:#00adef;margin-bottom:.5rem;display:flex;align-items:center;gap:.4rem;`;
const WarnBox = styled.div`background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.12);border-radius:12px;padding:1.25rem;margin:1.25rem 0;`;
const WarnTitle = styled.h4`font-size:.9rem;font-weight:700;color:#ef4444;margin-bottom:.5rem;display:flex;align-items:center;gap:.4rem;`;

// ─── Comparison Table ─────────────────────────────────────
const Table = styled.table`width:100%;border-collapse:collapse;margin:1rem 0;font-size:.85rem;`;
const TH = styled.th`text-align:left;padding:.65rem .75rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);color:#e0e6ed;font-weight:700;`;
const TD = styled.td`padding:.6rem .75rem;border:1px solid rgba(255,255,255,.04);color:#94a3b8;`;
const TDGreen = styled(TD)`color:#10b981;font-weight:600;`;
const TDRed = styled(TD)`color:#ef4444;`;

// ─── Roadmap ──────────────────────────────────────────────
const RMPhase = styled.div`background:rgba(15,20,38,.7);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:1.25rem;margin-bottom:1rem;position:relative;&::after{content:'';position:absolute;left:1.5rem;top:100%;width:2px;height:1rem;background:rgba(0,173,237,.2);}&:last-child::after{display:none;}`;
const RMBadge = styled.span`display:inline-block;padding:.2rem .6rem;border-radius:100px;font-size:.7rem;font-weight:700;margin-right:.5rem;background:${p=>p.$active?'rgba(0,173,237,.15)':'rgba(255,255,255,.04)'};color:${p=>p.$active?'#00adef':'#64748b'};border:1px solid ${p=>p.$active?'rgba(0,173,237,.25)':'rgba(255,255,255,.06)'};`;
const RMTitle = styled.span`font-size:1rem;font-weight:700;color:#e0e6ed;`;

// ─── Bottom ───────────────────────────────────────────────
const Bottom = styled.div`text-align:center;margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.04);`;
const CopyText = styled.p`font-size:.8rem;color:#475569;`;

// ═══════════════════════════════════════════════════════════
const WhitepaperPage = () => {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <Page>
            <SEO title="Whitepaper — Nexus Signal AI" description="The first AI signal platform that generates, tracks, and validates trading signals for stocks and crypto." />
            <Wrap>
                <Header>
                    <DocBadge><FileText size={14}/> Official Whitepaper</DocBadge>
                    <Title>Nexus Signal AI</Title>
                    <Tagline>AI-Powered Trading Signals. Tracked. Validated. Transparent.</Tagline>
                    <Version>Version 2.0 — March 2026</Version>
                </Header>

                {/* ─── Table of Contents ─── */}
                <TOC>
                    <TOCTitle><FileText size={16}/> Table of Contents</TOCTitle>
                    <TOCGrid>
                        <TOCLink href="#summary"><CheckCircle/> Executive Summary</TOCLink>
                        <TOCLink href="#problem"><AlertTriangle/> The Problem</TOCLink>
                        <TOCLink href="#solution"><Zap/> The Solution</TOCLink>
                        <TOCLink href="#product"><Rocket/> Product Overview</TOCLink>
                        <TOCLink href="#edge"><Star/> Why Nexus Signal Wins</TOCLink>
                        <TOCLink href="#signals"><Radio/> Live Signals System</TOCLink>
                        <TOCLink href="#social"><Users/> Social & Gamification</TOCLink>
                        <TOCLink href="#business"><TrendingUp/> Business Model</TOCLink>
                        <TOCLink href="#tech"><Code/> Technology</TOCLink>
                        <TOCLink href="#roadmap"><Calendar/> Roadmap</TOCLink>
                        <TOCLink href="#trust"><Shield/> Trust & Transparency</TOCLink>
                        <TOCLink href="#legal"><Lock/> Legal Disclaimer</TOCLink>
                    </TOCGrid>
                </TOC>

                {/* ═══ 1. EXECUTIVE SUMMARY ═══ */}
                <Section id="summary">
                    <SH><SIcon><Brain size={18}/></SIcon><STitle>Executive Summary</STitle></SH>
                    <P>Nexus Signal AI is a real-time AI signal platform that tells traders what to trade — and proves it works through tracked, validated performance.</P>
                    <P>Unlike traditional signal services that broadcast unverified calls with no accountability, Nexus Signal generates directional trading signals (LONG/SHORT) with entry prices, stop losses, take profit targets, and confidence scores — then tracks every signal to its outcome. Every prediction is measured. Every result is visible.</P>
                    <P>Supporting both stocks and crypto across thousands of assets, the platform combines machine learning analysis, technical pattern detection, and market sentiment data to deliver actionable trade setups in real time. Traders don't just receive signals — they receive a complete decision framework backed by data.</P>
                    <HighlightBox>
                        <HBTitle><Zap size={14}/> Core Value Proposition</HBTitle>
                        <P style={{marginBottom:0}}>Nexus Signal is the first AI trading platform that doesn't just generate signals — it tracks and validates every single one, creating a transparent, accountable record of performance that users and investors can trust.</P>
                    </HighlightBox>
                </Section>

                {/* ═══ 2. THE PROBLEM ═══ */}
                <Section id="problem">
                    <SH><SIcon $bg="rgba(239,68,68,.1)" $c="#ef4444"><AlertTriangle size={18}/></SIcon><STitle>The Problem</STitle></SH>
                    <P>The retail trading signal industry is broken. Millions of traders pay for signals from Telegram groups, Discord servers, and self-proclaimed "gurus" — with zero accountability, zero tracking, and zero proof that any of it works.</P>
                    <UL>
                        <LI><strong>Unverified signals everywhere.</strong> Most signal providers show only their wins. Losses disappear. There's no public record, no tracking, no audit trail.</LI>
                        <LI><strong>No feedback loop.</strong> Traders receive a signal, take the trade, and have no system to measure whether the signal was accurate over time. They're flying blind.</LI>
                        <LI><strong>Emotional decision-making.</strong> Without structured entries, exits, and confidence scoring, traders make impulsive decisions driven by fear and greed — not data.</LI>
                        <LI><strong>Zero trust infrastructure.</strong> The signal industry has no standard for transparency. Providers profit whether their signals work or not. Users have no way to verify claims.</LI>
                        <LI><strong>Fragmented tools.</strong> Traders juggle multiple platforms for signals, analysis, execution, and tracking. Nothing is connected. Nothing is measured end-to-end.</LI>
                    </UL>
                    <P>The result: most retail traders lose money, not because markets are impossible — but because the tools and information they rely on are fundamentally untrustworthy.</P>
                </Section>

                {/* ═══ 3. THE SOLUTION ═══ */}
                <Section id="solution">
                    <SH><SIcon $bg="rgba(16,185,129,.1)" $c="#10b981"><Zap size={18}/></SIcon><STitle>The Solution</STitle></SH>
                    <P>Nexus Signal AI replaces unverified signal noise with a structured, transparent, AI-driven trading intelligence platform.</P>
                    <P>Every signal includes:</P>
                    <UL>
                        <LI><strong>Direction</strong> — LONG or SHORT with clear reasoning</LI>
                        <LI><strong>Entry, Stop Loss, and Take Profit levels</strong> — TP1, TP2, TP3 with risk/reward ratios</LI>
                        <LI><strong>Confidence score</strong> — AI-generated probability assessment (0-100%)</LI>
                        <LI><strong>Supporting analysis</strong> — Technical indicators, pattern detection, sentiment data</LI>
                        <LI><strong>Real-time updates</strong> — Price progress, proximity alerts, expiry tracking</LI>
                        <LI><strong>Outcome tracking</strong> — Every signal is tracked to completion. TP hit, SL hit, or expired. No hiding.</LI>
                    </UL>
                    <P>This is not a signal service. It's a signal <em>system</em> — one that generates, tracks, validates, and improves over time.</P>
                </Section>

                {/* ═══ 4. PRODUCT OVERVIEW ═══ */}
                <Section id="product">
                    <SH><SIcon><Rocket size={18}/></SIcon><STitle>Product Overview</STitle></SH>
                    <P>The platform is built on three core pillars:</P>

                    <SubTitle><Brain size={16}/> A. AI Signal Engine</SubTitle>
                    <P>The signal engine continuously scans thousands of stocks and crypto assets using a hybrid analysis pipeline:</P>
                    <UL>
                        <LI><strong>Machine learning models</strong> — Trained on historical price data to detect directional patterns</LI>
                        <LI><strong>Technical indicator analysis</strong> — RSI, MACD, Bollinger Bands, moving averages, stochastic oscillators</LI>
                        <LI><strong>Pattern recognition</strong> — Chart patterns, support/resistance levels, breakout detection</LI>
                        <LI><strong>Sentiment analysis</strong> — Social media sentiment, news flow, and market mood indicators</LI>
                        <LI><strong>Smart asset selection</strong> — Hourly discovery pipeline ranks assets by liquidity, momentum, and relative volume</LI>
                    </UL>

                    <SubTitle><Eye size={16}/> B. Signal Tracking & Validation</SubTitle>
                    <P>This is the core differentiator. Every signal generated by Nexus Signal is tracked from creation to outcome:</P>
                    <CardGrid>
                        <Card>
                            <CardTitle $c="#10b981"><CheckCircle size={16}/> Accuracy Tracking</CardTitle>
                            <CardText>Platform-wide accuracy is calculated and displayed publicly. Every correct and incorrect prediction is counted.</CardText>
                        </Card>
                        <Card>
                            <CardTitle $c="#00adef"><BarChart3 size={16}/> Outcome Visibility</CardTitle>
                            <CardText>Closed signals show whether the target was hit, the stop was triggered, or the signal expired. No hidden results.</CardText>
                        </Card>
                        <Card>
                            <CardTitle $c="#f59e0b"><Activity size={16}/> Live Price Progress</CardTitle>
                            <CardText>Active signals show real-time price movement toward targets or stops, with contextual narrative and progress bars.</CardText>
                        </Card>
                    </CardGrid>

                    <SubTitle><Target size={16}/> C. Execution Layer</SubTitle>
                    <P>Users don't just watch signals — they act on them:</P>
                    <UL>
                        <LI><strong>Paper Trading</strong> — $100K simulated account to test signals risk-free with leverage support</LI>
                        <LI><strong>Copy Trade Setup</strong> — One click copies entry, SL, and TP levels to clipboard</LI>
                        <LI><strong>Track Trade</strong> — Follow specific signals and get proximity alerts as price approaches targets</LI>
                        <LI><strong>Brokerage Integration</strong> — Connect real accounts via Plaid for portfolio tracking</LI>
                    </UL>
                </Section>

                {/* ═══ 5. WHY NEXUS SIGNAL WINS ═══ */}
                <Section id="edge">
                    <SH><SIcon $bg="rgba(245,158,11,.1)" $c="#f59e0b"><Star size={18}/></SIcon><STitle>Why Nexus Signal Wins</STitle></SH>
                    <P>The competitive landscape is crowded with signal providers, trading tools, and AI platforms. Here's how Nexus Signal differentiates:</P>

                    <Table>
                        <thead>
                            <tr><TH>Capability</TH><TH>Telegram / Discord Groups</TH><TH>Traditional Tools</TH><TH>Nexus Signal AI</TH></tr>
                        </thead>
                        <tbody>
                            <tr><TD>Directional signals</TD><TDRed>Unstructured</TDRed><TD>Manual analysis</TD><TDGreen>AI-generated with confidence</TDGreen></tr>
                            <tr><TD>Entry / SL / TP levels</TD><TDRed>Sometimes, unverified</TDRed><TD>User-defined</TD><TDGreen>Auto-generated, tracked</TDGreen></tr>
                            <tr><TD>Performance tracking</TD><TDRed>None</TDRed><TDRed>Self-reported</TDRed><TDGreen>Every signal tracked publicly</TDGreen></tr>
                            <tr><TD>Outcome validation</TD><TDRed>None</TDRed><TDRed>None</TDRed><TDGreen>TP hit / SL hit / Expired</TDGreen></tr>
                            <tr><TD>Paper trading</TD><TDRed>No</TDRed><TD>Limited</TD><TDGreen>$100K simulated + leverage</TDGreen></tr>
                            <tr><TD>Stocks + Crypto</TD><TD>Usually one</TD><TD>Usually one</TD><TDGreen>Both, thousands of assets</TDGreen></tr>
                            <tr><TD>Accountability</TD><TDRed>Zero</TDRed><TDRed>Zero</TDRed><TDGreen>Full transparency</TDGreen></tr>
                        </tbody>
                    </Table>

                    <HighlightBox>
                        <HBTitle><Target size={14}/> The Core Difference</HBTitle>
                        <P style={{marginBottom:0}}>Others give you signals. Nexus Signal gives you signals + proof. That's the trust gap we close.</P>
                    </HighlightBox>
                </Section>

                {/* ═══ 6. LIVE SIGNALS SYSTEM ═══ */}
                <Section id="signals">
                    <SH><SIcon $bg="rgba(139,92,246,.1)" $c="#a78bfa"><Radio size={18}/></SIcon><STitle>Live Signals System</STitle></SH>
                    <P>The Live Signal Feed is the heart of the platform — a real-time stream of AI-generated trade setups that updates continuously.</P>

                    <SubTitle><Zap size={16}/> Hourly Asset Discovery</SubTitle>
                    <P>Every hour, the system runs a 5-step discovery pipeline:</P>
                    <UL>
                        <LI><strong>Liquidity filter</strong> — Removes illiquid assets, penny stocks, and stablecoins</LI>
                        <LI><strong>Movement filter</strong> — Ranks by price change, momentum, and relative volume spikes</LI>
                        <LI><strong>Multi-bucket assignment</strong> — Categorizes as Trending, Breakout Watch, or Reversal Setup</LI>
                        <LI><strong>Weighted scoring</strong> — Composite score (0-10) based on liquidity, movement, volume, momentum, volatility</LI>
                        <LI><strong>Signal generation</strong> — Top candidates analyzed by ML model, signals published if confidence threshold met</LI>
                    </UL>

                    <SubTitle><Activity size={16}/> Signal Lifecycle</SubTitle>
                    <CardGrid>
                        <Card><CardTitle $c="#10b981"><CheckCircle size={16}/> New</CardTitle><CardText>Just generated. Green glow pulse. Highest urgency for real-time users.</CardText></Card>
                        <Card><CardTitle $c="#f59e0b"><Activity size={16}/> Active</CardTitle><CardText>Being tracked. Live price updates, progress bar, proximity alerts.</CardText></Card>
                        <Card><CardTitle $c="#94a3b8"><Eye size={16}/> Closed</CardTitle><CardText>Outcome determined. TP hit, SL hit, or expired. Result recorded permanently.</CardText></Card>
                    </CardGrid>
                </Section>

                {/* ═══ 7. SOCIAL & GAMIFICATION ═══ */}
                <Section id="social">
                    <SH><SIcon $bg="rgba(139,92,246,.1)" $c="#a78bfa"><Users size={18}/></SIcon><STitle>Social & Gamification Layer</STitle></SH>
                    <P>Retention and engagement are driven by a performance-based social layer — not just badges and streaks.</P>
                    <UL>
                        <LI><strong>Leaderboards</strong> — Ranked by verified paper trading returns, not vanity metrics</LI>
                        <LI><strong>Public profiles</strong> — Trading stats, accuracy, and performance visible to the community</LI>
                        <LI><strong>93 achievements</strong> across 6 rarity tiers — earned through real trading milestones</LI>
                        <LI><strong>Nexus Coins economy</strong> — Earned through performance, spent on cosmetics and perks</LI>
                        <LI><strong>Social feed</strong> — Share predictions, discuss setups, follow top performers</LI>
                        <LI><strong>Copy trading</strong> — Follow top leaderboard traders and mirror their signals</LI>
                    </UL>
                    <P>The social layer isn't decoration — it creates accountability. When your performance is public, your reputation is on the line.</P>
                </Section>

                {/* ═══ 8. BUSINESS MODEL ═══ */}
                <Section id="business">
                    <SH><SIcon $bg="rgba(245,158,11,.1)" $c="#f59e0b"><TrendingUp size={18}/></SIcon><STitle>Business Model</STitle></SH>
                    <P>Nexus Signal operates on a freemium SaaS model. Users pay for access to higher-quality, real-time trading intelligence.</P>

                    <CardGrid>
                        <Card>
                            <CardTitle $c="#64748b"><Users size={16}/> Free Tier</CardTitle>
                            <CardText>Paper trading, delayed signals, basic gamification, social features, and community access. Designed to prove value before conversion.</CardText>
                        </Card>
                        <Card>
                            <CardTitle $c="#00adef"><Zap size={16}/> Premium Tiers</CardTitle>
                            <CardText>Real-time signals, full AI analysis, pattern scanner, sentiment data, advanced analytics, priority support, and API access. Tiered from Starter ($15/mo) to Elite ($125/mo).</CardText>
                        </Card>
                    </CardGrid>

                    <HighlightBox>
                        <HBTitle><Star size={14}/> 7-Day Free Trial</HBTitle>
                        <P style={{marginBottom:0}}>Every new user gets 7 days of full Premium access. No credit card required. The product sells itself when users see the signal quality.</P>
                    </HighlightBox>
                </Section>

                {/* ═══ 9. TECHNOLOGY ═══ */}
                <Section id="tech">
                    <SH><SIcon><Code size={18}/></SIcon><STitle>Technology Stack</STitle></SH>
                    <P>Built for reliability, speed, and scale.</P>
                    <UL>
                        <LI><strong>Frontend</strong> — React.js, styled-components, real-time UI updates</LI>
                        <LI><strong>Backend</strong> — Node.js / Express, RESTful API, WebSocket price streaming</LI>
                        <LI><strong>Database</strong> — MongoDB with TTL indexes, compound queries, aggregation pipelines</LI>
                        <LI><strong>ML Service</strong> — Python-based prediction engine with technical indicator analysis</LI>
                        <LI><strong>Price Data</strong> — Multi-source fallback chain: CryptoCompare, Binance US, Finnhub, Yahoo Finance, CoinCap</LI>
                        <LI><strong>Payments</strong> — Stripe for subscriptions, Plaid for brokerage connections</LI>
                        <LI><strong>Infrastructure</strong> — Vercel (frontend), Render (backend + ML), Cloudinary (media), SendGrid (email)</LI>
                    </UL>
                    <P>The multi-source price architecture ensures 99%+ data availability — if one provider fails, the system automatically falls through to the next.</P>
                </Section>

                {/* ═══ 10. ROADMAP ═══ */}
                <Section id="roadmap">
                    <SH><SIcon><Calendar size={18}/></SIcon><STitle>Roadmap</STitle></SH>

                    <RMPhase>
                        <RMBadge $active>Completed</RMBadge> <RMTitle>Phase 1 — Foundation</RMTitle>
                        <UL><LI>Core platform: paper trading, AI predictions, gamification, social</LI><LI>Live Signal Feed with Telegram-style trade alerts</LI><LI>Smart asset discovery pipeline (hourly volume + momentum scanning)</LI><LI>7-day free trial + Stripe subscription system</LI></UL>
                    </RMPhase>

                    <RMPhase>
                        <RMBadge $active>In Progress</RMBadge> <RMTitle>Phase 2 — Signal Intelligence</RMTitle>
                        <UL><LI>Signal accuracy improvement through ML model retraining</LI><LI>Advanced analytics dashboard (win rate, profit factor, drawdown)</LI><LI>Signal alerts (push, email, Telegram, Discord)</LI><LI>Enhanced pattern scanner + multi-timeframe analysis</LI></UL>
                    </RMPhase>

                    <RMPhase>
                        <RMBadge>Q3 2026</RMBadge> <RMTitle>Phase 3 — Scale</RMTitle>
                        <UL><LI>Native mobile app (iOS + Android)</LI><LI>Public API for signal access (developer/institutional tier)</LI><LI>Advanced social trading + strategy marketplace</LI><LI>Institutional-grade analytics and reporting</LI></UL>
                    </RMPhase>

                    <RMPhase>
                        <RMBadge>2027</RMBadge> <RMTitle>Phase 4 — Ecosystem</RMTitle>
                        <UL><LI>Broker-connected execution (trade directly from signals)</LI><LI>Custom AI model training for premium users</LI><LI>White-label signal API for partners</LI><LI>Global expansion + multi-language support</LI></UL>
                    </RMPhase>
                </Section>

                {/* ═══ 11. TRUST & TRANSPARENCY ═══ */}
                <Section id="trust">
                    <SH><SIcon $bg="rgba(16,185,129,.1)" $c="#10b981"><Shield size={18}/></SIcon><STitle>Trust & Transparency</STitle></SH>
                    <P>Trust is the foundation of Nexus Signal. Every design decision reinforces it:</P>
                    <UL>
                        <LI><strong>All signals are tracked.</strong> No cherry-picking. No deleting losses. The record is permanent.</LI>
                        <LI><strong>Platform accuracy is public.</strong> Total predictions, correct predictions, and accuracy rate are visible on the platform.</LI>
                        <LI><strong>No fake performance.</strong> We don't show hypothetical backtests as real results. Live signals are tracked from the moment they publish.</LI>
                        <LI><strong>User data is encrypted.</strong> AES-256 at rest, TLS in transit. Brokerage credentials are encrypted with separate keys.</LI>
                        <LI><strong>Two-factor authentication.</strong> Email and SMS 2FA protect every account.</LI>
                    </UL>
                    <P>In an industry built on hype, we're built on proof.</P>
                </Section>

                {/* ═══ 12. LEGAL DISCLAIMER ═══ */}
                <Section id="legal">
                    <WarnBox>
                        <WarnTitle><AlertTriangle size={14}/> Legal Disclaimer</WarnTitle>
                        <P>This whitepaper is for informational purposes only and does not constitute financial advice or investment recommendations.</P>
                        <P>Nexus Signal AI generates AI-powered trading signals for educational and analytical purposes. Signals should not be relied upon as accurate forecasts. Past performance does not guarantee future results. Trading involves substantial risk of loss.</P>
                        <P style={{marginBottom:0}}>Users should conduct their own research and consult qualified financial advisors before making investment decisions. Platform features, pricing, and specifications are subject to change.</P>
                    </WarnBox>
                </Section>

                <Bottom>
                    <CopyText>&copy; {new Date().getFullYear()} Nexus Signal AI. All rights reserved.</CopyText>
                </Bottom>
            </Wrap>
        </Page>
    );
};

export default WhitepaperPage;
