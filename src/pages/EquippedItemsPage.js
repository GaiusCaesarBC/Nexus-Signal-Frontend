// client/src/pages/EquippedItemsPage.js - FULLY THEMED with User Avatar Preview
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css, useTheme as useStyledTheme } from 'styled-components';
import { 
    User, Zap, Star, Award, Palette, Frame, Shield, 
    Check, Lock, ChevronRight, Sparkles, Crown
} from 'lucide-react';
import AvatarWithBorder from '../components/vault/AvatarWithBorder';
import { useVault } from '../context/VaultContext';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
    50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.8); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 100px 2rem 2rem;
    background: transparent;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    position: relative;
    overflow-x: hidden;
    z-index: 1;
`;
const BackgroundOrbs = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
`;

const Orb = styled.div`
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.3;
    animation: ${float} ${props => props.$duration || '20s'} ease-in-out infinite;
    
    &:nth-child(1) {
        width: 400px;
        height: 400px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.primary || '#00adef'}66 0%, transparent 70%)`};
        top: 10%;
        left: -100px;
    }
    
    &:nth-child(2) {
        width: 300px;
        height: 300px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.brand?.accent || '#8b5cf6'}66 0%, transparent 70%)`};
        top: 50%;
        right: -50px;
        animation-delay: -5s;
    }
    
    &:nth-child(3) {
        width: 350px;
        height: 350px;
        background: ${({ theme }) => `radial-gradient(circle, ${theme.success || '#10b981'}4D 0%, transparent 70%)`};
        bottom: 10%;
        left: 30%;
        animation-delay: -10s;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PageTitle = styled.h1`
    font-size: 3rem;
    background: ${({ theme }) => theme.brand?.gradient || 'linear-gradient(135deg, #00adef 0%, #8b5cf6 100%)'};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 1rem 0;
    font-weight: 900;
`;

const Subtitle = styled.p`
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    font-size: 1.1rem;
`;

// Preview Section
const PreviewSection = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.9)'};
    border: 2px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 24px;
    padding: 3rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const PreviewTitle = styled.h2`
    font-size: 1.8rem;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const PreviewGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 3rem;

    @media (max-width: 968px) {
        grid-template-columns: 1fr;
    }
`;

const AvatarPreview = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
`;

const AvatarContainer = styled.div`
    position: relative;
    width: 200px;
    height: 200px;
`;

const AvatarBorder = styled.div`
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    background: ${props => props.$gradient || 'linear-gradient(135deg, #00adef, #8b5cf6)'};
    padding: 5px;
    animation: ${props => props.$animate ? css`${glow} 2s ease-in-out infinite` : 'none'};

    ${props => props.$shimmer && css`
        background-size: 200% 200%;
        animation: ${shimmer} 3s linear infinite, ${glow} 2s ease-in-out infinite;
    `}
`;

const AvatarInner = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${({ theme }) => theme.bg?.card || 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))'};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const UserAvatar = styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ theme }) => `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}33, ${theme.brand?.accent || '#8b5cf6'}33)`};
    font-size: 4rem;
    font-weight: 900;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
    text-transform: uppercase;
`;

const UserAvatarImage = styled.img`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
`;

const AvatarIcon = styled.div`
    font-size: 5rem;
    color: ${({ theme }) => theme.brand?.primary || '#00adef'};
`;

const EquippedStats = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const StatCard = styled.div`
    background: ${({ theme }) => `${theme.brand?.primary || '#00adef'}1A`};
    border: 1px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}4D`};
    border-radius: 12px;
    padding: 1.5rem;
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
`;

const BadgeDisplay = styled.div`
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
`;

const BadgeIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

// Item Sections
const Section = styled.div`
    margin-bottom: 3rem;
    animation: ${fadeIn} 1s ease-out;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid ${({ theme }) => `${theme.brand?.primary || '#00adef'}33`};
`;

const SectionTitle = styled.h3`
    font-size: 1.5rem;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ItemCount = styled.span`
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    font-size: 1rem;
    font-weight: 400;
`;

const ItemsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
`;

// ============ VISUAL PREVIEW COMPONENTS ============
const BorderPreviewWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem 0;
    margin-bottom: 1rem;
    background: ${({ theme }) => `radial-gradient(ellipse at center, ${theme.brand?.primary || '#00adef'}15 0%, transparent 70%)`};
    border-radius: 12px;
    min-height: 140px;
