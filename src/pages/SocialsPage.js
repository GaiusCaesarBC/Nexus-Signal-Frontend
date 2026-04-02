// client/src/pages/SocialsPage.js — Community Socials Hub
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { MessageSquare, Send, ExternalLink } from 'lucide-react';
import SEO from '../components/SEO';

const fadeIn = keyframes`from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}`;

const Page = styled.div`min-height:100vh;padding:6rem 1.5rem 4rem;max-width:900px;margin:0 auto;`;

const Title = styled.h1`
    font-size:clamp(1.5rem,3vw,2rem);font-weight:900;color:#e2e8f0;margin-bottom:.25rem;
    display:flex;align-items:center;gap:.5rem;
`;
const Subtitle = styled.p`font-size:.9rem;color:#64748b;margin-bottom:2rem;`;

const Grid = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:2.5rem;`;

const SocialCard = styled.a`
    display:flex;flex-direction:column;gap:.75rem;padding:1.25rem;
    background:${p => p.$bg || 'rgba(100,116,139,.06)'};
    border:1px solid ${p => p.$border || 'rgba(100,116,139,.12)'};
    border-radius:14px;text-decoration:none;cursor:pointer;
    transition:all .25s ease;animation:${fadeIn} .5s ease-out both;
    animation-delay:${p => p.$delay || '0s'};
    &:hover{transform:translateY(-3px);box-shadow:0 8px 24px ${p => p.$glow || 'rgba(100,116,139,.1)'};border-color:${p => p.$hoverBorder || 'rgba(100,116,139,.25)'};}
`;
const CardTop = styled.div`display:flex;align-items:center;justify-content:space-between;`;
const CardIcon = styled.div`width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${p => p.$bg || 'rgba(100,116,139,.1)'};`;
const CardTitle = styled.h3`font-size:1rem;font-weight:700;color:#e2e8f0;margin:0;`;
const CardDesc = styled.p`font-size:.82rem;color:#94a3b8;margin:0;line-height:1.5;`;
const CardCTA = styled.div`
    display:inline-flex;align-items:center;gap:.35rem;font-size:.78rem;font-weight:600;
    color:${p => p.$c || '#00adef'};margin-top:auto;
`;

const Section = styled.div`margin-bottom:2rem;`;
const SectionTitle = styled.h2`font-size:1.1rem;font-weight:700;color:#e2e8f0;margin-bottom:.75rem;display:flex;align-items:center;gap:.4rem;`;

const EmbedContainer = styled.div`
    border-radius:12px;overflow:hidden;border:1px solid rgba(100,116,139,.12);
    background:rgba(100,116,139,.04);
`;

const SocialsPage = () => {
    return (
        <Page>
            <SEO title="Socials — Nexus Signal" description="Join the Nexus Signal community on Telegram, X, and Discord." />
            <Title><MessageSquare size={24} color="#00adef"/> Community & Socials</Title>
            <Subtitle>Join the conversation. Get signals, updates, and connect with traders.</Subtitle>

            <Grid>
                {/* Telegram */}
                <SocialCard
                    href="https://t.me/NexusSignalAI"
                    target="_blank" rel="noopener noreferrer"
                    $bg="rgba(0,136,204,.06)" $border="rgba(0,136,204,.15)"
                    $glow="rgba(0,136,204,.15)" $hoverBorder="rgba(0,136,204,.35)"
                    $delay="0s"
                >
                    <CardTop>
                        <CardIcon $bg="rgba(0,136,204,.12)">
                            <Send size={22} color="#0088cc"/>
                        </CardIcon>
                        <ExternalLink size={14} color="#64748b"/>
                    </CardTop>
                    <CardTitle>Telegram</CardTitle>
                    <CardDesc>Real-time signal alerts, daily recaps, and verified results delivered to your phone.</CardDesc>
                    <CardCTA $c="#0088cc">Join Channel <ExternalLink size={12}/></CardCTA>
                </SocialCard>

                {/* X / Twitter */}
                <SocialCard
                    href="https://twitter.com/nexussignalai"
                    target="_blank" rel="noopener noreferrer"
                    $bg="rgba(29,161,242,.04)" $border="rgba(29,161,242,.12)"
                    $glow="rgba(29,161,242,.12)" $hoverBorder="rgba(29,161,242,.3)"
                    $delay=".1s"
                >
                    <CardTop>
                        <CardIcon $bg="rgba(29,161,242,.1)">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1da1f2"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </CardIcon>
                        <ExternalLink size={14} color="#64748b"/>
                    </CardTop>
                    <CardTitle>X (Twitter)</CardTitle>
                    <CardDesc>Signal highlights, market commentary, and trade results posted daily.</CardDesc>
                    <CardCTA $c="#1da1f2">Follow @nexussignalai <ExternalLink size={12}/></CardCTA>
                </SocialCard>

                {/* Discord */}
                <SocialCard
                    href="https://discord.gg/knef4zSr"
                    target="_blank" rel="noopener noreferrer"
                    $bg="rgba(88,101,242,.05)" $border="rgba(88,101,242,.12)"
                    $glow="rgba(88,101,242,.12)" $hoverBorder="rgba(88,101,242,.3)"
                    $delay=".2s"
                >
                    <CardTop>
                        <CardIcon $bg="rgba(88,101,242,.1)">
                            <MessageSquare size={22} color="#5865f2"/>
                        </CardIcon>
                        <ExternalLink size={14} color="#64748b"/>
                    </CardTop>
                    <CardTitle>Discord</CardTitle>
                    <CardDesc>Chat with traders, discuss setups, get support, and access exclusive channels.</CardDesc>
                    <CardCTA $c="#5865f2">Join Server <ExternalLink size={12}/></CardCTA>
                </SocialCard>
            </Grid>

            {/* Latest from X */}
            <Section>
                <SectionTitle>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e2e8f0"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Latest from X
                </SectionTitle>
                <EmbedContainer>
                    <a
                        className="twitter-timeline"
                        data-theme="dark"
                        data-height="500"
                        data-chrome="noheader nofooter noborders transparent"
                        href="https://twitter.com/nexussignalai"
                    >
                        Loading tweets...
                    </a>
                    <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
                </EmbedContainer>
            </Section>
        </Page>
    );
};

export default SocialsPage;
