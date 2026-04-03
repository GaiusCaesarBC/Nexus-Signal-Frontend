// client/src/components/Footer.js — Premium Fintech Footer
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import {
    Send, Github, MessageSquare, ArrowRight,
    TrendingUp, Zap, Brain, Shield, CheckCircle, Lock,
    Radio, BarChart3, Activity, Target, Users
} from 'lucide-react';

// ─── Animations ───────────────────────────────────────────
const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;
const shimmer = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;

// ─── CTA Strip (above footer) ─────────────────────────────
const CTAStrip = styled.section`
    padding:4rem 2rem;text-align:center;position:relative;
    background:linear-gradient(180deg,transparent 0%,rgba(0,173,237,.03) 50%,transparent 100%);
    @media(max-width:768px){padding:3rem 1.25rem;}
`;

const CTACard = styled.div`
    max-width:800px;margin:0 auto;
    background:linear-gradient(135deg,rgba(0,173,237,.06),rgba(139,92,246,.06));
    border:1px solid rgba(0,173,237,.15);border-radius:20px;
    padding:3.5rem 3rem;position:relative;overflow:hidden;
    &::before{content:'';position:absolute;inset:0;background:linear-gradient(45deg,transparent 30%,rgba(0,173,237,.03) 50%,transparent 70%);background-size:200% 200%;animation:${shimmer} 5s linear infinite;}
    @media(max-width:768px){padding:2.5rem 1.5rem;}
`;

const CTATitle = styled.h2`font-size:clamp(1.5rem,3vw,2.2rem);font-weight:900;color:#e0e6ed;margin-bottom:.75rem;position:relative;z-index:1;`;
const CTASub = styled.p`font-size:1rem;color:#94a3b8;margin-bottom:2rem;max-width:450px;margin-left:auto;margin-right:auto;line-height:1.6;position:relative;z-index:1;`;

const CTABtn = styled.button`
    padding:1rem 2.25rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;color:#fff;border-radius:12px;font-size:1.1rem;font-weight:700;
    cursor:pointer;display:inline-flex;align-items:center;gap:.6rem;
    transition:all .25s;position:relative;z-index:1;
    &:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,173,237,.35);}
`;

const TrustRow = styled.div`
    display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap;
    margin-top:1.5rem;position:relative;z-index:1;
`;
const TrustItem = styled.span`
    display:flex;align-items:center;gap:.35rem;font-size:.8rem;color:#64748b;
    svg{width:14px;height:14px;color:#10b981;}
`;

// ─── Footer ───────────────────────────────────────────────
const FooterWrap = styled.footer`
    width:100%;border-top:1px solid rgba(255,255,255,.06);
    background:#030712;
    position:relative;z-index:10;
`;

const Inner = styled.div`
    max-width:1400px;margin:0 auto;padding:4rem 2rem 0;
    animation:${fadeIn} .6s ease-out;
    @media(max-width:768px){padding:3rem 1.25rem 0;}
`;

const Grid = styled.div`
    display:grid;grid-template-columns:2.2fr 1fr 1fr 1.8fr;gap:3rem;margin-bottom:3rem;
    @media(max-width:1024px){grid-template-columns:1fr 1fr;gap:2rem;}
    @media(max-width:600px){grid-template-columns:1fr;gap:2rem;}
`;

const Col = styled.div`display:flex;flex-direction:column;gap:.75rem;`;

// ─── Brand ────────────────────────────────────────────────
const Logo = styled(Link)`
    display:flex;align-items:center;gap:.6rem;text-decoration:none;
    font-size:1.5rem;font-weight:800;color:#00adef;margin-bottom:.25rem;
    &:hover{opacity:.9;}
`;

const BrandDesc = styled.p`font-size:.9rem;color:#94a3b8;line-height:1.6;margin-bottom:.5rem;`;

const TrustBadges = styled.div`display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:.75rem;`;
const TBadge = styled.span`
    padding:.2rem .6rem;border-radius:4px;font-size:.65rem;font-weight:600;
    background:rgba(16,185,129,.06);color:#10b981;border:1px solid rgba(16,185,129,.12);
    letter-spacing:.3px;
`;

const Socials = styled.div`display:flex;gap:.6rem;`;
const SocialBtn = styled.a`
    width:36px;height:36px;border-radius:8px;
    background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);
    display:flex;align-items:center;justify-content:center;
    color:#64748b;text-decoration:none;transition:all .2s;
    &:hover{color:#00adef;border-color:rgba(0,173,237,.3);background:rgba(0,173,237,.08);
        transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,173,237,.15);}
`;

// ─── Columns ──────────────────────────────────────────────
const ColTitle = styled.h4`
    font-size:.85rem;font-weight:700;color:#e0e6ed;margin-bottom:.25rem;
    text-transform:uppercase;letter-spacing:.5px;
`;

