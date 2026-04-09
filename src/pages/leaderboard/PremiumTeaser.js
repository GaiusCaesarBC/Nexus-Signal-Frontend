// client/src/pages/leaderboard/PremiumTeaser.js
//
// Monetization hook rendered after the visible leaderboard rows. Sub-tle
// upgrade prompt with a soft-blur preview of additional ranks. Avoids
// hard-locking ranks since paid users may still be on the page.

import React from 'react';
import styled from 'styled-components';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { t, fadeIn } from '../marketReports/styles';

const Wrap = styled.div`
    position: relative;
    margin-top: 1rem;
    border-radius: 16px;
    overflow: hidden;
    background:
        radial-gradient(120% 120% at 0% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 55%),
        radial-gradient(120% 120% at 100% 100%, rgba(255, 215, 0, 0.10) 0%, transparent 55%),
        ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.92)')};
    border: 1px solid rgba(168, 85, 247, 0.35);
    animation: ${fadeIn} 0.5s ease-out both;
`;

const BlurredRows = styled.div`
    position: relative;
    padding: 1rem 1.25rem 0.5rem 1.25rem;
    filter: blur(4px);
    pointer-events: none;
    opacity: 0.6;

    .row {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.7rem 0.85rem;
        margin-bottom: 0.45rem;
        background: ${(p) => t(p, 'bg.cardSolid', 'rgba(15, 23, 42, 0.7)')};
        border-radius: 8px;

        .rank {
            font-weight: 800;
            color: ${(p) => t(p, 'text.tertiary', '#64748b')};
            min-width: 36px;
        }
        .name {
            flex: 1;
            color: ${(p) => t(p, 'text.primary', '#f8fafc')};
            font-weight: 700;
        }
        .stat {
            color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
            font-weight: 700;
        }
    }
`;

const Overlay = styled.div`
    padding: 1.25rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid rgba(168, 85, 247, 0.30);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
`;

const TextBlock = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    min-width: 0;

    .icon-box {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0.10));
        border: 1px solid rgba(168, 85, 247, 0.40);
        color: #c4b5fd;
    }

    .body { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
    .label {
        font-size: 0.62rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #c4b5fd;
    }
    .title {
        font-size: 1rem;
        font-weight: 800;
        color: ${(p) => t(p, 'text.primary', '#f8fafc')};
        line-height: 1.25;
    }
    .sub {
        font-size: 0.82rem;
        color: ${(p) => t(p, 'text.secondary', '#94a3b8')};
        line-height: 1.4;
    }
`;

const UpgradeBtn = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.1rem;
    border-radius: 12px;
    cursor: pointer;
    background: linear-gradient(135deg, #a855f7, #6366f1);
    color: #fff;
    border: none;
    font-size: 0.88rem;
    font-weight: 800;
    transition: transform 0.15s ease, box-shadow 0.18s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(168, 85, 247, 0.40);
    }
`;

const PremiumTeaser = ({ hiddenCount = 80, onUpgrade }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const go = onUpgrade || (() => navigate('/pricing'));

    return (
        <Wrap theme={theme}>
            <BlurredRows theme={theme}>
                {[1, 2, 3].map((i) => (
                    <div className="row" key={i}>
                        <span className="rank">#{20 + i}</span>
                        <span className="name">████████ ████</span>
                        <span className="stat">+██.█%</span>
                    </div>
                ))}
            </BlurredRows>
            <Overlay theme={theme}>
                <TextBlock theme={theme}>
                    <div className="icon-box"><Lock size={18} /></div>
                    <div className="body">
                        <span className="label">Premium</span>
                        <span className="title">Unlock the full leaderboard</span>
                        <span className="sub">
                            See all {hiddenCount > 0 ? `${hiddenCount}+ ` : ''}traders, follow anyone, and copy their setups.
                        </span>
                    </div>
                </TextBlock>
                <UpgradeBtn theme={theme} onClick={go}>
                    <Crown size={15} />
                    Upgrade to Premium
                    <ArrowRight size={14} />
                </UpgradeBtn>
            </Overlay>
        </Wrap>
    );
};

export default PremiumTeaser;
