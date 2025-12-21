// client/src/components/CopyTradingModal.js - Copy Trading Configuration Modal
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    X, Copy, Settings, TrendingUp, TrendingDown,
    DollarSign, Percent, Shield, Bell, Pause, Play,
    AlertCircle, CheckCircle, Users, Activity
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const fadeIn = keyframes`
    from { opacity: 0; }
    to { opacity: 1; }
`;

const slideUp = keyframes`
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`;

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: ${fadeIn} 0.2s ease;
    padding: 1rem;
`;

const Modal = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.95)'};
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    width: 100%;
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    animation: ${slideUp} 0.3s ease;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const TraderAvatar = styled.div`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 700;
    color: white;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const HeaderInfo = styled.div`
    h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    }
    p {
        margin: 0.25rem 0 0;
        font-size: 0.85rem;
        color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    }
`;

const CloseButton = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
    }
`;

const Content = styled.div`
    padding: 1.5rem;
`;

const TraderStats = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    padding: 0.75rem;
    text-align: center;

    .label {
        font-size: 0.7rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 0.25rem;
    }

    .value {
        font-size: 1.1rem;
        font-weight: 700;
        color: ${props => props.$color || '#e2e8f0'};
    }
`;

const SectionTitle = styled.h3`
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const SettingsGroup = styled.div`
    background: rgba(0, 0, 0, 0.15);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
`;

const SettingRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;

    &:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
`;

const SettingLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};

    svg {
        color: #64748b;
    }
`;

const SliderContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const Slider = styled.input`
    width: 100px;
    height: 4px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.1);
    appearance: none;
    cursor: pointer;

    &::-webkit-slider-thumb {
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #3b82f6;
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
            transform: scale(1.1);
        }
    }
`;

const SliderValue = styled.span`
    min-width: 50px;
    text-align: right;
    font-size: 0.85rem;
    font-weight: 600;
    color: #3b82f6;
`;

const Toggle = styled.button`
    width: 48px;
    height: 26px;
    border-radius: 13px;
    border: none;
    background: ${props => props.$active ? '#10b981' : 'rgba(255, 255, 255, 0.1)'};
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: ${props => props.$active ? '25px' : '3px'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: white;
        transition: all 0.2s;
    }
`;

const Select = styled.select`
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};
    font-size: 0.85rem;
    cursor: pointer;

    option {
        background: #1e293b;
    }
`;

const AssetToggles = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const AssetToggle = styled.button`
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${props => props.$active ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)'};
    background: ${props => props.$active ? 'rgba(59, 130, 246, 0.2)' : 'transparent'};
    color: ${props => props.$active ? '#3b82f6' : '#94a3b8'};
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        border-color: #3b82f6;
    }
`;

const DirectionToggles = styled.div`
    display: flex;
    gap: 0.5rem;
`;

const DirectionToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    border-radius: 8px;
    border: 1px solid ${props => props.$active
        ? (props.$direction === 'up' ? '#10b981' : '#ef4444')
        : 'rgba(255, 255, 255, 0.1)'};
    background: ${props => props.$active
        ? (props.$direction === 'up' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
        : 'transparent'};
    color: ${props => props.$active
        ? (props.$direction === 'up' ? '#10b981' : '#ef4444')
        : '#94a3b8'};
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
`;

const Footer = styled.div`
    display: flex;
    gap: 0.75rem;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Button = styled.button`
    flex: 1;
    padding: 0.875rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border: none;
    color: white;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.text?.primary || '#e2e8f0'};

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.15);
    }
`;

const DangerButton = styled(Button)`
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.3);
    }