const FLink = styled(Link)`
    color:#64748b;text-decoration:none;font-size:.88rem;transition:all .2s;
    display:flex;align-items:center;gap:.35rem;padding:.15rem 0;
    &:hover{color:#00adef;transform:translateX(3px);}
`;

const ExtLink = styled.a`
    color:#64748b;text-decoration:none;font-size:.88rem;transition:all .2s;
    display:flex;align-items:center;gap:.35rem;padding:.15rem 0;
    &:hover{color:#00adef;transform:translateX(3px);}
`;

const NewBadge = styled.span`
    font-size:.55rem;font-weight:700;padding:.1rem .35rem;border-radius:3px;
    background:rgba(16,185,129,.12);color:#10b981;border:1px solid rgba(16,185,129,.2);
    text-transform:uppercase;letter-spacing:.3px;
`;

// ─── Newsletter / CTA Block ──────────────────────────────
const SignupCol = styled(Col)``;
const SignupTitle = styled.h4`font-size:1.05rem;font-weight:700;color:#e0e6ed;margin-bottom:.15rem;`;
const SignupSub = styled.p`font-size:.82rem;color:#64748b;margin-bottom:.5rem;`;

const SignupForm = styled.form`display:flex;gap:.4rem;`;
const SignupInput = styled.input`
    flex:1;padding:.65rem .85rem;background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.08);border-radius:8px;
    color:#e0e6ed;font-size:.88rem;transition:all .2s;
    &::placeholder{color:#475569;}
    &:focus{outline:none;border-color:rgba(0,173,237,.3);background:rgba(0,173,237,.06);}
`;
const SignupBtn = styled.button`
    padding:.65rem 1rem;background:linear-gradient(135deg,#00adef,#0090d0);
    border:none;border-radius:8px;color:#fff;font-weight:700;font-size:.85rem;
    cursor:pointer;display:flex;align-items:center;gap:.3rem;white-space:nowrap;
    transition:all .2s;
    &:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,173,237,.3);}
`;
const MicroTrust = styled.p`font-size:.7rem;color:#475569;margin-top:.25rem;`;

// ─── Data & Infrastructure ────────────────────────────────
const InfraSection = styled.div`
    border-top:1px solid rgba(255,255,255,.04);padding:1.75rem 0;margin-bottom:.5rem;
`;
const InfraTitle = styled.div`
    text-align:center;font-size:.65rem;color:#475569;
    text-transform:uppercase;letter-spacing:2px;font-weight:600;margin-bottom:1rem;
`;
const InfraGrid = styled.div`
    display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:.75rem 1.5rem;
`;
const InfraItem = styled.a`
    color:#475569;text-decoration:none;font-size:.78rem;font-weight:500;
    opacity:.6;transition:all .2s;display:flex;align-items:center;gap:.35rem;
    &:hover{opacity:1;color:#94a3b8;}
    svg{width:14px;height:14px;}
`;

// ─── Bottom Bar ───────────────────────────────────────────
const BottomBar = styled.div`
    border-top:1px solid rgba(255,255,255,.04);
    padding:1.5rem 0;display:flex;justify-content:space-between;align-items:center;
    flex-wrap:wrap;gap:1rem;
    @media(max-width:768px){flex-direction:column;text-align:center;}
`;
const CopyText = styled.p`font-size:.8rem;color:#475569;margin:0;`;
const LegalRow = styled.div`display:flex;gap:1.25rem;flex-wrap:wrap;@media(max-width:768px){justify-content:center;}`;
const LegalLink = styled(Link)`color:#475569;text-decoration:none;font-size:.78rem;transition:color .2s;&:hover{color:#94a3b8;}`;
const Disclaimer = styled.p`
    width:100%;text-align:center;font-size:.7rem;color:#374151;margin-top:.5rem;
`;

