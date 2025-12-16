// client/src/pages/AccountSettingsPage.js - Modern Revamp
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Zap,
    Shield,
    LogOut,
    Calendar,
    Mail,
    Crown,
    Eye,
    EyeOff,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Copy,
    Check,
    Settings,
    Bell,
    Palette,
    CreditCard,
    HelpCircle,
    ExternalLink,
    MessageCircle
} from 'lucide-react';
import TelegramSettings from '../components/TelegramSettings';

const AccountSettingsPage = () => {
    const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [showUserId, setShowUserId] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        await logout();
        navigate('/login');
    };

    const copyUserId = () => {
        if (user?._id) {
            navigator.clipboard.writeText(user._id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    };

    const getMembershipDuration = (dateString) => {
        if (!dateString) return '';
        const joined = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - joined);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
    };

    const getTierColor = (tier) => {
        switch (tier?.toLowerCase()) {
            case 'pro': return '#f59e0b';
            case 'premium': return '#a855f7';
            case 'enterprise': return '#ec4899';
            default: return '#10b981';
        }
    };

    const getTierIcon = (tier) => {
        switch (tier?.toLowerCase()) {
            case 'pro':
            case 'premium':
            case 'enterprise':
                return <Crown size={16} />;
            default:
                return <Zap size={16} />;
        }
    };

    // Capitalize first letter of tier for display
    const formatTierName = (tier) => {
        if (!tier) return 'Free';
        return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
    };

    if (authLoading) {
        return (
            <PageContainer>
                <LoadingState>
                    <Spinner />
                    <span>Loading settings...</span>
                </LoadingState>
            </PageContainer>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <PageContainer>
                <ContentWrapper>
                    <ErrorCard>
                        <AlertTriangle size={48} />
                        <h3>Authentication Required</h3>
                        <p>Please log in to view your account settings.</p>
                        <PrimaryButton onClick={() => navigate('/login')}>
                            Go to Login
                        </PrimaryButton>
                    </ErrorCard>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                {/* Header */}
                <PageHeader>
                    <HeaderIcon>
                        <Settings size={28} />
                    </HeaderIcon>
                    <div>
                        <PageTitle>Account Settings</PageTitle>
                        <PageSubtitle>Manage your profile and preferences</PageSubtitle>
                    </div>
                </PageHeader>

                <SettingsGrid>
                    {/* Profile Card */}
                    <ProfileCard>
                        <ProfileHeader>
                            <Avatar>
                                {user.profile?.avatar ? (
                                    <img src={user.profile.avatar} alt={user.username} />
                                ) : (
                                    <AvatarPlaceholder>
                                        {user.username?.charAt(0).toUpperCase()}
                                    </AvatarPlaceholder>
                                )}
                            </Avatar>
                            <ProfileInfo>
                                <Username>{user.username}</Username>
                                <Email>
                                    <Mail size={14} />
                                    {user.email}
                                </Email>
                                <TierBadge $color={getTierColor(user.subscription?.status)}>
                                    {getTierIcon(user.subscription?.status)}
                                    {formatTierName(user.subscription?.status)} Plan
                                </TierBadge>
                            </ProfileInfo>
                        </ProfileHeader>
                        
                        <ProfileStats>
                            <StatItem>
                                <StatValue>{getMembershipDuration(user.createdAt)}</StatValue>
                                <StatLabel>Member</StatLabel>
                            </StatItem>
                            <StatDivider />
                            <StatItem>
                                <StatValue>{user.watchlist?.length || 0}</StatValue>
                                <StatLabel>Watchlist</StatLabel>
                            </StatItem>
                            <StatDivider />
                            <StatItem>
                                <StatValue>{user.gamification?.level || 1}</StatValue>
                                <StatLabel>Level</StatLabel>
                            </StatItem>
                        </ProfileStats>

                        <EditProfileButton onClick={() => navigate('/profile')}>
                            Edit Profile
                            <ChevronRight size={16} />
                        </EditProfileButton>
                    </ProfileCard>

                    {/* Main Settings */}
                    <MainSettings>
                        {/* Account Information */}
                        <SettingsSection>
                            <SectionHeader>
                                <User size={20} />
                                <span>Account Information</span>
                            </SectionHeader>
                            
                            <SettingsList>
                                <SettingItem>
                                    <SettingLabel>Username</SettingLabel>
                                    <SettingValue>{user.username}</SettingValue>
                                </SettingItem>
                                
                                <SettingItem>
                                    <SettingLabel>Email Address</SettingLabel>
                                    <SettingValue>{user.email}</SettingValue>
                                </SettingItem>
                                
                                <SettingItem>
                                    <SettingLabel>User ID</SettingLabel>
                                    <SettingValue $mono>
                                        {showUserId ? (
                                            <>
                                                <span>{user._id}</span>
                                                <IconBtn onClick={copyUserId} title="Copy ID">
                                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                                </IconBtn>
                                            </>
                                        ) : (
                                            <span>••••••••••••••••••••••••</span>
                                        )}
                                        <IconBtn onClick={() => setShowUserId(!showUserId)}>
                                            {showUserId ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </IconBtn>
                                    </SettingValue>
                                </SettingItem>
                                
                                <SettingItem>
                                    <SettingLabel>Member Since</SettingLabel>
                                    <SettingValue>
                                        <Calendar size={14} />
                                        {formatDate(user.createdAt)}
                                    </SettingValue>
                                </SettingItem>
                            </SettingsList>
                        </SettingsSection>

                        {/* Subscription */}
                        <SettingsSection>
                            <SectionHeader>
                                <CreditCard size={20} />
                                <span>Subscription</span>
                            </SectionHeader>
                            
                            <SubscriptionCard $color={getTierColor(user.subscription?.status)}>
                                <SubscriptionInfo>
                                    <SubscriptionTier>
                                        {getTierIcon(user.subscription?.status)}
                                        {formatTierName(user.subscription?.status)} Plan
                                    </SubscriptionTier>
                                    <SubscriptionDesc>
                                        {(!user.subscription?.status || user.subscription?.status === 'free')
                                            ? 'Upgrade to unlock premium features'
                                            : 'You have access to all premium features'
                                        }
                                    </SubscriptionDesc>
                                </SubscriptionInfo>
                                {(!user.subscription?.status || user.subscription?.status === 'free') && (
                                    <UpgradeButton onClick={() => navigate('/pricing')}>
                                        Upgrade
                                    </UpgradeButton>
                                )}
                            </SubscriptionCard>
                        </SettingsSection>

                        {/* Security */}
                        <SettingsSection>
                            <SectionHeader>
                                <Shield size={20} />
                                <span>Security</span>
                            </SectionHeader>
                            
                            <SettingsList>
                                <SettingRow onClick={() => {}}>
                                    <SettingRowLeft>
                                        <SettingRowIcon><Shield size={18} /></SettingRowIcon>
                                        <div>
                                            <SettingRowTitle>Password</SettingRowTitle>
                                            <SettingRowDesc>Last changed: Never</SettingRowDesc>
                                        </div>
                                    </SettingRowLeft>
                                    <ComingSoonBadge>Coming Soon</ComingSoonBadge>
                                </SettingRow>
                                
                                <SettingRow onClick={() => {}}>
                                    <SettingRowLeft>
                                        <SettingRowIcon><Shield size={18} /></SettingRowIcon>
                                        <div>
                                            <SettingRowTitle>Two-Factor Authentication</SettingRowTitle>
                                            <SettingRowDesc>Add an extra layer of security</SettingRowDesc>
                                        </div>
                                    </SettingRowLeft>
                                    <ComingSoonBadge>Coming Soon</ComingSoonBadge>
                                </SettingRow>
                            </SettingsList>
                        </SettingsSection>

                        {/* Telegram Notifications */}
                        <TelegramSettings />

                        {/* Quick Links */}
                        <SettingsSection>
                            <SectionHeader>
                                <HelpCircle size={20} />
                                <span>Quick Links</span>
                            </SectionHeader>
                            
                            <QuickLinksGrid>
                                <QuickLink onClick={() => navigate('/vault')}>
                                    <Palette size={20} />
                                    <span>Vault & Themes</span>
                                </QuickLink>
                                <QuickLink onClick={() => navigate('/achievements')}>
                                    <Crown size={20} />
                                    <span>Achievements</span>
                                </QuickLink>
                                <QuickLink onClick={() => navigate('/privacy')}>
                                    <Shield size={20} />
                                    <span>Privacy Policy</span>
                                </QuickLink>
                                <QuickLink onClick={() => navigate('/terms')}>
                                    <ExternalLink size={20} />
                                    <span>Terms of Service</span>
                                </QuickLink>
                            </QuickLinksGrid>
                        </SettingsSection>

                        {/* Danger Zone */}
                        <DangerSection>
                            <SectionHeader $danger>
                                <AlertTriangle size={20} />
                                <span>Session</span>
                            </SectionHeader>
                            
                            <LogoutButton onClick={handleLogout} disabled={loggingOut}>
                                <LogOut size={18} />
                                {loggingOut ? 'Logging out...' : 'Logout'}
                            </LogoutButton>
                        </DangerSection>
                    </MainSettings>
                </SettingsGrid>
            </ContentWrapper>
        </PageContainer>
    );
};

// Animations
const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: transparent;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const ContentWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    animation: ${fadeIn} 0.4s ease-out;

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const PageHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
`;

const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'}20 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'}20 100%
    );
    border: 1px solid ${props => props.theme.brand?.primary || '#00adef'}40;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const PageTitle = styled.h1`
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const PageSubtitle = styled.p`
    margin: 4px 0 0 0;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 14px;
`;

const SettingsGrid = styled.div`
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 24px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const ProfileCard = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 24px;
    height: fit-content;
    position: sticky;
    top: 100px;

    @media (max-width: 900px) {
        position: static;
    }
`;

const ProfileHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 20px;
`;

const Avatar = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 16px;
    border: 3px solid ${props => props.theme.brand?.primary || '#00adef'};
    box-shadow: 0 0 20px ${props => props.theme.brand?.primary || '#00adef'}40;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const AvatarPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'} 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'} 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
    color: white;
`;

const ProfileInfo = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
`;

const Username = styled.h2`
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const Email = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 13px;
`;

const TierBadge = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: ${props => props.$color}20;
    color: ${props => props.$color};
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
`;

const ProfileStats = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 16px 0;
    border-top: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    margin-bottom: 16px;
`;

const StatItem = styled.div`
    text-align: center;
`;

const StatValue = styled.div`
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
`;

const StatLabel = styled.div`
    font-size: 11px;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const StatDivider = styled.div`
    width: 1px;
    height: 30px;
    background: ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
`;

const EditProfileButton = styled.button`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: transparent;
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}15;
        border-color: ${props => props.theme.brand?.primary || '#00adef'}50;
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const MainSettings = styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

const SettingsSection = styled.div`
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    overflow: hidden;
`;

const DangerSection = styled(SettingsSection)`
    border-color: rgba(239, 68, 68, 0.3);
`;

const SectionHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 20px;
    border-bottom: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    font-weight: 600;
    color: ${props => props.$danger ? '#ef4444' : props.theme.text?.primary || '#e0e6ed'};

    svg {
        color: ${props => props.$danger ? '#ef4444' : props.theme.brand?.primary || '#00adef'};
    }
`;

const SettingsList = styled.div`
    padding: 8px;
`;

const SettingItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-radius: 10px;
    transition: background 0.2s ease;

    &:hover {
        background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    }
`;

const SettingLabel = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 14px;
`;

const SettingValue = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
    font-family: ${props => props.$mono ? "'Monaco', 'Menlo', monospace" : 'inherit'};

    svg {
        color: ${props => props.theme.text?.tertiary || '#64748b'};
    }
`;

const IconBtn = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border: 1px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.2)'};
    border-radius: 6px;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}20;
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const SubscriptionCard = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    margin: 12px;
    background: ${props => props.$color}10;
    border: 1px solid ${props => props.$color}30;
    border-radius: 12px;
`;

const SubscriptionInfo = styled.div``;

const SubscriptionTier = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    margin-bottom: 4px;

    svg {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }
`;

const SubscriptionDesc = styled.div`
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
    font-size: 13px;
`;

const UpgradeButton = styled.button`
    padding: 10px 20px;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'} 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'} 100%
    );
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px ${props => props.theme.brand?.primary || '#00adef'}40;
    }
