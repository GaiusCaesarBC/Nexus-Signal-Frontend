// client/src/pages/EquippedItemsPage.js - FIXED: Updates theme when equipped
import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { 
    User, Zap, Star, Award, Palette, Frame, Shield, 
    Check, Lock, ChevronRight, Sparkles, Crown
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext'; // ✅ ADD THIS

// Animations
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

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
`;

const ContentWrapper = styled.div`
    max-width: 1400px;
    margin: 0 auto;
`;

const Header = styled.div`
    text-align: center;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PageTitle = styled.h1`
    font-size: 3rem;
    background: linear-gradient(135deg, #00adef 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 1rem 0;
    font-weight: 900;
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.1rem;
`;

// Preview Section
const PreviewSection = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 24px;
    padding: 3rem;
    margin-bottom: 3rem;
    animation: ${fadeIn} 0.8s ease-out;
`;

const PreviewTitle = styled.h2`
    font-size: 1.8rem;
    color: #00adef;
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
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9));
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const AvatarIcon = styled.div`
    font-size: 5rem;
    color: #00adef;
`;

const EquippedStats = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const StatCard = styled.div`
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    padding: 1.5rem;
`;

const StatLabel = styled.div`
    font-size: 0.85rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatValue = styled.div`
    font-size: 1.5rem;
    color: #e0e6ed;
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
    border-bottom: 2px solid rgba(0, 173, 237, 0.2);
`;

const SectionTitle = styled.h3`
    font-size: 1.5rem;
    color: #e0e6ed;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ItemCount = styled.span`
    color: #64748b;
    font-size: 1rem;
    font-weight: 400;
`;

const ItemsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
`;

const ItemCard = styled.div`
    background: rgba(30, 41, 59, 0.8);
    border: 2px solid ${props => props.$equipped ? 'rgba(16, 185, 129, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    ${props => props.$equipped && css`
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
    `}

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 173, 237, 0.3);
        border-color: rgba(0, 173, 237, 0.5);
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
    background: ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.3)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.3)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.3)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    color: ${props => {
        if (props.$rarity === 'legendary') return '#f59e0b';
        if (props.$rarity === 'epic') return '#a78bfa';
        if (props.$rarity === 'rare') return '#60a5fa';
        return '#94a3b8';
    }};
`;

const ItemName = styled.h4`
    font-size: 1.1rem;
    color: #e0e6ed;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
`;

const ItemDescription = styled.p`
    font-size: 0.85rem;
    color: #94a3b8;
    line-height: 1.5;
    margin: 0 0 1rem 0;
`;

const EquipButton = styled.button`
    width: 100%;
    padding: 0.75rem;
    background: ${props => props.$equipped ? 
        'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))' :
        'linear-gradient(135deg, #00adef, #0891b2)'
    };
    border: 1px solid ${props => props.$equipped ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 173, 237, 0.5)'};
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
        box-shadow: 0 8px 20px ${props => props.$equipped ? 
            'rgba(239, 68, 68, 0.4)' : 
            'rgba(0, 173, 237, 0.4)'
        };
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #64748b;
    background: rgba(30, 41, 59, 0.3);
    border: 2px dashed rgba(100, 116, 139, 0.3);
    border-radius: 16px;
`;

// Component
const EquippedItemsPage = () => {
    const { gamification, refreshGamification } = useGamification();
    const { api } = useAuth();
    const toast = useToast();
    const { setProfileTheme } = useTheme(); // ✅ ADD THIS
    
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
                // Flatten items from categories and add type field
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
                
                // ✅ UPDATE LOCAL THEME IMMEDIATELY IF IT'S A THEME
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

    // Check if item is equipped based on vault data
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
                <ContentWrapper>
                    <Header>
                        <PageTitle>Loading...</PageTitle>
                    </Header>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
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
                                <AvatarBorder 
                                    $gradient={equippedBorder?.gradient}
                                    $animate={equippedBorder?.animation === 'pulse-glow'}
                                    $shimmer={equippedBorder?.animation === 'shimmer'}
                                >
                                    <AvatarInner>
                                        <AvatarIcon>
                                            <User size={80} />
                                        </AvatarIcon>
                                    </AvatarInner>
                                </AvatarBorder>
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
                                        <span style={{ color: '#64748b' }}>No perks activated</span>
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
                                        <span style={{ color: '#64748b' }}>No badges equipped</span>
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
                            <Frame size={24} />
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
                                        <ItemHeader>
                                            <ItemIconWrapper $color={item.glowColor}>
                                                🖼️
                                            </ItemIconWrapper>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
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
                            <Zap size={24} />
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
                                        <ItemHeader>
                                            <ItemIconWrapper $color="rgba(139, 92, 246, 0.3)">
                                                {item.icon}
                                            </ItemIconWrapper>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
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
                            <Palette size={24} />
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
                                return (
                                    <ItemCard key={item.id} $equipped={equipped}>
                                        <ItemHeader>
                                            <ItemIconWrapper 
                                                $color={item.colors?.background || 'rgba(0, 173, 237, 0.2)'}
                                            >
                                                🎨
                                            </ItemIconWrapper>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
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
                            <Award size={24} />
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
                                        <ItemHeader>
                                            <ItemIconWrapper $color={item.color}>
                                                {item.icon}
                                            </ItemIconWrapper>
                                            <RarityBadge $rarity={item.rarity}>
                                                {item.rarity}
                                            </RarityBadge>
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