`;

const CopyTradingModal = ({ trader, isOpen, onClose, onSuccess }) => {
    const { theme } = useTheme();
    const { api } = useAuth();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [copyStatus, setCopyStatus] = useState(null); // null | { isCopying, isPaused, settings, stats }

    // Settings state
    const [settings, setSettings] = useState({
        allocationPercent: 10,
        maxAmountPerTrade: 1000,
        maxActiveTrades: 10,
        copyAssetTypes: { stocks: true, crypto: true, dex: false },
        minConfidence: 60,
        minSignalStrength: 'moderate',
        copyDirections: { up: true, down: true },
        enableStopLoss: true,
        stopLossPercent: 10,
        enableTakeProfit: false,
        takeProfitPercent: 20,
        notifyOnCopy: true
    });

    // Check current copy status
    useEffect(() => {
        if (!isOpen || !trader?.userId) return;

        const checkStatus = async () => {
            setCheckingStatus(true);
            try {
                const response = await api.get(`/social/copy/check/${trader.userId}`);
                setCopyStatus(response.data);
                if (response.data.settings) {
                    setSettings(response.data.settings);
                }
            } catch (error) {
                console.error('Error checking copy status:', error);
                setCopyStatus({ isCopying: false });
            } finally {
                setCheckingStatus(false);
            }
        };

        checkStatus();
    }, [isOpen, trader?.userId, api]);

    const handleStartCopy = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/social/copy/${trader.userId}`, settings);
            toast.success(`Started copying ${trader.displayName || trader.username}!`);
            setCopyStatus({ isCopying: true, isPaused: false, settings, stats: {} });
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to start copy trading');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async () => {
        setLoading(true);
        try {
            await api.put(`/social/copy/${trader.userId}`, settings);
            toast.success('Copy trading settings updated');
            setCopyStatus(prev => ({ ...prev, settings }));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const handlePauseResume = async () => {
        setLoading(true);
        try {
            if (copyStatus.isPaused) {
                await api.post(`/social/copy/${trader.userId}/resume`);
                toast.success('Copy trading resumed');
                setCopyStatus(prev => ({ ...prev, isPaused: false }));
            } else {
                await api.post(`/social/copy/${trader.userId}/pause`);
                toast.success('Copy trading paused');
                setCopyStatus(prev => ({ ...prev, isPaused: true }));
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to pause/resume');
        } finally {
            setLoading(false);
        }
    };

    const handleStopCopy = async () => {
        if (!window.confirm(`Stop copying ${trader.displayName || trader.username}? This will close all active copied positions.`)) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.delete(`/social/copy/${trader.userId}`);
            toast.success('Stopped copy trading');
            setCopyStatus({ isCopying: false });
            onSuccess?.();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to stop copy trading');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isCopying = copyStatus?.isCopying || copyStatus?.isPaused;

    return (
        <Overlay onClick={onClose}>
            <Modal theme={theme} onClick={e => e.stopPropagation()}>
                <Header>
                    <HeaderLeft>
                        <TraderAvatar>
                            {trader.avatar ? (
                                <img src={trader.avatar} alt={trader.displayName} />
                            ) : (
                                (trader.displayName || trader.username || 'T')[0].toUpperCase()
                            )}
                        </TraderAvatar>
                        <HeaderInfo theme={theme}>
                            <h2>{isCopying ? 'Copy Trading Settings' : 'Copy Trader'}</h2>
                            <p>@{trader.username}</p>
                        </HeaderInfo>
                    </HeaderLeft>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>
                </Header>

                <Content>
                    {/* Trader Stats */}
                    <TraderStats>
                        <StatCard $color="#10b981">
                            <div className="label">Win Rate</div>
                            <div className="value">{(trader.winRate || trader.stats?.winRate || 0).toFixed(1)}%</div>
                        </StatCard>
                        <StatCard $color="#3b82f6">
                            <div className="label">Total Trades</div>
                            <div className="value">{trader.totalTrades || trader.stats?.totalTrades || 0}</div>
                        </StatCard>
                        <StatCard>
                            <div className="label">Copiers</div>
                            <div className="value">{trader.copiersCount || 0}</div>
                        </StatCard>
                    </TraderStats>

                    {/* Copy Stats (if already copying) */}
                    {isCopying && copyStatus.stats && (
                        <>
                            <SectionTitle>
                                <Activity size={16} /> Your Copy Performance
                            </SectionTitle>
                            <TraderStats>
                                <StatCard $color={copyStatus.stats.totalProfitLoss >= 0 ? '#10b981' : '#ef4444'}>
                                    <div className="label">P/L</div>
                                    <div className="value">
                                        {copyStatus.stats.totalProfitLoss >= 0 ? '+' : ''}
                                        ${(copyStatus.stats.totalProfitLoss || 0).toFixed(2)}
                                    </div>
                                </StatCard>
                                <StatCard $color="#3b82f6">
                                    <div className="label">Copied Trades</div>
                                    <div className="value">{copyStatus.stats.totalCopiedTrades || 0}</div>
                                </StatCard>
                                <StatCard $color="#10b981">
                                    <div className="label">Success Rate</div>
                                    <div className="value">
                                        {copyStatus.stats.totalCopiedTrades > 0
                                            ? ((copyStatus.stats.successfulTrades / copyStatus.stats.totalCopiedTrades) * 100).toFixed(0)
                                            : 0}%
                                    </div>
                                </StatCard>
                            </TraderStats>
                        </>
                    )}

                    {/* Allocation Settings */}
                    <SectionTitle>
                        <DollarSign size={16} /> Allocation
                    </SectionTitle>
                    <SettingsGroup>
                        <SettingRow>
                            <SettingLabel theme={theme}>
                                <Percent size={16} />
                                Allocation per Trade
                            </SettingLabel>
                            <SliderContainer>
                                <Slider
                                    type="range"
                                    min="1"
                                    max="50"
                                    value={settings.allocationPercent}
                                    onChange={e => setSettings(s => ({ ...s, allocationPercent: parseInt(e.target.value) }))}
                                />
                                <SliderValue>{settings.allocationPercent}%</SliderValue>
                            </SliderContainer>
                        </SettingRow>
                        <SettingRow>
                            <SettingLabel theme={theme}>
                                <DollarSign size={16} />
                                Max per Trade
                            </SettingLabel>
                            <SliderContainer>
                                <Slider
                                    type="range"
                                    min="100"
                                    max="10000"
                                    step="100"
                                    value={settings.maxAmountPerTrade}
                                    onChange={e => setSettings(s => ({ ...s, maxAmountPerTrade: parseInt(e.target.value) }))}
                                />
                                <SliderValue>${settings.maxAmountPerTrade}</SliderValue>
                            </SliderContainer>
                        </SettingRow>
                        <SettingRow>
                            <SettingLabel theme={theme}>
                                Max Active Trades
                            </SettingLabel>
                            <SliderContainer>
                                <Slider
                                    type="range"
                                    min="1"
                                    max="25"
                                    value={settings.maxActiveTrades}
                                    onChange={e => setSettings(s => ({ ...s, maxActiveTrades: parseInt(e.target.value) }))}
                                />
                                <SliderValue>{settings.maxActiveTrades}</SliderValue>
                            </SliderContainer>
                        </SettingRow>
                    </SettingsGroup>

                    {/* Filters */}
                    <SectionTitle>
                        <Settings size={16} /> Filters
                    </SectionTitle>
                    <SettingsGroup>
                        <SettingRow>
                            <SettingLabel theme={theme}>Asset Types</SettingLabel>
                            <AssetToggles>
                                <AssetToggle
                                    $active={settings.copyAssetTypes.stocks}
                                    onClick={() => setSettings(s => ({
                                        ...s,
                                        copyAssetTypes: { ...s.copyAssetTypes, stocks: !s.copyAssetTypes.stocks }
                                    }))}
                                >
                                    Stocks
                                </AssetToggle>
                                <AssetToggle
                                    $active={settings.copyAssetTypes.crypto}
                                    onClick={() => setSettings(s => ({
                                        ...s,
                                        copyAssetTypes: { ...s.copyAssetTypes, crypto: !s.copyAssetTypes.crypto }
                                    }))}
                                >
                                    Crypto
                                </AssetToggle>
                                <AssetToggle
                                    $active={settings.copyAssetTypes.dex}
                                    onClick={() => setSettings(s => ({
                                        ...s,
                                        copyAssetTypes: { ...s.copyAssetTypes, dex: !s.copyAssetTypes.dex }
                                    }))}
                                >
                                    DEX
                                </AssetToggle>
                            </AssetToggles>
                        </SettingRow>
                        <SettingRow>
                            <SettingLabel theme={theme}>Directions</SettingLabel>
                            <DirectionToggles>
                                <DirectionToggle
                                    $active={settings.copyDirections.up}
                                    $direction="up"
                                    onClick={() => setSettings(s => ({
                                        ...s,
                                        copyDirections: { ...s.copyDirections, up: !s.copyDirections.up }
                                    }))}
                                >
                                    <TrendingUp size={14} /> UP
                                </DirectionToggle>
                                <DirectionToggle
                                    $active={settings.copyDirections.down}
                                    $direction="down"
                                    onClick={() => setSettings(s => ({
                                        ...s,
                                        copyDirections: { ...s.copyDirections, down: !s.copyDirections.down }
                                    }))}
                                >
                                    <TrendingDown size={14} /> DOWN
                                </DirectionToggle>
                            </DirectionToggles>
                        </SettingRow>
                        <SettingRow>
                            <SettingLabel theme={theme}>Min Confidence</SettingLabel>
                            <SliderContainer>
                                <Slider
                                    type="range"
                                    min="0"
                                    max="90"
                                    step="5"
                                    value={settings.minConfidence}
                                    onChange={e => setSettings(s => ({ ...s, minConfidence: parseInt(e.target.value) }))}
                                />
                                <SliderValue>{settings.minConfidence}%</SliderValue>
                            </SliderContainer>
                        </SettingRow>
                        <SettingRow>
                            <SettingLabel theme={theme}>Min Signal Strength</SettingLabel>
                            <Select
                                value={settings.minSignalStrength}
                                onChange={e => setSettings(s => ({ ...s, minSignalStrength: e.target.value }))}
                                theme={theme}
                            >
                                <option value="weak">Weak (All)</option>
                                <option value="moderate">Moderate+</option>
                                <option value="strong">Strong Only</option>
                            </Select>
                        </SettingRow>
                    </SettingsGroup>

                    {/* Risk Management */}
                    <SectionTitle>
                        <Shield size={16} /> Risk Management
                    </SectionTitle>
                    <SettingsGroup>
                        <SettingRow>
                            <SettingLabel theme={theme}>
                                <AlertCircle size={16} />
                                Stop Loss
                            </SettingLabel>
                            <Toggle
                                $active={settings.enableStopLoss}
                                onClick={() => setSettings(s => ({ ...s, enableStopLoss: !s.enableStopLoss }))}
                            />
                        </SettingRow>
                        {settings.enableStopLoss && (
                            <SettingRow>
                                <SettingLabel theme={theme}>Stop Loss %</SettingLabel>
                                <SliderContainer>
                                    <Slider
                                        type="range"
                                        min="2"
                                        max="50"
                                        value={settings.stopLossPercent}
                                        onChange={e => setSettings(s => ({ ...s, stopLossPercent: parseInt(e.target.value) }))}
                                    />
                                    <SliderValue>-{settings.stopLossPercent}%</SliderValue>
                                </SliderContainer>
                            </SettingRow>
                        )}
                        <SettingRow>
                            <SettingLabel theme={theme}>
                                <CheckCircle size={16} />
                                Take Profit
                            </SettingLabel>
                            <Toggle
                                $active={settings.enableTakeProfit}
                                onClick={() => setSettings(s => ({ ...s, enableTakeProfit: !s.enableTakeProfit }))}
                            />
                        </SettingRow>
                        {settings.enableTakeProfit && (
                            <SettingRow>
                                <SettingLabel theme={theme}>Take Profit %</SettingLabel>
                                <SliderContainer>
                                    <Slider
                                        type="range"
                                        min="5"
                                        max="100"
                                        value={settings.takeProfitPercent}
                                        onChange={e => setSettings(s => ({ ...s, takeProfitPercent: parseInt(e.target.value) }))}
                                    />
                                    <SliderValue>+{settings.takeProfitPercent}%</SliderValue>
                                </SliderContainer>
                            </SettingRow>
                        )}
                    </SettingsGroup>

                    {/* Notifications */}
                    <SettingsGroup>
                        <SettingRow>
                            <SettingLabel theme={theme}>
                                <Bell size={16} />
                                Notify on Copy
                            </SettingLabel>
                            <Toggle
                                $active={settings.notifyOnCopy}
                                onClick={() => setSettings(s => ({ ...s, notifyOnCopy: !s.notifyOnCopy }))}
                            />
                        </SettingRow>
                    </SettingsGroup>
                </Content>

                <Footer>
                    {isCopying ? (
                        <>
                            <SecondaryButton
                                onClick={handlePauseResume}
                                disabled={loading}
                            >
                                {copyStatus.isPaused ? <Play size={18} /> : <Pause size={18} />}
                                {copyStatus.isPaused ? 'Resume' : 'Pause'}
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleUpdateSettings}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </PrimaryButton>
                            <DangerButton
                                onClick={handleStopCopy}
                                disabled={loading}
                                style={{ flex: 0.7 }}
                            >
                                <X size={18} />
                                Stop
                            </DangerButton>
                        </>
                    ) : (
                        <>
                            <SecondaryButton onClick={onClose}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton
                                onClick={handleStartCopy}
                                disabled={loading || checkingStatus}
                            >
                                <Copy size={18} />
                                {loading ? 'Starting...' : 'Start Copy Trading'}
                            </PrimaryButton>
                        </>
                    )}
                </Footer>
            </Modal>
        </Overlay>
    );
};

export default CopyTradingModal;
