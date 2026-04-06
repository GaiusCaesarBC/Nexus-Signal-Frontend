// client/src/pages/SocialsPage.js — Community Socials Hub
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Send, ExternalLink, ThumbsUp, MessageSquare } from 'lucide-react';
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

                {/* Facebook */}
                <SocialCard
                    href="https://www.facebook.com/profile.php?id=61582448390461"
                    target="_blank" rel="noopener noreferrer"
                    $bg="rgba(24,119,242,.05)" $border="rgba(24,119,242,.12)"
                    $glow="rgba(24,119,242,.12)" $hoverBorder="rgba(24,119,242,.3)"
                    $delay=".2s"
                >
                    <CardTop>
                        <CardIcon $bg="rgba(24,119,242,.1)">
                            <ThumbsUp size={22} color="#1877f2"/>
                        </CardIcon>
                        <ExternalLink size={14} color="#64748b"/>
                    </CardTop>
                    <CardTitle>Facebook</CardTitle>
                    <CardDesc>Updates, trading insights, and community discussions. Like and follow our page.</CardDesc>
                    <CardCTA $c="#1877f2">Follow on Facebook <ExternalLink size={12}/></CardCTA>
                </SocialCard>

                {/* Discord */}
                <SocialCard
                    href="https://discord.gg/eXqRKJXS"
                    target="_blank" rel="noopener noreferrer"
                    $bg="rgba(88,101,242,.05)" $border="rgba(88,101,242,.12)"
                    $glow="rgba(88,101,242,.12)" $hoverBorder="rgba(88,101,242,.3)"
                    $delay=".3s"
                >
                    <CardTop>
                        <CardIcon $bg="rgba(88,101,242,.1)">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
                        </CardIcon>
                        <ExternalLink size={14} color="#64748b"/>
                    </CardTop>
                    <CardTitle>Discord</CardTitle>
                    <CardDesc>Join the community. Live signal alerts, trade discussions, and premium channels.</CardDesc>
                    <CardCTA $c="#5865F2">Join Discord Server <ExternalLink size={12}/></CardCTA>
                </SocialCard>
            </Grid>

        </Page>
    );
};

export default SocialsPage;