`;

const BadgePreviewWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem 0;
    margin-bottom: 1rem;
    background: ${({ theme }) => `radial-gradient(ellipse at center, ${theme.warning || '#f59e0b'}15 0%, transparent 70%)`};
    border-radius: 12px;
    min-height: 120px;
`;

const LargeBadgeIcon = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 16px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    animation: ${pulse} 2s ease-in-out infinite;
    box-shadow: ${props => `0 0 30px ${props.$glowColor || 'rgba(0, 173, 237, 0.5)'}`};
    border: 2px solid ${props => props.$glowColor || 'rgba(0, 173, 237, 0.5)'};
`;

const ThemePreviewWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    margin-bottom: 1rem;
    background: ${({ theme }) => `radial-gradient(ellipse at center, ${theme.success || '#10b981'}15 0%, transparent 70%)`};
    border-radius: 12px;
    min-height: 100px;
`;

const ThemePreviewBox = styled.div`
    width: 100%;
    height: 80px;
    border-radius: 12px;
    background: ${props => props.$background || 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 2px solid ${props => props.$accent || 'rgba(0, 173, 237, 0.5)'};
    box-shadow: 0 0 20px ${props => `${props.$accent || 'rgba(0, 173, 237, 0.3)'}4D`};
    overflow: hidden;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: ${props => props.$accent || 'linear-gradient(90deg, #00adef, #8b5cf6)'};
    }
`;

const ThemeColorDot = styled.div`
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.$color};
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 10px ${props => props.$color}80;
`;

const PerkPreviewWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem 0;
    margin-bottom: 1rem;
    background: ${({ theme }) => `radial-gradient(ellipse at center, ${theme.brand?.accent || '#8b5cf6'}15 0%, transparent 70%)`};
    border-radius: 12px;
    min-height: 100px;
`;

const LargePerkIcon = styled.div`
    width: 70px;
    height: 70px;
    border-radius: 14px;
    background: ${props => props.$color || 'rgba(139, 92, 246, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    animation: ${float} 3s ease-in-out infinite;
    box-shadow: 0 0 25px ${props => `${props.$glowColor || 'rgba(139, 92, 246, 0.5)'}`};
    border: 2px solid ${props => props.$glowColor || 'rgba(139, 92, 246, 0.5)'};
`;

const ItemCard = styled.div`
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.8)'};
    border: 2px solid ${({ $equipped, theme }) => $equipped ? `${theme.success || '#10b981'}80` : theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    ${({ $equipped, theme }) => $equipped && css`
        background: linear-gradient(135deg, ${theme.success || '#10b981'}26, ${theme.success || '#10b981'}0D);
    `}

    &:hover {
        transform: translateY(-5px);
        box-shadow: ${({ theme }) => `0 10px 30px ${theme.brand?.primary || '#00adef'}4D`};
        border-color: ${({ theme }) => `${theme.brand?.primary || '#00adef'}80`};
    }
`;

const ItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
`;

const ItemIconWrapper = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
`;

const RarityBadge = styled.div`
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    background: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return `${theme.warning || '#f59e0b'}4D`;
        if ($rarity === 'epic') return `${theme.brand?.accent || '#8b5cf6'}4D`;
        if ($rarity === 'rare') return `${theme.info || '#3b82f6'}4D`;
        return `${theme.text?.tertiary || '#64748b'}4D`;
    }};
    color: ${({ $rarity, theme }) => {
        if ($rarity === 'legendary') return theme.warning || '#f59e0b';
        if ($rarity === 'epic') return theme.brand?.accent || '#a78bfa';
        if ($rarity === 'rare') return theme.info || '#60a5fa';
        return theme.text?.secondary || '#94a3b8';
    }};
`;

const ItemName = styled.h4`
    font-size: 1.1rem;
    color: ${({ theme }) => theme.text?.primary || '#e0e6ed'};
    margin: 0 0 0.5rem 0;
    font-weight: 700;
`;

const ItemDescription = styled.p`
    font-size: 0.85rem;
    color: ${({ theme }) => theme.text?.secondary || '#94a3b8'};
    line-height: 1.5;
    margin: 0 0 1rem 0;
