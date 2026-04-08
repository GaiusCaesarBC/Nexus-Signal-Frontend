// client/src/pages/portfolioAnalytics/AICoach.js
//
// Signature feature. One personalized coaching message generated from the
// user's actual performance data — feels like a personal coach, not a stat.

import React from 'react';
import styled from 'styled-components';
import { Sparkles, MessageCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { aiCoachMessage } from './derive';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    border-radius: 18px;
    padding: 1.5rem 1.65rem;
    margin-bottom: 1.5rem;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(168, 85, 247, 0.14) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(0, 173, 237, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.92)')};
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(0, 173, 237, 0.40)')};
    box-shadow: ${(p) => t(p, 'glow.primary', '0 0 30px rgba(0, 173, 237, 0.18)')};
    animation: ${fadeIn} 0.5s ease-out both;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 3px;
        background: linear-gradient(90deg, #a855f7, #00adef, #10b981);
    }
`;

const Layout = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 1rem;
`;

const Avatar = styled.div`
    flex: 0 0 auto;
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(0, 173, 237, 0.20));
    border: 1px solid ${(p) => t(p, 'border.primary', 'rgba(168, 85, 247, 0.40)')};
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
`;

const Eyebrow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: ${(p) => t(p, 'brand.primary', '#00adef')};
`;

const Title = styled.h2`
    margin: 0;
    font-size: 1.05rem;
    font-weight: 800;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
`;

const Message = styled.p`
    margin: 0;
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 1rem;
    line-height: 1.55;
    font-weight: 500;
`;

const AICoach = ({ analytics }) => {
    const { theme } = useTheme();
    const message = aiCoachMessage(analytics);

    return (
        <Wrap theme={theme}>
            <Layout>
                <Avatar theme={theme}>
                    <Sparkles size={26} />
                </Avatar>
                <Body>
                    <Eyebrow theme={theme}><MessageCircle size={12} /> AI Trading Coach</Eyebrow>
                    <Title theme={theme}>Your personalized coaching</Title>
                    <Message theme={theme}>{message}</Message>
                </Body>
            </Layout>
        </Wrap>
    );
};

export default AICoach;
