// client/src/pages/VaultPage.js
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
    Lock, Unlock, Zap, Star, Crown, Shield, Sparkles, 
    ShoppingCart, Check, X, TrendingUp, Award, Eye, 
    Bell, Briefcase, Brain, Download, Headphones, Save,
    Palette, Frame, FastForward, BarChart3
} from 'lucide-react';
import { useGamification } from '../context/GamificationContext';
import axios from 'axios';

// Animations
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
`;

const pulse = keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
`;

// Styled Components
const PageContainer = styled.div`
    min-height: 100vh;
    padding: 6rem 2rem 2rem;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 400px;
        background: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 70%);
        pointer-events: none;
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

const VaultIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1));
    border: 3px solid rgba(245, 158, 11, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;
    animation: ${float} 3s ease-in-out infinite;
    box-shadow: 0 0 60px rgba(245, 158, 11, 0.4);
`;

const PageTitle = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 1rem 0;
    font-weight: 900;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin: 0 0 2rem 0;
`;

const CoinsDisplay = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 2rem;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
    border: 2px solid rgba(245, 158, 11, 0.4);
    border-radius: 16px;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const CoinsAmount = styled.div`
    font-size: 2rem;
    font-weight: 900;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
`;

const CoinsLabel = styled.div`
    font-size: 0.9rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const FilterSection = styled.div`
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    animation: ${fadeIn} 0.8s ease-out;
`;

const FilterButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1))' : 
        'rgba(30, 41, 59, 0.5)'
    };
    border: 1px solid ${props => props.$active ? 'rgba(245, 158, 11, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#f59e0b' : '#94a3b8'};
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;

    &:hover {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05));
        border-color: rgba(245, 158, 11, 0.5);
        color: #f59e0b;
        transform: translateY(-2px);
    }
`;

const ItemsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    animation: ${fadeIn} 1s ease-out;
`;

const ItemCard = styled.div`
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid ${props => {
        if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.5)';
        if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.5)';
        if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.5)';
        return 'rgba(100, 116, 139, 0.3)';
    }};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: ${shimmer} 3s infinite;
    }

    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 50px ${props => {
            if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.3)';
            if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.3)';
            if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.3)';
            return 'rgba(0, 173, 237, 0.3)';
        }};
        border-color: ${props => {
            if (props.$rarity === 'legendary') return 'rgba(245, 158, 11, 0.8)';
            if (props.$rarity === 'epic') return 'rgba(139, 92, 246, 0.8)';
            if (props.$rarity === 'rare') return 'rgba(59, 130, 246, 0.8)';
            return 'rgba(0, 173, 237, 0.5)';
        }};
    }
`;

const ItemHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
`;

const ItemIconWrapper = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: ${props => props.$color || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.$iconColor || '#00adef'};
    box-shadow: 0 8px 20px ${props => props.$color || 'rgba(0, 173, 237, 0.3)'};
    font-size: 1.8rem;
`;

const RarityBadge = styled.div`
    padding: 0.25rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${props => {
        if (props.$rarity === 'legendary') return 'linear-gradient(135deg, #f59e0b, #fbbf24)';
        if (props.$rarity === 'epic') return 'linear-gradient(135deg, #8b5cf6, #a78bfa)';
        if (props.$rarity === 'rare') return 'linear-gradient(135deg, #3b82f6, #60a5fa)';
        return 'linear-gradient(135deg, #64748b, #94a3b8)';
    }};
    color: white;
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const ItemName = styled.h3`
    font-size: 1.3rem;
    color: #e0e6ed;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
`;

const ItemDescription = styled.p`
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.5;
    margin: 0 0 1.5rem 0;
`;

const ItemFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    border-top: 1px solid rgba(100, 116, 139, 0.2);
`;

const PriceTag = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.3rem;
    font-weight: 900;
    color: #f59e0b;
`;

const PurchaseButton = styled.button`
    padding: 0.75rem 1.5rem;
    background: ${props => props.$owned ? 
        'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))' :
        'linear-gradient(135deg, #f59e0b, #fbbf24)'
    };
    border: 1px solid ${props => props.$owned ? 'rgba(16, 185, 129, 0.5)' : 'transparent'};
    border-radius: 10px;
    color: white;
    font-weight: 700;
    cursor: ${props => props.$owned ? 'default' : 'pointer'};
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        ${props => !props.$owned && `
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
        `}
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const LevelRequirement = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    color: #a78bfa;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 1rem;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 5rem 2rem;
    color: #64748b;