`;

const EquipButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: ${({ $equipped, theme }) => $equipped ? 
        `linear-gradient(135deg, ${theme.error || '#ef4444'}4D, ${theme.error || '#ef4444'}1A)` :
        `linear-gradient(135deg, ${theme.brand?.primary || '#00adef'}, ${theme.brand?.primary || '#0891b2'})`
    };
    border: 1px solid ${({ $equipped, theme }) => $equipped ? `${theme.error || '#ef4444'}80` : `${theme.brand?.primary || '#00adef'}80`};
    border-radius: 10px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${({ $equipped, theme }) => $equipped ? 
            `0 8px 20px ${theme.error || '#ef4444'}66` : 
            `0 8px 20px ${theme.brand?.primary || '#00adef'}66`
        };
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: ${({ theme }) => theme.text?.tertiary || '#64748b'};
    background: ${({ theme }) => theme.bg?.card || 'rgba(30, 41, 59, 0.3)'};
    border: 2px dashed ${({ theme }) => theme.border?.primary || 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
`;

// ============ HELPER FUNCTIONS ============
const getInitials = (user) => {
    if (!user) return '?';
    if (user.username) {
        return user.username.substring(0, 2).toUpperCase();
    }
    if (user.email) {
        return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
};

// ============ COMPONENT ============
const EquippedItemsPage = () => {
    const { gamification, refreshGamification } = useGamification();
    const { api, user } = useAuth();
    const toast = useToast();
    const { setProfileTheme, profileThemeId } = useThemeContext();
    const theme = useStyledTheme();
    
    const [allItems, setAllItems] = useState([]);
    const [vault, setVault] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/vault/items');
            
            if (response.data.success) {
                const items = response.data.items || {};
                const flatItems = [
                    ...(items.avatarBorders || []).map(i => ({ ...i, type: 'avatar-border' })),
                    ...(items.perks || []).map(i => ({ ...i, type: 'perk' })),
                    ...(items.profileThemes || []).map(i => ({ ...i, type: 'profile-theme' })),
                    ...(items.badges || []).map(i => ({ ...i, type: 'badge' }))
                ];
                
                setAllItems(flatItems);
                setVault(response.data.vault || {});
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to load items', 'Error');
            setLoading(false);
        }
    };

    const handleEquip = async (itemId, itemType) => {
        try {
            setActionLoading(itemId);
            const response = await api.post(`/vault/equip/${itemId}`);
            
            if (response.data.success) {
                toast.success(response.data.message, '✅ Equipped!');
                
                // Update local theme immediately if it's a theme
                if (itemType === 'profile-theme') {
                    setProfileTheme(itemId);
                    console.log('🎨 Theme updated locally:', itemId);
                }
                
                await fetchItems();
                if (refreshGamification) await refreshGamification();
            }
        } catch (error) {
            console.error('Error equipping item:', error);
            toast.error(error.response?.data?.error || 'Failed to equip item', 'Error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnequip = async (itemId) => {
        try {
            setActionLoading(itemId);
            const response = await api.post(`/vault/unequip/${itemId}`);
            
            if (response.data.success) {
                toast.success(response.data.message, '✅ Unequipped!');
                await fetchItems();
                if (refreshGamification) await refreshGamification();
            }
        } catch (error) {
            console.error('Error unequipping item:', error);
            toast.error(error.response?.data?.error || 'Failed to unequip item', 'Error');
        } finally {
            setActionLoading(null);
        }
    };

    const isItemEquipped = (item) => {
        if (item.type === 'avatar-border') return vault.equippedBorder === item.id;
        if (item.type === 'profile-theme') return vault.equippedTheme === item.id;
        if (item.type === 'badge') return vault.equippedBadges?.includes(item.id);
        if (item.type === 'perk') return vault.activePerks?.includes(item.id);
        return false;
    };

    // Filter owned items by type
    const ownedBorders = allItems.filter(item => item.type === 'avatar-border' && item.owned);
    const ownedPerks = allItems.filter(item => item.type === 'perk' && item.owned);
    const ownedThemes = allItems.filter(item => item.type === 'profile-theme' && item.owned);
    const ownedBadges = allItems.filter(item => item.type === 'badge' && item.owned);

    // Get equipped items
    const equippedBorder = allItems.find(item => item.id === vault.equippedBorder);
    const equippedTheme = allItems.find(item => item.id === vault.equippedTheme);
    const equippedBadgesList = allItems.filter(item => vault.equippedBadges?.includes(item.id));
    const equippedPerksList = allItems.filter(item => vault.activePerks?.includes(item.id));

    if (loading) {
        return (
            <PageContainer>
                <BackgroundOrbs>
                    <Orb $duration="25s" />
                    <Orb $duration="30s" />
                    <Orb $duration="20s" />
                </BackgroundOrbs>
                <ContentWrapper>
                    <LoadingContainer>
                        <Sparkles size={64} color={theme?.brand?.primary || '#00adef'} />
                        <PageTitle>Loading...</PageTitle>
                    </LoadingContainer>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <BackgroundOrbs>
                <Orb $duration="25s" />
                <Orb $duration="30s" />
                <Orb $duration="20s" />
            </BackgroundOrbs>

            <ContentWrapper>
                <Header>
                    <PageTitle>Equipped Items</PageTitle>
                    <Subtitle>Customize your profile and activate bonuses</Subtitle>
                </Header>

                {/* Preview Section */}
                <PreviewSection>
                    <PreviewTitle>
                        <User size={28} />
                        Your Profile Preview
                    </PreviewTitle>
                    <PreviewGrid>
                        <AvatarPreview>
                            <AvatarContainer>
                                <AvatarWithBorder
                                    src={user?.avatar || user?.profile?.avatar}
                                    name={user?.name || user?.profile?.displayName}
                                    username={user?.username}
                                    size={100}
                                    borderId={equippedBorder?.id || 'border-bronze'}
                                    showParticles={true}
                                />
                            </AvatarContainer>
                            <StatValue>
                                {equippedBorder?.name || 'No Border Equipped'}
                            </StatValue>
                        </AvatarPreview>

                        <EquippedStats>
                            <StatCard>
                                <StatLabel>
                                    <Zap size={16} />
                                    Active Perks ({equippedPerksList.length}/3)
                                </StatLabel>
                                <StatValue>
                                    {equippedPerksList.length > 0 ? (
                                        equippedPerksList.map(perk => (
                                            <span key={perk.id} style={{ marginRight: '0.5rem' }}>
                                                {perk.icon} {perk.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: theme?.text?.tertiary || '#64748b' }}>No perks activated</span>
                                    )}
                                </StatValue>
                            </StatCard>

                            <StatCard>
                                <StatLabel>
                                    <Palette size={16} />
                                    Profile Theme
                                </StatLabel>
                                <StatValue>
                                    {equippedTheme?.name || 'Default Theme'}
                                </StatValue>
                            </StatCard>

                            <StatCard>
                                <StatLabel>
                                    <Award size={16} />
                                    Equipped Badges ({equippedBadgesList.length}/5)
                                </StatLabel>
                                <BadgeDisplay>
                                    {equippedBadgesList.length > 0 ? (
                                        equippedBadgesList.map(badge => (
                                            <BadgeIcon key={badge.id} $color={badge.color}>
                                                {badge.icon}
                                            </BadgeIcon>
                                        ))
                                    ) : (
                                        <span style={{ color: theme?.text?.tertiary || '#64748b' }}>No badges equipped</span>
                                    )}
                                </BadgeDisplay>
                            </StatCard>
                        </EquippedStats>
                    </PreviewGrid>
                </PreviewSection>

                {/* Avatar Borders */}
                <Section>
                    <SectionHeader>
                        <SectionTitle>
                            <Frame size={24} color={theme?.brand?.primary || '#00adef'} />
                            Avatar Borders
                            <ItemCount>({ownedBorders.length} owned)</ItemCount>
                        </SectionTitle>
                    </SectionHeader>
                    {ownedBorders.length === 0 ? (
                        <EmptyState>
                            <Lock size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <div>No avatar borders owned. Visit the Vault to purchase!</div>
                        </EmptyState>
                    ) : (
                        <ItemsGrid>
                            {ownedBorders.map(item => {
                                const equipped = isItemEquipped(item);
                                return (
                                    <ItemCard key={item.id} $equipped={equipped}>
                                        {/* Visual Preview of Border with Animation */}
                                        <BorderPreviewWrapper>
                                            <AvatarWithBorder
                                                src={user?.avatar || user?.profile?.avatar}
                                                name={user?.name || user?.profile?.displayName}
                                                username={user?.username}
                                                size={100}
                                                borderId={item.id}
                                                showParticles={true}
                                            />
                                        </BorderPreviewWrapper>
                                        <ItemHeader>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
                                            {equipped && (
                                                <span style={{
                                                    color: theme?.success || '#10b981',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Check size={14} /> ACTIVE
                                                </span>
                                            )}
                                        </ItemHeader>
                                        <ItemName>{item.name}</ItemName>
                                        <ItemDescription>{item.description}</ItemDescription>
                                        <EquipButton
                                            $equipped={equipped}
                                            onClick={() => equipped ? handleUnequip(item.id) : handleEquip(item.id, item.type)}
                                            disabled={actionLoading === item.id}
                                        >
                                            {actionLoading === item.id ? (
                                                'Loading...'
                                            ) : equipped ? (
                                                <>
                                                    <Check size={18} />
                                                    Equipped
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronRight size={18} />
                                                    Equip
                                                </>
                                            )}
                                        </EquipButton>
                                    </ItemCard>
                                );
                            })}
                        </ItemsGrid>
                    )}
                </Section>

                {/* Perks */}
                <Section>
                    <SectionHeader>
                        <SectionTitle>
                            <Zap size={24} color={theme?.brand?.accent || '#8b5cf6'} />
                            Perks & Boosts
                            <ItemCount>({ownedPerks.length} owned)</ItemCount>
                        </SectionTitle>
                    </SectionHeader>
                    {ownedPerks.length === 0 ? (
                        <EmptyState>
                            <Lock size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <div>No perks owned. Visit the Vault to purchase!</div>
                        </EmptyState>
                    ) : (
                        <ItemsGrid>
                            {ownedPerks.map(item => {
                                const equipped = isItemEquipped(item);
                                return (
                                    <ItemCard key={item.id} $equipped={equipped}>
                                        {/* Visual Perk Preview */}
                                        <PerkPreviewWrapper>
                                            <LargePerkIcon
                                                $color={`${theme?.brand?.accent || '#8b5cf6'}33`}
                                                $glowColor={theme?.brand?.accent || '#8b5cf6'}
                                            >
                                                {item.icon}
                                            </LargePerkIcon>
                                        </PerkPreviewWrapper>
                                        <ItemHeader>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
                                            {equipped && (
                                                <span style={{
                                                    color: theme?.success || '#10b981',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Zap size={14} /> ACTIVE
                                                </span>
                                            )}
                                        </ItemHeader>
                                        <ItemName>{item.name}</ItemName>
                                        <ItemDescription>{item.description}</ItemDescription>
                                        <EquipButton
                                            $equipped={equipped}
                                            onClick={() => equipped ? handleUnequip(item.id) : handleEquip(item.id, item.type)}
                                            disabled={actionLoading === item.id || (!equipped && equippedPerksList.length >= 3)}
                                        >
                                            {actionLoading === item.id ? (
                                                'Loading...'
                                            ) : equipped ? (
                                                <>
                                                    <Check size={18} />
                                                    Deactivate
                                                </>
                                            ) : equippedPerksList.length >= 3 ? (
                                                <>
                                                    <Lock size={18} />
                                                    Max 3 Perks
                                                </>
                                            ) : (
                                                <>
                                                    <Zap size={18} />
                                                    Activate
                                                </>
                                            )}
                                        </EquipButton>
                                    </ItemCard>
                                );
                            })}
                        </ItemsGrid>
                    )}
                </Section>

                {/* Profile Themes */}
                <Section>
                    <SectionHeader>
                        <SectionTitle>
                            <Palette size={24} color={theme?.success || '#10b981'} />
                            Profile Themes
                            <ItemCount>({ownedThemes.length} owned)</ItemCount>
                        </SectionTitle>
                    </SectionHeader>
                    {ownedThemes.length === 0 ? (
                        <EmptyState>
                            <Lock size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <div>No themes owned. Visit the Vault to purchase!</div>
                        </EmptyState>
                    ) : (
                        <ItemsGrid>
                            {ownedThemes.map(item => {
                                const equipped = isItemEquipped(item);
                                // Extract colors for the theme preview
                                const previewBg = item.colors?.background || 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)';
                                const previewAccent = item.colors?.primary || item.colors?.accent || theme?.brand?.primary || '#00adef';
                                return (
                                    <ItemCard key={item.id} $equipped={equipped}>
                                        {/* Theme Visual Preview */}
                                        <ThemePreviewWrapper>
                                            <ThemePreviewBox
                                                $background={previewBg}
                                                $accent={previewAccent}
                                            >
                                                {item.colors && (
                                                    <>
                                                        <ThemeColorDot $color={item.colors.primary || '#00adef'} />
                                                        <ThemeColorDot $color={item.colors.accent || '#8b5cf6'} />
                                                        {item.colors.success && <ThemeColorDot $color={item.colors.success} />}
                                                        {item.colors.warning && <ThemeColorDot $color={item.colors.warning} />}
                                                    </>
                                                )}
                                                {!item.colors && (
                                                    <span style={{ color: '#94a3b8', fontSize: '2rem' }}>🎨</span>
                                                )}
                                            </ThemePreviewBox>
                                        </ThemePreviewWrapper>
                                        <ItemHeader>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
                                            {equipped && (
                                                <span style={{
                                                    color: theme?.success || '#10b981',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Check size={14} /> ACTIVE
                                                </span>
                                            )}
                                        </ItemHeader>
                                        <ItemName>{item.name}</ItemName>
                                        <ItemDescription>{item.description}</ItemDescription>
                                        <EquipButton
                                            $equipped={equipped}
                                            onClick={() => equipped ? null : handleEquip(item.id, item.type)}
                                            disabled={actionLoading === item.id || equipped}
                                        >
                                            {actionLoading === item.id ? (
                                                'Loading...'
                                            ) : equipped ? (
                                                <>
                                                    <Check size={18} />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <Palette size={18} />
                                                    Apply Theme
                                                </>
                                            )}
                                        </EquipButton>
                                    </ItemCard>
                                );
                            })}
                        </ItemsGrid>
                    )}
                </Section>

                {/* Badges */}
                <Section>
                    <SectionHeader>
                        <SectionTitle>
                            <Award size={24} color={theme?.warning || '#f59e0b'} />
                            Badges
                            <ItemCount>({ownedBadges.length} owned)</ItemCount>
                        </SectionTitle>
                    </SectionHeader>
                    {ownedBadges.length === 0 ? (
                        <EmptyState>
                            <Lock size={40} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <div>No badges earned yet. Complete achievements to unlock!</div>
                        </EmptyState>
                    ) : (
                        <ItemsGrid>
                            {ownedBadges.map(item => {
                                const equipped = isItemEquipped(item);
                                return (
                                    <ItemCard key={item.id} $equipped={equipped}>
                                        {/* Large Badge Visual Preview */}
                                        <BadgePreviewWrapper>
                                            <LargeBadgeIcon
                                                $color={item.color || `${theme?.warning || '#f59e0b'}33`}
                                                $glowColor={item.color?.replace('0.2', '0.6') || theme?.warning || '#f59e0b'}
                                            >
                                                {item.icon}
                                            </LargeBadgeIcon>
                                        </BadgePreviewWrapper>
                                        <ItemHeader>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
                                            {equipped && (
                                                <span style={{
                                                    color: theme?.success || '#10b981',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Check size={14} /> DISPLAYED
                                                </span>
                                            )}
                                        </ItemHeader>
                                        <ItemName>{item.name}</ItemName>
                                        <ItemDescription>{item.description}</ItemDescription>
                                        <EquipButton
                                            $equipped={equipped}
                                            onClick={() => equipped ? handleUnequip(item.id) : handleEquip(item.id, item.type)}
                                            disabled={actionLoading === item.id || (!equipped && equippedBadgesList.length >= 5)}
                                        >
                                            {actionLoading === item.id ? (
                                                'Loading...'
                                            ) : equipped ? (
                                                <>
                                                    <Check size={18} />
                                                    Remove
                                                </>
                                            ) : equippedBadgesList.length >= 5 ? (
                                                <>
                                                    <Lock size={18} />
                                                    Max 5 Badges
                                                </>
                                            ) : (
                                                <>
                                                    <Award size={18} />
                                                    Display Badge
                                                </>
                                            )}
                                        </EquipButton>
                                    </ItemCard>
                                );
                            })}
                        </ItemsGrid>
                    )}
                </Section>
            </ContentWrapper>
        </PageContainer>
    );
};

export default EquippedItemsPage;
