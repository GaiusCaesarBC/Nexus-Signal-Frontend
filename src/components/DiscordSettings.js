// client/src/components/DiscordSettings.js
// Discord Bot Notification Settings Component

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    MessageSquare,
    Link2,
    Unlink,
    Bell,
    Calendar,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    ExternalLink,
    RefreshCw,
    Send,
    Loader,
    Copy,
    Check
} from 'lucide-react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

const DiscordSettings = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [testing, setTesting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState({
        connected: false,
        username: null,
        linkedAt: null,
        notifications: {
            economicEvents: true,
            whaleAlerts: true,
            dailySummary: true,
            mlPredictions: true,
            priceAlerts: true
        }
    });
    const [linkData, setLinkData] = useState(null);
    const [botInfo, setBotInfo] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchStatus();
        fetchBotInfo();
    }, []);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/discord/status');
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching Discord status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBotInfo = async () => {
        try {
            const response = await api.get('/discord/bot-info');
            setBotInfo(response.data);
        } catch (error) {
            console.error('Error fetching Discord bot info:', error);
        }
    };

    const handleConnect = async () => {
        try {
            setConnecting(true);
            const response = await api.post('/discord/generate-link');
            setLinkData(response.data);
            toast.success('Link token generated!', 'Copy the token and use /link in Discord');
        } catch (error) {
            toast.error('Failed to generate link', 'Error');
            console.error('Error generating Discord link:', error);
        } finally {
            setConnecting(false);
        }
    };

    const handleCopyToken = () => {
        if (linkData?.linkToken) {
            navigator.clipboard.writeText(linkData.linkToken);
            setCopied(true);
            toast.success('Token copied!', 'Paste it in Discord with /link');
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const handleDisconnect = async () => {
        if (!window.confirm('Are you sure you want to disconnect Discord notifications?')) return;

        try {
            setDisconnecting(true);
            await api.post('/discord/unlink');
            setStatus(prev => ({ ...prev, connected: false, username: null }));
            setLinkData(null);
            toast.success('Discord disconnected', 'Success');
        } catch (error) {
            toast.error('Failed to disconnect', 'Error');
            console.error('Error disconnecting Discord:', error);
        } finally {
            setDisconnecting(false);
        }
    };

    const handleToggleNotification = async (key) => {
        const newValue = !status.notifications[key];
        const updatedNotifications = {
            ...status.notifications,
            [key]: newValue
        };

        setStatus(prev => ({
            ...prev,
            notifications: updatedNotifications
        }));

        try {
            setSaving(true);
            await api.put('/discord/notifications', updatedNotifications);
            toast.success('Preferences updated', 'Saved');
        } catch (error) {
            // Revert on error
            setStatus(prev => ({
                ...prev,
                notifications: {
                    ...prev.notifications,
                    [key]: !newValue
                }
            }));
            toast.error('Failed to update preferences', 'Error');
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async () => {
        try {
            setTesting(true);
            await api.post('/discord/test');
            toast.success('Test notification sent!', 'Check Discord');
        } catch (error) {
            toast.error('Failed to send test. Make sure DMs are enabled.', 'Error');
            console.error('Error sending test:', error);
        } finally {
            setTesting(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container>
                <LoadingState>
                    <Spinner />
                    <span>Loading Discord settings...</span>
                </LoadingState>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <HeaderIcon>
                    <MessageSquare size={20} />
                </HeaderIcon>
                <HeaderText>
                    <HeaderTitle>Discord Notifications</HeaderTitle>
                    <HeaderSubtitle>Receive alerts via Discord DM</HeaderSubtitle>
                </HeaderText>
            </Header>

            <Content>
                {/* Connection Status */}
                <StatusCard $connected={status.connected}>
                    <StatusIcon $connected={status.connected}>
                        {status.connected ? <CheckCircle size={24} /> : <MessageSquare size={24} />}
                    </StatusIcon>
                    <StatusInfo>
                        <StatusTitle>
                            {status.connected ? 'Connected' : 'Not Connected'}
                        </StatusTitle>
                        <StatusDesc>
                            {status.connected
                                ? `${status.username || 'Unknown'} - Linked ${formatDate(status.linkedAt)}`
                                : 'Connect your Discord to receive instant notifications'
                            }
                        </StatusDesc>
                    </StatusInfo>

                    {status.connected ? (
                        <ActionButtons>
                            <TestButton onClick={handleSendTest} disabled={testing}>
                                {testing ? <Loader size={14} className="spin" /> : <Send size={14} />}
                                Test
                            </TestButton>
                            <DisconnectButton onClick={handleDisconnect} disabled={disconnecting}>
                                {disconnecting ? <Loader size={14} className="spin" /> : <Unlink size={14} />}
                                Disconnect
                            </DisconnectButton>
                        </ActionButtons>
                    ) : (
                        <ConnectButton onClick={handleConnect} disabled={connecting}>
                            {connecting ? <Loader size={16} className="spin" /> : <Link2 size={16} />}
                            {linkData ? 'Regenerate Token' : 'Connect'}
                        </ConnectButton>
                    )}
                </StatusCard>

                {/* Link Instructions */}
                {linkData && !status.connected && (
                    <LinkCard>
                        <LinkHeader>
                            <ExternalLink size={18} />
                            <span>Connect Your Discord</span>
                        </LinkHeader>
                        <LinkSteps>
                            <Step>
                                <StepNumber>1</StepNumber>
                                <StepText>
                                    {botInfo?.inviteLink ? (
                                        <span>
                                            First, <InviteLink href={botInfo.inviteLink} target="_blank" rel="noopener noreferrer">
                                                invite the bot to your server
                                            </InviteLink> (or DM the bot directly)
                                        </span>
                                    ) : (
                                        'Make sure you can DM the Nexus Signal bot'
                                    )}
                                </StepText>
                            </Step>
                            <Step>
                                <StepNumber>2</StepNumber>
                                <StepText>Copy this link token:</StepText>
                            </Step>
                        </LinkSteps>

                        <TokenBox>
                            <TokenText>{linkData.linkToken}</TokenText>
                            <CopyButton onClick={handleCopyToken}>
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </CopyButton>
                        </TokenBox>

                        <LinkSteps style={{ marginTop: '16px' }}>
                            <Step>
                                <StepNumber>3</StepNumber>
                                <StepText>DM the bot or use in a server with the bot:</StepText>
                            </Step>
                        </LinkSteps>

                        <CommandBox>
                            <code>/link {linkData.linkToken.substring(0, 8)}...</code>
                        </CommandBox>

                        <RefreshButton onClick={fetchStatus}>
                            <RefreshCw size={14} />
                            Refresh Status
                        </RefreshButton>
                        <ExpiryNote>Token expires in {linkData.expiresIn}</ExpiryNote>
                    </LinkCard>
                )}

                {/* Bot Invite Link (when not connected and no token yet) */}
                {!status.connected && !linkData && botInfo?.inviteLink && (
                    <InviteCard>
                        <InviteText>
                            Need to add the bot to your server first?
                        </InviteText>
                        <InviteLinkButton href={botInfo.inviteLink} target="_blank" rel="noopener noreferrer">
                            <MessageSquare size={16} />
                            Invite Nexus Signal Bot
                            <ExternalLink size={14} />
                        </InviteLinkButton>
                    </InviteCard>
                )}

                {/* Notification Preferences */}
                {status.connected && (
                    <PreferencesSection>
                        <SectionTitle>
                            <Bell size={18} />
                            Notification Preferences
                        </SectionTitle>

                        <PreferencesList>
                            <PreferenceItem>
                                <PreferenceInfo>
                                    <PreferenceIcon $color="#f59e0b">
                                        <Calendar size={18} />
                                    </PreferenceIcon>
                                    <div>
                                        <PreferenceTitle>Economic Events</PreferenceTitle>
                                        <PreferenceDesc>Reminders before FOMC, CPI, and other high-impact events</PreferenceDesc>
                                    </div>
                                </PreferenceInfo>
                                <Toggle
                                    $active={status.notifications.economicEvents}
                                    onClick={() => handleToggleNotification('economicEvents')}
                                    disabled={saving}
                                >
                                    <ToggleKnob $active={status.notifications.economicEvents} />
                                </Toggle>
                            </PreferenceItem>

                            <PreferenceItem>
                                <PreferenceInfo>
                                    <PreferenceIcon $color="#06b6d4">
                                        <AlertTriangle size={18} />
                                    </PreferenceIcon>
                                    <div>
                                        <PreferenceTitle>Whale Alerts</PreferenceTitle>
                                        <PreferenceDesc>Large transaction alerts for crypto and stocks</PreferenceDesc>
                                    </div>
                                </PreferenceInfo>
                                <Toggle
                                    $active={status.notifications.whaleAlerts}
                                    onClick={() => handleToggleNotification('whaleAlerts')}
                                    disabled={saving}
                                >
                                    <ToggleKnob $active={status.notifications.whaleAlerts} />
                                </Toggle>
                            </PreferenceItem>

                            <PreferenceItem>
                                <PreferenceInfo>
                                    <PreferenceIcon $color="#10b981">
                                        <TrendingUp size={18} />
                                    </PreferenceIcon>
                                    <div>
                                        <PreferenceTitle>Daily Summary</PreferenceTitle>
                                        <PreferenceDesc>Morning market briefing sent at 8 AM EST</PreferenceDesc>
                                    </div>
                                </PreferenceInfo>
                                <Toggle
                                    $active={status.notifications.dailySummary}
                                    onClick={() => handleToggleNotification('dailySummary')}
                                    disabled={saving}
                                >
                                    <ToggleKnob $active={status.notifications.dailySummary} />
                                </Toggle>
                            </PreferenceItem>

                            <PreferenceItem>
                                <PreferenceInfo>
                                    <PreferenceIcon $color="#8b5cf6">
                                        <TrendingUp size={18} />
                                    </PreferenceIcon>
                                    <div>
                                        <PreferenceTitle>ML Predictions</PreferenceTitle>
                                        <PreferenceDesc>Alerts for high-confidence AI predictions (70%+)</PreferenceDesc>
                                    </div>
                                </PreferenceInfo>
                                <Toggle
                                    $active={status.notifications.mlPredictions}
                                    onClick={() => handleToggleNotification('mlPredictions')}
                                    disabled={saving}
                                >
                                    <ToggleKnob $active={status.notifications.mlPredictions} />
                                </Toggle>
                            </PreferenceItem>

                            <PreferenceItem>
                                <PreferenceInfo>
                                    <PreferenceIcon $color="#ef4444">
                                        <Bell size={18} />
                                    </PreferenceIcon>
                                    <div>
                                        <PreferenceTitle>Price Alerts</PreferenceTitle>
                                        <PreferenceDesc>Notifications when your price alerts trigger</PreferenceDesc>
                                    </div>
                                </PreferenceInfo>
                                <Toggle
                                    $active={status.notifications.priceAlerts}
                                    onClick={() => handleToggleNotification('priceAlerts')}
                                    disabled={saving}
                                >
                                    <ToggleKnob $active={status.notifications.priceAlerts} />
                                </Toggle>
                            </PreferenceItem>
                        </PreferencesList>
                    </PreferencesSection>
                )}
            </Content>
        </Container>
    );
};

// Animations
const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
`;

const HeaderIcon = styled.div`
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
`;

const HeaderText = styled.div``;

const HeaderTitle = styled.h3`
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const HeaderSubtitle = styled.p`
    margin: 2px 0 0 0;
    font-size: 12px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const Content = styled.div`
    padding: 16px;
`;

const StatusCard = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: ${props => props.$connected
        ? 'rgba(16, 185, 129, 0.1)'
        : props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'
    };
    border: 1px solid ${props => props.$connected
        ? 'rgba(16, 185, 129, 0.3)'
        : props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'
    };
    border-radius: 12px;
    margin-bottom: 16px;

    @media (max-width: 600px) {
        flex-direction: column;
        text-align: center;
    }
`;

const StatusIcon = styled.div`
    width: 48px;
    height: 48px;
    background: ${props => props.$connected
        ? 'rgba(16, 185, 129, 0.2)'
        : 'rgba(100, 116, 139, 0.2)'
    };
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$connected ? '#10b981' : '#64748b'};
    flex-shrink: 0;
`;

const StatusInfo = styled.div`
    flex: 1;
`;

const StatusTitle = styled.div`
    font-size: 15px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 2px;
`;

const StatusDesc = styled.div`
    font-size: 13px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`;

const ConnectButton = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .spin {
        animation: ${spin} 1s linear infinite;
    }
`;

const TestButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 8px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(88, 101, 242, 0.2);
        border-color: rgba(88, 101, 242, 0.5);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spin {
        animation: ${spin} 1s linear infinite;
    }
`;

const DisconnectButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .spin {
        animation: ${spin} 1s linear infinite;
    }
`;

const LinkCard = styled.div`
    padding: 20px;
    background: rgba(88, 101, 242, 0.1);
    border: 1px solid rgba(88, 101, 242, 0.3);
    border-radius: 12px;
    margin-bottom: 16px;
`;

const LinkHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 16px;

    svg {
        color: #5865F2;
    }
`;

const LinkSteps = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
`;

const Step = styled.div`
    display: flex;
    align-items: flex-start;
    gap: 12px;
`;

const StepNumber = styled.div`
    width: 24px;
    height: 24px;
    background: #5865F2;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
`;

const StepText = styled.div`
    font-size: 13px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    line-height: 1.5;
`;

const InviteLink = styled.a`
    color: #5865F2;
    text-decoration: underline;

    &:hover {
        color: #7289DA;
    }
`;

const TokenBox = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 8px;
`;

const TokenText = styled.code`
    flex: 1;
    font-size: 11px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    word-break: break-all;
    font-family: 'Monaco', 'Menlo', monospace;
`;

const CopyButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #5865F2;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
        background: #4752C4;
    }
`;

const CommandBox = styled.div`
    padding: 12px 16px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 8px;
    margin-bottom: 16px;

    code {
        font-size: 13px;
        color: #5865F2;
        font-family: 'Monaco', 'Menlo', monospace;
    }
`;

const RefreshButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: transparent;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 8px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    }
`;

const ExpiryNote = styled.div`
    text-align: center;
    font-size: 11px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    margin-top: 12px;
`;

const InviteCard = styled.div`
    padding: 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border: 1px dashed rgba(88, 101, 242, 0.4);
    border-radius: 12px;
    margin-bottom: 16px;
    text-align: center;
`;

const InviteText = styled.p`
    font-size: 13px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    margin: 0 0 12px 0;
`;

const InviteLinkButton = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(88, 101, 242, 0.2);
    border: 1px solid rgba(88, 101, 242, 0.4);
    border-radius: 8px;
    color: #5865F2;
    font-size: 13px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(88, 101, 242, 0.3);
        transform: translateY(-1px);
    }
`;

const PreferencesSection = styled.div`
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border-radius: 12px;
    overflow: hidden;
`;

const SectionTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    font-weight: 600;
    font-size: 14px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};

    svg {
        color: #5865F2;
    }
`;

const PreferencesList = styled.div``;

const PreferenceItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.15)'};

    &:last-child {
        border-bottom: none;
    }
`;

const PreferenceInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const PreferenceIcon = styled.div`
    width: 36px;
    height: 36px;
    background: ${props => props.$color}20;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$color};
`;

const PreferenceTitle = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const PreferenceDesc = styled.div`
    font-size: 11px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    margin-top: 2px;
`;

const Toggle = styled.button`
    width: 44px;
    height: 24px;
    background: ${props => props.$active
        ? 'linear-gradient(135deg, #5865F2 0%, #7289DA 100%)'
        : 'rgba(100, 116, 139, 0.3)'
    };
    border: none;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const ToggleKnob = styled.div`
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '23px' : '3px'};
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 13px;
`;

const Spinner = styled.div`
    width: 32px;
    height: 32px;
    border: 3px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.3)'};
    border-top-color: #5865F2;
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

export default DiscordSettings;
