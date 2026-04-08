// client/src/pages/SectorRotationPage.js
//
// Sector Rotation & Money Flow Analysis — actionable redesign.
// All section UI lives in src/pages/sectorRotation/*. This file is a thin
// composer that fetches data and assembles the page.

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styled, { keyframes } from 'styled-components';
import { RefreshCw, ArrowRightLeft, Loader } from 'lucide-react';
import api from '../api/axios';
import { useSubscription } from '../context/SubscriptionContext';
import UpgradePrompt from '../components/UpgradePrompt';
import {
    WhereMoneyMoving,
    MarketBreadthCard,
    MarketCycleCard,
    SectorHeatmapCard,
    MoneyFlowCard,
    TradeThisRotation,
    AIInsightPanel,
    SectorTrendSparklines,
    normalizeSectors,
} from './sectorRotation';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: transparent;
    color: #e0e6ed;
`;

const Header = styled.div`
    max-width: 1400px;
    margin: 0 auto 2rem;
    animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 50%, #ffc107 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 1.75rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1rem;
`;

const Content = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: ${(p) => p.$cols || '1fr 1fr'};
    gap: 1.5rem;
    margin-bottom: 0;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const RefreshRow = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 8px;
    color: #00adef;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    transition: all 0.2s ease;

    &:hover { background: rgba(0, 173, 237, 0.2); }

    svg {
        animation: ${(p) => (p.$loading ? spin : 'none')} 1s linear infinite;
    }
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #94a3b8;

    svg {
        animation: ${spin} 1s linear infinite;
        margin-bottom: 1rem;
    }
`;

// ============ COMPONENT ============
const SectorRotationPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { canUseFeature } = useSubscription();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(!canUseFeature('hasSectorAnalysis'));

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [flowData, setFlowData] = useState(null);
    const [heatmapTimeframe, setHeatmapTimeframe] = useState('week');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, flowRes] = await Promise.all([
                api.get('/sector-rotation/overview'),
                api.get('/sector-rotation/flow'),
            ]);
            setData(overviewRes.data);
            setFlowData(flowRes.data);
        } catch (error) {
            console.error('Error fetching sector data:', error);
            showToast('Failed to fetch sector rotation data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // All sectors normalized once for the page (week is the canonical perf field).
    const sectorsAll = useMemo(
        () => normalizeSectors(data?.sectors || []),
        [data]
    );

    // The heatmap supports day/week/month — re-key the canonical `week` field
    // so the ranking inside SectorHeatmapCard reflects the chosen timeframe.
    const sectorsForTimeframe = useMemo(() => {
        if (heatmapTimeframe === 'week' || !sectorsAll.length) return sectorsAll;
        return sectorsAll.map((s) => ({
            ...s,
            week: heatmapTimeframe === 'day' ? s.day : s.month,
        }));
    }, [sectorsAll, heatmapTimeframe]);

    if (loading) {
        return (
            <PageContainer>
                <LoadingContainer>
                    <Loader size={48} />
                    <p>Loading sector rotation data...</p>
                </LoadingContainer>
            </PageContainer>
        );
    }

    return (
        <>
            <PageContainer>
                <Header>
                    <Title>
                        <ArrowRightLeft size={32} />
                        Sector Rotation
                    </Title>
                    <Subtitle>Where money is flowing — and what to do about it</Subtitle>
                </Header>

                <Content>
                    <RefreshRow>
                        <RefreshButton onClick={fetchData} $loading={loading}>
                            <RefreshCw size={16} /> Refresh
                        </RefreshButton>
                    </RefreshRow>

                    {/* 1. HERO — where money is moving right now (top priority) */}
                    <WhereMoneyMoving sectors={sectorsAll} />

                    {/* 2. Punchy AI insight (action-focused, replaces generic prose) */}
                    <AIInsightPanel sectors={sectorsAll} rotationPhase={data?.rotationPhase} />

                    {/* 3. Breadth + Cycle (side-by-side on desktop) */}
                    <Grid $cols="2fr 1fr">
                        <MarketBreadthCard
                            marketBreadth={data?.marketBreadth}
                            sectors={sectorsAll}
                        />
                        <MarketCycleCard rotationPhase={data?.rotationPhase} />
                    </Grid>

                    {/* 4. Concrete trade ideas derived from the rotation */}
                    <TradeThisRotation sectors={sectorsAll} />

                    {/* 5. Upgraded heatmap (ranked + momentum + click-through) */}
                    <SectorHeatmapCard
                        sectors={sectorsForTimeframe}
                        timeframe={heatmapTimeframe}
                        onTimeframeChange={setHeatmapTimeframe}
                    />

                    {/* 6. Money flow split with rotation insight */}
                    <MoneyFlowCard sectors={sectorsAll} flowData={flowData} />

                    {/* 7. Sparkline trend cards for top sectors */}
                    <SectorTrendSparklines sectors={sectorsAll} />
                </Content>
            </PageContainer>

            <UpgradePrompt
                isOpen={showUpgradePrompt}
                onClose={() => setShowUpgradePrompt(false)}
                feature="hasSectorAnalysis"
                requiredPlan="premium"
            />
        </>
    );
};

export default SectorRotationPage;
