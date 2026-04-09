// client/src/pages/leaderboard/SeasonBanner.js
//
// Weekly season countdown — refreshes every second so users feel the
// pressure of the reset deadline.

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Calendar, Trophy, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getSeasonCountdown } from './derive';
import { t, fadeIn } from '../marketReports/styles';

const pulse = keyframes`
    0%, 100% { box-shadow: 0 0 0 rgba(168, 85, 247, 0.0); }
    50%      { box-shadow: 0 0 24px rgba(168, 85, 247, 0.30); }
`;

const Wrap = styled.div`
    position: relative;
    border-radius: 14px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    background:
        radial-gradient(120% 120% at 0% 50%, rgba(168, 85, 247, 0.18) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.85)')};
    border: 1px solid rgba(168, 85, 247, 0.40);
    animation: ${fadeIn} 0.4s ease-out both, ${pulse} 4s ease-in-out infinite;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;

    &::before {
        content: '';
        position: absolute;
        inset: 0 0 auto 0;
        height: 2px;
        background: linear-gradient(90deg, #a855f7, #00adef);
    }
`;

const Left = styled.div`
    display: flex;
    align-items: center;
    gap: 0.85rem;
    min-width: 0;
`;

const IconBox = styled.div`
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.10));
    border: 1px solid rgba(168, 85, 247, 0.40);
    color: #c4b5fd;
    flex: 0 0 auto;
`;

const TextBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    .label {
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #c4b5fd;
    }
    .title {
        font-size: 1rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        line-height: 1.2;
    }
`;

const Countdown = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.95rem;
    border-radius: 10px;
    background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
    border: 1px solid rgba(168, 85, 247, 0.30);
    color: ${(p) => t(p, 'text.primary', '#f8fafc')};
    font-size: 0.95rem;
    font-weight: 800;
    font-feature-settings: 'tnum';
    font-variant-numeric: tabular-nums;

    svg { color: #c4b5fd; }
`;

const SeasonBanner = () => {
    const { theme } = useTheme();
    const [c, setC] = useState(getSeasonCountdown);

    useEffect(() => {
        const iv = setInterval(() => setC(getSeasonCountdown()), 1000);
        return () => clearInterval(iv);
    }, []);

    const compact = `${c.days}d ${String(c.hours).padStart(2, '0')}h ${String(c.minutes).padStart(2, '0')}m ${String(c.seconds).padStart(2, '0')}s`;

    return (
        <Wrap theme={theme}>
            <Left>
                <IconBox theme={theme}><Trophy size={18} /></IconBox>
                <TextBlock theme={theme}>
                    <span className="label">Weekly Season</span>
                    <span className="title">Climb the ranks before the reset</span>
                </TextBlock>
            </Left>
            <Countdown theme={theme}>
                <Clock size={14} />
                Ends in {compact}
            </Countdown>
        </Wrap>
    );
};

export default SeasonBanner;