`;

const EmptyIcon = styled.div`
    width: 120px;
    height: 120px;
    margin: 0 auto 2rem;
    border-radius: 50%;
    background: rgba(245, 158, 11, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #f59e0b;
`;

const EmptyText = styled.div`
    font-size: 1.5rem;
    color: #94a3b8;
    margin-bottom: 0.5rem;
    font-weight: 700;
`;

// Component
const VaultPage = () => {
    const { gamification, refreshGamification } = useGamification();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [purchasing, setPurchasing] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/vault/items', {
                headers: { 'x-auth-token': token }
            });
            
            // ✅ FIX: Access response.data.items
            setItems(response.data.items || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vault items:', error);
            setLoading(false);
        }
    };

    const handlePurchase = async (itemId) => {
        if (purchasing) return;

        try {
            setPurchasing(itemId);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:5000/api/vault/purchase/${itemId}`,
                {},
                { headers: { 'x-auth-token': token } }
            );

            alert(response.data.message);
            
            // Refresh data
            await fetchItems();
            await refreshGamification();
        } catch (error) {
            console.error('Error purchasing item:', error);
            alert(error.response?.data?.message || 'Failed to purchase item');
        } finally {
            setPurchasing(null);
        }
    };

    // ✅ FIX: Updated filtering logic
    const filteredItems = filter === 'all' 
        ? items 
        : items.filter(item => {
            if (filter === 'feature') return item.type === 'perk';
            if (filter === 'boost') return item.type === 'perk';
            if (filter === 'cosmetic') return item.type === 'avatar-border' || item.type === 'profile-theme' || item.type === 'badge';
            if (filter === 'utility') return item.type === 'perk';
            return true;
        });

    const getRarityIcon = (rarity) => {
        if (rarity === 'legendary') return <Crown size={14} />;
        if (rarity === 'epic') return <Star size={14} />;
        if (rarity === 'rare') return <Sparkles size={14} />;
        return <Shield size={14} />;
    };

    if (loading) {
        return (
            <PageContainer>
                <ContentWrapper>
                    <EmptyState>
                        <EmptyText>Loading The Vault...</EmptyText>
                    </EmptyState>
                </ContentWrapper>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ContentWrapper>
                <Header>
                    <VaultIcon>
                        <Lock size={60} />
                    </VaultIcon>
                    <PageTitle>The Vault</PageTitle>
                    <Subtitle>Unlock premium features, power-ups, and exclusive items</Subtitle>
                    <CoinsDisplay>
                        <Zap size={32} color="#f59e0b" />
                        <div>
                            <CoinsAmount>{gamification?.nexusCoins?.toLocaleString() || 0}</CoinsAmount>
                            <CoinsLabel>Nexus Coins</CoinsLabel>
                        </div>
                    </CoinsDisplay>
                </Header>

                <FilterSection>
                    <FilterButton 
                        $active={filter === 'all'} 
                        onClick={() => setFilter('all')}
                    >
                        All Items
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'feature'} 
                        onClick={() => setFilter('feature')}
                    >
                        🔓 Features
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'boost'} 
                        onClick={() => setFilter('boost')}
                    >
                        ⚡ Boosts
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'cosmetic'} 
                        onClick={() => setFilter('cosmetic')}
                    >
                        🎨 Cosmetics
                    </FilterButton>
                    <FilterButton 
                        $active={filter === 'utility'} 
                        onClick={() => setFilter('utility')}
                    >
                        🛠️ Utility
                    </FilterButton>
                </FilterSection>

                {filteredItems.length === 0 ? (
                    <EmptyState>
                        <EmptyIcon>
                            <Lock size={60} />
                        </EmptyIcon>
                        <EmptyText>No items found</EmptyText>
                    </EmptyState>
                ) : (
                    <ItemsGrid>
                        {filteredItems.map(item => {
                            // ✅ FIX: Use item.cost and item.canUnlock
                            const canAfford = gamification?.nexusCoins >= item.cost;
                            const meetsLevel = !item.unlockRequirement || item.canUnlock;
                            const canPurchase = canAfford && meetsLevel && !item.owned;

                            return (
                                <ItemCard key={item.id} $rarity={item.rarity}>
                                    <ItemHeader>
                                        <ItemIconWrapper $color={item.glowColor || item.color}>
                                            {item.icon || '⭐'}
                                        </ItemIconWrapper>
                                        <RarityBadge $rarity={item.rarity}>
                                            {getRarityIcon(item.rarity)}
                                            {item.rarity}
                                        </RarityBadge>
                                    </ItemHeader>

                                    {item.unlockRequirement && item.unlockRequirement.type === 'level' && (
                                        <LevelRequirement>
                                            <Shield size={16} />
                                            Level {item.unlockRequirement.value} Required
                                        </LevelRequirement>
                                    )}

                                    <ItemName>{item.name}</ItemName>
                                    <ItemDescription>{item.description}</ItemDescription>

                                    <ItemFooter>
                                        <PriceTag>
                                            <Zap size={24} />
                                            {item.cost === 0 ? 'FREE' : item.cost.toLocaleString()}
                                        </PriceTag>
                                        <PurchaseButton
                                            $owned={item.owned}
                                            onClick={() => !item.owned && handlePurchase(item.id)}
                                            disabled={!canPurchase || purchasing === item.id}
                                        >
                                            {item.owned ? (
                                                <>
                                                    <Check size={18} />
                                                    Owned
                                                </>
                                            ) : purchasing === item.id ? (
                                                'Purchasing...'
                                            ) : !meetsLevel ? (
                                                <>
                                                    <Lock size={18} />
                                                    Locked
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart size={18} />
                                                    {item.cost === 0 ? 'Claim' : 'Purchase'}
                                                </>
                                            )}
                                        </PurchaseButton>
                                    </ItemFooter>
                                </ItemCard>
                            );
                        })}
                    </ItemsGrid>
                )}
            </ContentWrapper>
        </PageContainer>
    );
};

export default VaultPage;