`;

const SettingRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin: 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.2s ease;

    &:hover {
        background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    }
`;

const SettingRowLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

const SettingRowIcon = styled.div`
    width: 40px;
    height: 40px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.8)'};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.brand?.primary || '#00adef'};
`;

const SettingRowTitle = styled.div`
    font-weight: 500;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 14px;
`;

const SettingRowDesc = styled.div`
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    font-size: 12px;
    margin-top: 2px;
`;

const ComingSoonBadge = styled.span`
    padding: 4px 10px;
    background: ${props => props.theme.text?.tertiary || '#64748b'}20;
    color: ${props => props.theme.text?.tertiary || '#64748b'};
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
`;

const QuickLinksGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px;

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const QuickLink = styled.button`
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    background: ${props => props.theme.bg?.input || 'rgba(15, 23, 42, 0.5)'};
    border: 1px solid transparent;
    border-radius: 10px;
    color: ${props => props.theme.text?.primary || '#e0e6ed'};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;

    svg {
        color: ${props => props.theme.brand?.primary || '#00adef'};
    }

    &:hover {
        background: ${props => props.theme.brand?.primary || '#00adef'}15;
        border-color: ${props => props.theme.brand?.primary || '#00adef'}30;
    }
`;

const LogoutButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: calc(100% - 24px);
    margin: 12px;
    padding: 14px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 10px;
    color: #ef4444;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const LoadingState = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 60vh;
    color: ${props => props.theme.text?.secondary || '#94a3b8'};
`;

const Spinner = styled.div`
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.border?.tertiary || 'rgba(100, 116, 139, 0.3)'};
    border-top-color: ${props => props.theme.brand?.primary || '#00adef'};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
`;

const ErrorCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 40px;
    background: ${props => props.theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 1px solid ${props => props.theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    text-align: center;
    max-width: 400px;
    margin: 0 auto;

    svg {
        color: #f59e0b;
    }

    h3 {
        margin: 0;
        color: ${props => props.theme.text?.primary || '#e0e6ed'};
    }

    p {
        margin: 0;
        color: ${props => props.theme.text?.secondary || '#94a3b8'};
    }
`;

const PrimaryButton = styled.button`
    padding: 12px 24px;
    background: linear-gradient(135deg, 
        ${props => props.theme.brand?.primary || '#00adef'} 0%, 
        ${props => props.theme.brand?.accent || '#06b6d4'} 100%
    );
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px ${props => props.theme.brand?.primary || '#00adef'}40;
    }
`;

export default AccountSettingsPage;