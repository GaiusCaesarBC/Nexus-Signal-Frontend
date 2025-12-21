// src/components/PushNotificationSettings.js - Push Notification Settings Panel
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Bell, BellOff, Smartphone, Monitor, CheckCircle, XCircle, Settings, Send, AlertTriangle } from 'lucide-react';
import usePushNotifications from '../hooks/usePushNotifications';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 16px;
    padding: 24px;
    animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const Title = styled.h3`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    font-weight: 600;
    color: #f8fafc;
    margin: 0;

    svg {
        color: #3b82f6;
    }
`;

const StatusBadge = styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    background: ${props => props.$enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
    color: ${props => props.$enabled ? '#10b981' : '#ef4444'};
    border: 1px solid ${props => props.$enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
`;

const Description = styled.p`
    color: #94a3b8;
    font-size: 14px;
    margin: 0 0 20px 0;
    line-height: 1.6;
`;

const PermissionWarning = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.3);
    border-radius: 10px;
    margin-bottom: 20px;
    color: #f59e0b;
    font-size: 13px;
`;

const NotSupportedWarning = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #ef4444;
    font-size: 13px;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const PrimaryButton = styled(Button)`
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;

    &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
`;

const SecondaryButton = styled(Button)`
    background: rgba(255, 255, 255, 0.05);
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
    }
`;

const DangerButton = styled(Button)`
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.25);
    }
`;

const PreferencesSection = styled.div`
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 20px;
`;

const PreferencesTitle = styled.h4`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #f8fafc;
    margin: 0 0 16px 0;

    svg {
        color: #8b5cf6;
        width: 16px;
        height: 16px;
    }
`;

const PreferenceGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
`;

const PreferenceItem = styled.label`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
    }
`;

const Checkbox = styled.input`
    width: 18px;
    height: 18px;
    accent-color: #3b82f6;
    cursor: pointer;
`;

const PreferenceLabel = styled.div`
    flex: 1;
`;

const PreferenceName = styled.span`
    display: block;
    color: #f8fafc;
    font-size: 13px;
    font-weight: 500;
`;

const PreferenceDesc = styled.span`
    display: block;
    color: #64748b;
    font-size: 11px;
    margin-top: 2px;
`;

const LoadingSpinner = styled.div`
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;

const PREFERENCE_OPTIONS = [
    { key: 'predictions', name: 'Predictions', desc: 'Prediction outcomes & results' },
    { key: 'priceAlerts', name: 'Price Alerts', desc: 'Price target notifications' },
    { key: 'copyTrading', name: 'Copy Trading', desc: 'When trades are copied' },
    { key: 'social', name: 'Social', desc: 'Likes, comments & follows' },
    { key: 'achievements', name: 'Achievements', desc: 'Level ups & badges' },
    { key: 'system', name: 'System', desc: 'Important updates & announcements' }
];

function PushNotificationSettings() {
    const {
        isSupported,
        isSubscribed,
        isLoading,
        permission,
        preferences,
        subscribe,
        unsubscribe,
        updatePreferences,
        sendTestNotification
    } = usePushNotifications();

    const handlePreferenceChange = (key, value) => {
        updatePreferences({ [key]: value });
    };

    // Browser doesn't support push notifications
    if (!isSupported) {
        return (
            <Container>
                <Header>
                    <Title>
                        <Bell size={20} />
                        Push Notifications
                    </Title>
                </Header>
                <NotSupportedWarning>
                    <XCircle size={18} />
                    Push notifications are not supported in this browser. Try Chrome, Firefox, or Edge.
                </NotSupportedWarning>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <Title>
                    <Bell size={20} />
                    Push Notifications
                </Title>
                <StatusBadge $enabled={isSubscribed}>
                    {isSubscribed ? <CheckCircle size={14} /> : <BellOff size={14} />}
                    {isSubscribed ? 'Enabled' : 'Disabled'}
                </StatusBadge>
            </Header>

            <Description>
                Get instant notifications for price alerts, prediction outcomes, copy trades, and social activity
                even when you're not on the site.
            </Description>

            {permission === 'denied' && (
                <PermissionWarning>
                    <AlertTriangle size={18} />
                    Notifications are blocked. Please enable them in your browser settings to receive push notifications.
                </PermissionWarning>
            )}

            <ButtonGroup>
                {!isSubscribed ? (
                    <PrimaryButton onClick={subscribe} disabled={isLoading || permission === 'denied'}>
                        {isLoading ? <LoadingSpinner /> : <Bell size={16} />}
                        Enable Push Notifications
                    </PrimaryButton>
                ) : (
                    <>
                        <SecondaryButton onClick={sendTestNotification} disabled={isLoading}>
                            <Send size={16} />
                            Send Test
                        </SecondaryButton>
                        <DangerButton onClick={unsubscribe} disabled={isLoading}>
                            {isLoading ? <LoadingSpinner /> : <BellOff size={16} />}
                            Disable
                        </DangerButton>
                    </>
                )}
            </ButtonGroup>

            {isSubscribed && preferences && (
                <PreferencesSection>
                    <PreferencesTitle>
                        <Settings />
                        Notification Preferences
                    </PreferencesTitle>
                    <PreferenceGrid>
                        {PREFERENCE_OPTIONS.map(option => (
                            <PreferenceItem key={option.key}>
                                <Checkbox
                                    type="checkbox"
                                    checked={preferences[option.key] ?? true}
                                    onChange={(e) => handlePreferenceChange(option.key, e.target.checked)}
                                    disabled={isLoading}
                                />
                                <PreferenceLabel>
                                    <PreferenceName>{option.name}</PreferenceName>
                                    <PreferenceDesc>{option.desc}</PreferenceDesc>
                                </PreferenceLabel>
                            </PreferenceItem>
                        ))}
                    </PreferenceGrid>
                </PreferencesSection>
            )}
        </Container>
    );
}

export default PushNotificationSettings;