// ═══════════════════════════════════════════════════════════
const Footer = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const { isSubscribed, trial } = useSubscription();

    const handleSignup = (e) => {
        e.preventDefault();
        if (email) { alert('Thanks for signing up!'); setEmail(''); }
    };

    return (
        <>
            {/* ─── Pre-Footer CTA Strip (hidden for paid/trial users) ─── */}
            {!isSubscribed && !trial?.active && <CTAStrip>
                <CTACard>
                    <CTATitle>Start Finding Better Trades Today</CTATitle>
                    <CTASub>7-day free Premium trial. Full access to AI signals, pattern scanning, and $100K paper trading. No risk.</CTASub>
                    <CTABtn onClick={() => navigate('/register')}>
                        Get Free Access Now <ArrowRight size={18} />
                    </CTABtn>
                    <TrustRow>
                        <TrustItem><CheckCircle /> No credit card required</TrustItem>
                        <TrustItem><Lock size={14} /> 256-bit encryption</TrustItem>
                        <TrustItem><Shield size={14} /> Cancel anytime</TrustItem>
                    </TrustRow>
                </CTACard>
            </CTAStrip>}

            {/* ─── Footer ─── */}
            <FooterWrap>
                <Inner>
                    <Grid>
                        {/* Brand + Trust */}
                        <Col>
                            <Logo to="/"><Brain size={24} /> Nexus Signal</Logo>
                            <BrandDesc>
                                AI-powered trading signals for stocks & crypto — built for traders who want an edge.
                            </BrandDesc>
                            <TrustBadges>
                                <TBadge>Real-Time Signals</TBadge>
                                <TBadge>Tracked Performance</TBadge>
                                <TBadge>Data Driven</TBadge>
                            </TrustBadges>
                            <Socials>
                                <SocialBtn href="https://twitter.com/nexussignalai" target="_blank" rel="noopener noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></SocialBtn>
                                <SocialBtn href="https://github.com/GaiusCaesarBC" target="_blank" rel="noopener noreferrer"><Github size={16} /></SocialBtn>
                                <SocialBtn href="https://discord.gg/knef4zSr" target="_blank" rel="noopener noreferrer"><MessageSquare size={16} /></SocialBtn>
                            </Socials>
                        </Col>

                        {/* Product */}
                        <Col>
                            <ColTitle>Product</ColTitle>
                            <FLink to="/signals">Live Signals <NewBadge>New</NewBadge></FLink>
                            <FLink to="/predict">AI Signals</FLink>
                            <FLink to="/pattern-scanner">Pattern Scanner</FLink>
                            <FLink to="/sentiment">Sentiment Analysis</FLink>
                            <FLink to="/paper-trading">Paper Trading</FLink>
                            <FLink to="/backtesting">Backtesting</FLink>
                            <FLink to="/pricing">Pricing</FLink>
                        </Col>

                        {/* Company */}
                        <Col>
                            <ColTitle>Company</ColTitle>
                            <FLink to="/about">About</FLink>
                            <FLink to="/leaderboard">Leaderboard</FLink>
                            <FLink to="/pricing">Plans & Pricing</FLink>
                            <FLink to="/whitepaper">Whitepaper</FLink>
                            <ExtLink href="mailto:support@nexussignal.ai">Contact</ExtLink>
                        </Col>

                        {/* Signup / CTA Block */}
                        <SignupCol>
                            <SignupTitle>Get High-Probability Trade Setups</SignupTitle>
                            <SignupSub>Real signals. No noise. Delivered daily.</SignupSub>
                            <SignupForm onSubmit={handleSignup}>
                                <SignupInput
                                    type="email" placeholder="Your email"
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                />
                                <SignupBtn type="submit">Get Free Signals</SignupBtn>
                            </SignupForm>
                            <MicroTrust>No spam. Unsubscribe anytime.</MicroTrust>
                        </SignupCol>
                    </Grid>

                    {/* Data & Infrastructure */}
                    <InfraSection>
                        <InfraTitle>Data & Infrastructure</InfraTitle>
                        <InfraGrid>
                            <InfraItem href="https://www.alphavantage.co" target="_blank" rel="noopener noreferrer"><TrendingUp size={14}/>Alpha Vantage</InfraItem>
                            <InfraItem href="https://finance.yahoo.com" target="_blank" rel="noopener noreferrer"><BarChart3 size={14}/>Yahoo Finance</InfraItem>
                            <InfraItem href="https://www.cryptocompare.com" target="_blank" rel="noopener noreferrer"><Activity size={14}/>CryptoCompare</InfraItem>
                            <InfraItem href="https://stripe.com" target="_blank" rel="noopener noreferrer"><Zap size={14}/>Stripe</InfraItem>
                            <InfraItem href="https://plaid.com" target="_blank" rel="noopener noreferrer"><Shield size={14}/>Plaid</InfraItem>
                            <InfraItem href="https://sendgrid.com" target="_blank" rel="noopener noreferrer"><Send size={14}/>SendGrid</InfraItem>
                            <InfraItem href="https://cloudinary.com" target="_blank" rel="noopener noreferrer"><Target size={14}/>Cloudinary</InfraItem>
                        </InfraGrid>
                    </InfraSection>

                    {/* Bottom Bar */}
                    <BottomBar>
                        <CopyText>&copy; {new Date().getFullYear()} Nexus Signal AI. All rights reserved. Made with <span style={{color:'#ef4444'}}>&hearts;</span> in the USA. Veteran owned and operated.</CopyText>
                        <LegalRow>
                            <LegalLink to="/terms">Terms</LegalLink>
                            <LegalLink to="/privacy">Privacy</LegalLink>
                            <LegalLink to="/disclaimer">Disclaimer</LegalLink>
                            <LegalLink to="/cookie-policy">Cookies</LegalLink>
                        </LegalRow>
                    </BottomBar>
                    <Disclaimer>
                        Nexus Signal AI does not provide financial advice. Trading involves risk. Past performance does not guarantee future results.
                    </Disclaimer>
                </Inner>
            </FooterWrap>
        </>
    );
};

export default Footer;
