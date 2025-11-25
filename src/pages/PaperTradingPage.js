// client/src/pages/PaperTradingPage.js - WITH LONG/SHORT TRADING
// Features: Long & Short Positions, Auto-refresh, Confirmation Modal, Position Details, Price Alerts

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    TrendingUp, TrendingDown, DollarSign, Activity, Target, Zap,
    ArrowUpRight, ArrowDownRight, RefreshCw, Search, Plus, Minus,
    Send, Trophy, Flame, Award, Eye, Heart, MessageCircle,
    Share2, BarChart3, PieChart, Percent, Clock, CheckCircle,
    XCircle, AlertCircle, ThumbsUp, Star, Users, Calendar, Bell,
    AlertTriangle, Shield, TrendingDown as ShortIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ============ ANIMATIONS ============
const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
`;

const pulse = keyframes`
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(0, 173, 237, 0.4); }
    50% { box-shadow: 0 0 40px rgba(0, 173, 237, 0.8); }
`;

const spin = keyframes`
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
`;

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
`;

const warningPulse = keyframes`
    0%, 100% { 
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        border-color: rgba(239, 68, 68, 0.5);
    }
    50% { 
        box-shadow: 0 0 40px rgba(239, 68, 68, 0.8);
        border-color: rgba(239, 68, 68, 0.8);
    }
`;

// ============ BASE STYLED COMPONENTS ============
const PageContainer = styled.div`
    min-height: 100vh;
    padding-top: 80px;
    background: linear-gradient(145deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%);
    color: #e0e6ed;
    padding: 2rem;
    padding-top: 100px;
`;

const Header = styled.div`
    max-width: 1800px;
    margin: 0 auto 3rem;
    text-align: center;
    animation: ${fadeIn} 0.8s ease-out;
`;

const Title = styled.h1`
    font-size: 3.5rem;
    background: linear-gradient(135deg, #00adef 0%, #00ff88 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.5rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    @media (max-width: 768px) {
        font-size: 2.5rem;
    }
`;

const Subtitle = styled.p`
    color: #94a3b8;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
`;

const PoweredBy = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.2);
    border: 1px solid rgba(0, 173, 237, 0.4);
    border-radius: 20px;
    font-size: 0.9rem;
    color: #00adef;
    animation: ${glow} 3s ease-in-out infinite;
`;

const PortfolioOverview = styled.div`
    max-width: 1800px;
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const StatCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 2px solid ${props => props.$borderColor || 'rgba(0, 173, 237, 0.3)'};
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        transform: translateY(-5px);
        border-color: ${props => props.$borderColor || 'rgba(0, 173, 237, 0.6)'};
        box-shadow: 0 10px 30px ${props => props.$shadowColor || 'rgba(0, 173, 237, 0.3)'};
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: ${props => props.$gradient || 'linear-gradient(90deg, #00adef, #00ff88)'};
    }
`;

const StatIcon = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    background: ${props => props.$background || 'rgba(0, 173, 237, 0.2)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    animation: ${float} 3s ease-in-out infinite;
`;

const StatLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
`;

const StatValue = styled.div`
    font-size: 2rem;
    font-weight: 900;
    color: ${props => props.$color || '#00adef'};
    margin-bottom: 0.25rem;
`;

const StatChange = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const ContentGrid = styled.div`
    max-width: 1800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;

    @media (max-width: 1400px) {
        grid-template-columns: 1fr;
    }
`;

const TradingPanel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const PanelTitle = styled.h2`
    color: #00adef;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

// ✅ NEW: Position Type Selector
const PositionTypeSelector = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(0, 173, 237, 0.2);
`;

const PositionTypeButton = styled.button`
    padding: 1.25rem;
    background: ${props => props.$active ? 
        props.$short ?
            'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.15) 100%)' :
            'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.15) 100%)'
        :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? 
        props.$short ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)' 
        : 
        'rgba(100, 116, 139, 0.3)'
    };
    border-radius: 12px;
    color: ${props => props.$active ? 
        props.$short ? '#ef4444' : '#10b981' 
        : 
        '#94a3b8'
    };
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background: ${props => props.$short ?
            'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.15) 100%)' :
            'linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(16, 185, 129, 0.15) 100%)'
        };
        border-color: ${props => props.$short ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)'};
        color: ${props => props.$short ? '#ef4444' : '#10b981'};
        transform: translateY(-2px);
    }
`;

const PositionTypeLabel = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PositionTypeDesc = styled.div`
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.8;
    text-align: center;
`;

// ✅ NEW: Risk Warning for Shorts
const RiskWarning = styled.div`
    padding: 1.25rem;
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.4);
    border-radius: 12px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: start;
    gap: 1rem;
    animation: ${warningPulse} 2s ease-in-out infinite;
`;

const RiskWarningIcon = styled.div`
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;

const RiskWarningContent = styled.div`
    flex: 1;
`;

const RiskWarningTitle = styled.div`
    color: #ef4444;
    font-weight: 700;
    font-size: 1.05rem;
    margin-bottom: 0.5rem;
`;

const RiskWarningText = styled.div`
    color: #fca5a5;
    font-size: 0.9rem;
    line-height: 1.5;
`;

const TabButtons = styled.div`
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
`;

const TabButton = styled.button`
    flex: 1;
    padding: 1rem;
    background: ${props => props.$active ? 
        'linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%)' :
        'rgba(30, 41, 59, 0.5)'
    };
    border: 2px solid ${props => props.$active ? 'rgba(0, 173, 237, 0.5)' : 'rgba(100, 116, 139, 0.3)'};
    border-radius: 12px;
    color: ${props => props.$active ? '#00adef' : '#94a3b8'};
    font-weight: 700;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.15) 100%);
        border-color: rgba(0, 173, 237, 0.5);
        color: #00adef;
        transform: translateY(-2px);
    }
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

const FormGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const Label = styled.label`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Input = styled.input`
    padding: 1rem 1.25rem;
    background: rgba(0, 173, 237, 0.05);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.3);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const Select = styled.select`
    padding: 1rem 1.25rem;
    background: rgba(0, 173, 237, 0.05);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
    }

    option {
        background: #1a1f3a;
        color: #e0e6ed;
    }
`;

const TextArea = styled.textarea`
    padding: 1rem 1.25rem;
    background: rgba(0, 173, 237, 0.05);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    color: #e0e6ed;
    font-size: 1rem;
    min-height: 100px;
    resize: vertical;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
        outline: none;
        border-color: #00adef;
        background: rgba(0, 173, 237, 0.1);
        box-shadow: 0 0 20px rgba(0, 173, 237, 0.3);
    }

    &::placeholder {
        color: #64748b;
    }
`;

const PriceDisplay = styled.div`
    padding: 1.5rem;
    background: rgba(0, 173, 237, 0.1);
    border: 2px solid rgba(0, 173, 237, 0.3);
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const PriceLabel = styled.div`
    color: #94a3b8;
    font-size: 0.9rem;
    font-weight: 600;
`;

const PriceValue = styled.div`
    color: #00adef;
    font-size: 1.5rem;
    font-weight: 900;
`;

const TotalDisplay = styled.div`
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
    border: 2px solid rgba(0, 173, 237, 0.4);
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const TotalLabel = styled.div`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
`;

const TotalValue = styled.div`
    color: #00ff88;
    font-size: 1.8rem;
    font-weight: 900;
`;

const SubmitButton = styled.button`
    padding: 1.25rem 2rem;
    background: ${props => 
        props.$positionType === 'short' ?
            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
        props.$variant === 'sell' ?
            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
            'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    };
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.2rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;

    &:hover:not(:disabled) {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => 
            props.$positionType === 'short' || props.$variant === 'sell' ?
                'rgba(239, 68, 68, 0.5)' :
                'rgba(16, 185, 129, 0.5)'
        };
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const LoadingSpinner = styled(RefreshCw)`
    animation: ${spin} 1s linear infinite;
`;

const PositionsList = styled.div`
    margin-top: 2rem;
`;

const PositionsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
`;

const PositionsTitle = styled.h3`
    color: #00adef;
    font-size: 1.2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const RefreshButton = styled.button`
    padding: 0.5rem 1rem;
    background: rgba(0, 173, 237, 0.1);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        background: rgba(0, 173, 237, 0.2);
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

// ✅ UPDATED: Position Card with position type support
const PositionCard = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid ${props => 
        props.$positionType === 'short' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
    };
    border-left: 4px solid ${props => props.$positive ? '#10b981' : '#ef4444'};
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
        transform: translateX(5px);
    }
`;

// ✅ NEW: Position Type Badge
const PositionTypeBadge = styled.div`
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.4rem 0.75rem;
    background: ${props => props.$short ?
        'rgba(239, 68, 68, 0.2)' :
        'rgba(16, 185, 129, 0.2)'
    };
    border: 1px solid ${props => props.$short ?
        'rgba(239, 68, 68, 0.4)' :
        'rgba(16, 185, 129, 0.4)'
    };
    border-radius: 6px;
    color: ${props => props.$short ? '#ef4444' : '#10b981'};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 0.35rem;
`;

const PositionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
`;

const PositionSymbol = styled.div`
    font-size: 1.3rem;
    font-weight: 900;
    color: #00adef;
`;

const PositionPL = styled.div`
    text-align: right;
`;

const PLValue = styled.div`
    font-size: 1.2rem;
    font-weight: 900;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const PLPercent = styled.div`
    font-size: 0.9rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
`;

const PositionDetails = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
`;

const PositionDetail = styled.div``;

const DetailLabel = styled.div`
    color: #64748b;
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
    color: #e0e6ed;
    font-size: 0.95rem;
    font-weight: 600;
`;

const SellButton = styled.button`
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    background: ${props => props.$cover ?
        'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    };
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px ${props => props.$cover ?
            'rgba(16, 185, 129, 0.4)' :
            'rgba(239, 68, 68, 0.4)'
        };
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem 2rem;
    color: #64748b;
`;

const EmptyIcon = styled.div`
    width: 100px;
    height: 100px;
    margin: 0 auto 1rem;
    background: rgba(0, 173, 237, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${float} 3s ease-in-out infinite;
`;

const EmptyText = styled.div`
    font-size: 1.1rem;
    color: #94a3b8;
`;

const OrdersHistory = styled.div`
    margin-top: 2rem;
`;

const OrderCard = styled.div`
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(15, 23, 42, 0.8);
    }
`;

const OrderHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
`;

const OrderSide = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.75rem;
    background: ${props => props.$side === 'buy' ?
        'rgba(16, 185, 129, 0.2)' :
        'rgba(239, 68, 68, 0.2)'
    };
    border-radius: 8px;
    color: ${props => props.$side === 'buy' ? '#10b981' : '#ef4444'};
    font-weight: 700;
    font-size: 0.9rem;
`;

const OrderTime = styled.div`
    color: #64748b;
    font-size: 0.85rem;
`;

const OrderDetails = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const OrderInfo = styled.div`
    color: #e0e6ed;
`;

const OrderSymbol = styled.span`
    font-weight: 900;
    color: #00adef;
    font-size: 1.1rem;
`;

const OrderQty = styled.span`
    color: #94a3b8;
    font-size: 0.9rem;
    margin-left: 0.5rem;
`;

const OrderAmount = styled.div`
    text-align: right;
`;

const Amount = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
    color: #e0e6ed;
`;

const OrderPL = styled.div`
    font-size: 0.85rem;
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-weight: 600;
`;

const Sidebar = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2rem;

    @media (max-width: 1400px) {
        display: none;
    }
`;

const StatsPanel = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);

    &:last-child {
        border-bottom: none;
    }
`;

const StatRowLabel = styled.div`
    color: #94a3b8;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const StatRowValue = styled.div`
    color: ${props => props.$color || '#e0e6ed'};
    font-size: 1.1rem;
    font-weight: 700;
`;

const BadgeContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(0, 173, 237, 0.2);
`;

const Badge = styled.div`
    padding: 0.5rem 1rem;
    background: ${props => props.$gradient || 'rgba(0, 173, 237, 0.2)'};
    border: 1px solid ${props => props.$borderColor || 'rgba(0, 173, 237, 0.3)'};
    border-radius: 20px;
    color: ${props => props.$color || '#00adef'};
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: ${pulse} 2s ease-in-out infinite;
`;

const LeaderboardPreview = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 16px;
    padding: 2rem;
    animation: ${fadeIn} 0.6s ease-out;
`;

const LeaderboardItem = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0, 173, 237, 0.05);
    border-radius: 10px;
    margin-bottom: 0.75rem;

    &:hover {
        background: rgba(0, 173, 237, 0.1);
    }
`;

const Rank = styled.div`
    width: 40px;
    height: 40px;
    background: ${props => {
        if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
        if (props.$rank === 2) return 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
        if (props.$rank === 3) return 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)';
        return 'rgba(0, 173, 237, 0.2)';
    }};
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.2rem;
    color: white;
`;

const TraderInfo = styled.div`
    flex: 1;
`;

const TraderName = styled.div`
    color: #e0e6ed;
    font-weight: 700;
    margin-bottom: 0.25rem;
`;

const TraderReturn = styled.div`
    color: ${props => props.$positive ? '#10b981' : '#ef4444'};
    font-size: 0.9rem;
    font-weight: 600;
`;

const ViewAllButton = styled.button`
    width: 100%;
    padding: 1rem;
    background: linear-gradient(135deg, rgba(0, 173, 237, 0.2) 0%, rgba(0, 173, 237, 0.1) 100%);
    border: 1px solid rgba(0, 173, 237, 0.3);
    border-radius: 10px;
    color: #00adef;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;

    &:hover {
        background: linear-gradient(135deg, rgba(0, 173, 237, 0.3) 0%, rgba(0, 173, 237, 0.2) 100%);
        transform: translateY(-2px);
    }
`;

// ============ CONFIRMATION MODAL ============
const ConfirmationModal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: ${fadeIn} 0.2s ease-out;
`;

const ConfirmationCard = styled.div`
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 2px solid ${props => props.$variant === 'sell' ? '#ef4444' : '#10b981'};
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 500px;
    width: 90%;
    animation: ${slideIn} 0.3s ease-out;
`;

const ConfirmationTitle = styled.h3`
    color: ${props => props.$variant === 'sell' ? '#ef4444' : '#10b981'};
    font-size: 1.8rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const ConfirmationDetails = styled.div`
    background: rgba(0, 173, 237, 0.05);
    border: 1px solid rgba(0, 173, 237, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
`;

const DetailRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(0, 173, 237, 0.1);

    &:last-child {
        border-bottom: none;
    }
`;

const DetailLabelModal = styled.span`
    color: #94a3b8;
    font-size: 0.95rem;
`;

const DetailValueModal = styled.span`
    color: #e0e6ed;
    font-size: 1.1rem;
    font-weight: 700;
`;

const ConfirmationButtons = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
`;

const CancelButton = styled.button`
    flex: 1;
    padding: 1rem;
    background: rgba(100, 116, 139, 0.2);
    border: 2px solid rgba(100, 116, 139, 0.4);
    border-radius: 12px;
    color: #94a3b8;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(100, 116, 139, 0.3);
        border-color: rgba(100, 116, 139, 0.6);
        transform: translateY(-2px);
    }
`;

const ConfirmButton = styled.button`
    flex: 1;
    padding: 1rem;
    background: ${props => props.$variant === 'sell' ?
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
        'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    };
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 900;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px ${props => props.$variant === 'sell' ?
            'rgba(239, 68, 68, 0.5)' :
            'rgba(16, 185, 129, 0.5)'
        };
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(100, 116, 139, 0.2);
    border: 2px solid rgba(100, 116, 139, 0.4);
    color: #94a3b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(239, 68, 68, 0.3);
        border-color: rgba(239, 68, 68, 0.6);
        color: #ef4444;
        transform: rotate(90deg);
    }
`;

// ============ MAIN COMPONENT ============
const PaperTradingPage = () => {
    const { api, user } = useAuth();
    const toast = useToast();

    // State
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('buy');
    const [submitting, setSubmitting] = useState(false);
    const [refreshingPrices, setRefreshingPrices] = useState(false);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [pendingTrade, setPendingTrade] = useState(null);
   
    // ✅ NEW: Position Type State
    const [positionType, setPositionType] = useState('long'); // 'long' or 'short'
   
    // Form state
    const [symbol, setSymbol] = useState('');
    const [type, setType] = useState('stock');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    // Orders & Leaderboard
    const [orders, setOrders] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    // Load data functions
    const loadAccount = async () => {
        setLoading(true);
        try {
            const response = await api.get('/paper-trading/account');
            setAccount(response.data.account);
        } catch (error) {
            console.error('Load account error:', error);
            toast.error('Failed to load account', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const response = await api.get('/paper-trading/orders?limit=10');
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Load orders error:', error);
        }
    };

    const loadLeaderboard = async () => {
        try {
            const response = await api.get('/paper-trading/leaderboard?limit=5');
            setLeaderboard(response.data.leaderboard || []);
        } catch (error) {
            console.error('Load leaderboard error:', error);
        }
    };

    const fetchPrice = async () => {
        if (!symbol) return;
        
        setLoadingPrice(true);
        try {
            const response = await api.get(`/paper-trading/price/${symbol.toUpperCase()}/${type}`);
            setCurrentPrice(response.data.price);
        } catch (error) {
            console.error('Fetch price error:', error);
            setCurrentPrice(null);
        } finally {
            setLoadingPrice(false);
        }
    };

    const handleRefreshPrices = async () => {
        if (refreshingPrices) return;
        
        setRefreshingPrices(true);
        try {
            const response = await api.post('/paper-trading/refresh-prices');
            setAccount(response.data.account);
            toast.success('Prices updated', 'Success');
        } catch (error) {
            console.error('Refresh prices error:', error);
            toast.error('Failed to refresh prices', 'Error');
        } finally {
            setRefreshingPrices(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!symbol || !quantity) {
            toast.warning('Please fill in all fields', 'Missing Fields');
            return;
        }

        if (parseFloat(quantity) <= 0) {
            toast.warning('Quantity must be greater than 0', 'Invalid Quantity');
            return;
        }

        if (!currentPrice) {
            toast.warning('Waiting for price data...', 'Please Wait');
            return;
        }

        setPendingTrade({
            action: activeTab,
            positionType, // ✅ NEW: Include position type
            symbol: symbol.toUpperCase(),
            type,
            quantity: parseFloat(quantity),
            price: currentPrice,
            total: currentPrice * parseFloat(quantity),
            notes
        });
        setShowConfirmation(true);
    };

    const executeTradeSubmit = async () => {
        if (!pendingTrade) return;

        setShowConfirmation(false);
        setSubmitting(true);

        try {
            const endpoint = pendingTrade.action === 'buy' ? '/paper-trading/buy' : '/paper-trading/sell';
            const response = await api.post(endpoint, {
                symbol: pendingTrade.symbol,
                type: pendingTrade.type,
                quantity: pendingTrade.quantity,
                positionType: pendingTrade.positionType, // ✅ NEW: Send position type
                notes: pendingTrade.notes
            });

            setAccount(response.data.account);
            toast.success(response.data.message, 'Success');

            if (pendingTrade.action === 'sell' && response.data.profitLoss) {
                const pl = response.data.profitLoss;
                const plPercent = response.data.profitLossPercent;
                const message = pl >= 0 ?
                    `Profit: $${pl.toFixed(2)} (+${plPercent.toFixed(2)}%)` :
                    `Loss: $${Math.abs(pl).toFixed(2)} (${plPercent.toFixed(2)}%)`;
                toast.info(message, pl >= 0 ? '💰 Nice Trade!' : '📉 Trade Closed');
            }

            setSymbol('');
            setQuantity('');
            setNotes('');
            setCurrentPrice(null);
            setPendingTrade(null);
            loadOrders();

        } catch (error) {
            console.error('Trade error:', error);
            toast.error(error.response?.data?.error || 'Trade failed', 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickSell = (position) => {
        setActiveTab('sell');
        setSymbol(position.symbol);
        setType(position.type);
        setQuantity(position.quantity.toString());
        setPositionType(position.positionType || 'long'); // ✅ Set position type
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const calculateTotal = () => {
        if (!currentPrice || !quantity) return 0;
        return currentPrice * parseFloat(quantity);
    };

    // Effects
    useEffect(() => {
        loadAccount();
        loadOrders();
        loadLeaderboard();

        const priceRefreshInterval = setInterval(() => {
            handleRefreshPrices();
        }, 30000);

        return () => {
            clearInterval(priceRefreshInterval);
        };
    }, []);

    useEffect(() => {
        if (symbol && symbol.length > 0) {
            fetchPrice();
        } else {
            setCurrentPrice(null);
        }
    }, [symbol, type]);

    if (loading) {
        return (
            <PageContainer>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <LoadingSpinner size={64} />
                </div>
            </PageContainer>
        );
    }

    return (
        <>
            {showConfirmation && pendingTrade && (
                <ConfirmationModal onClick={() => setShowConfirmation(false)}>
                    <ConfirmationCard 
                        $variant={pendingTrade.action}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ConfirmationTitle $variant={pendingTrade.action}>
                            {pendingTrade.action === 'buy' ? <Plus size={32} /> : <Minus size={32} />}
                            Confirm {pendingTrade.positionType === 'short' ? 'Short' : pendingTrade.action === 'buy' ? 'Purchase' : 'Sale'}
                        </ConfirmationTitle>

                        <ConfirmationDetails>
                            <DetailRow>
                                <DetailLabelModal>Symbol</DetailLabelModal>
                                <DetailValueModal>{pendingTrade.symbol}</DetailValueModal>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabelModal>Type</DetailLabelModal>
                                <DetailValueModal style={{ textTransform: 'capitalize' }}>{pendingTrade.type}</DetailValueModal>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabelModal>Position Type</DetailLabelModal>
                                <DetailValueModal style={{ 
                                    color: pendingTrade.positionType === 'short' ? '#ef4444' : '#10b981',
                                    textTransform: 'uppercase'
                                }}>
                                    {pendingTrade.positionType}
                                </DetailValueModal>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabelModal>Quantity</DetailLabelModal>
                                <DetailValueModal>{pendingTrade.quantity.toLocaleString()}</DetailValueModal>
                            </DetailRow>
                            <DetailRow>
                                <DetailLabelModal>Price per Share</DetailLabelModal>
                                <DetailValueModal>{formatCurrency(pendingTrade.price)}</DetailValueModal>
                            </DetailRow>
                            <DetailRow style={{ 
                                borderTop: '2px solid rgba(0, 173, 237, 0.3)',
                                paddingTop: '1rem',
                                marginTop: '0.5rem'
                            }}>
                                <DetailLabelModal style={{ fontSize: '1.1rem', color: '#00adef' }}>
                                    Total {pendingTrade.action === 'buy' ? 'Cost' : 'Revenue'}
                                </DetailLabelModal>
                                <DetailValueModal style={{ fontSize: '1.5rem', color: '#00ff88' }}>
                                    {formatCurrency(pendingTrade.total)}
                                </DetailValueModal>
                            </DetailRow>
                        </ConfirmationDetails>

                        {pendingTrade.positionType === 'short' && (
                            <RiskWarning style={{ margin: '1rem 0', animation: 'none' }}>
                                <RiskWarningIcon>
                                    <AlertTriangle size={20} />
                                </RiskWarningIcon>
                                <RiskWarningContent>
                                    <RiskWarningTitle>Short Position Risk</RiskWarningTitle>
                                    <RiskWarningText>
                                        You're betting the price will go down. Losses can exceed your initial investment.
                                    </RiskWarningText>
                                </RiskWarningContent>
                            </RiskWarning>
                        )}

                        {pendingTrade.notes && (
                            <div style={{ 
                                padding: '1rem',
                                background: 'rgba(0, 173, 237, 0.05)',
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Your Notes:
                                </div>
                                <div style={{ color: '#e0e6ed', fontSize: '0.95rem' }}>
                                    {pendingTrade.notes}
                                </div>
                            </div>
                        )}

                        <ConfirmationButtons>
                            <CancelButton onClick={() => setShowConfirmation(false)}>
                                Cancel
                            </CancelButton>
                            <ConfirmButton 
                                $variant={pendingTrade.action}
                                onClick={executeTradeSubmit}
                            >
                                Confirm {pendingTrade.positionType === 'short' ? 'Short' : pendingTrade.action === 'buy' ? 'Buy' : 'Sell'}
                            </ConfirmButton>
                        </ConfirmationButtons>
                    </ConfirmationCard>
                </ConfirmationModal>
            )}

            <PageContainer>
                <Header>
                    <Title>
                        <Trophy size={56} color="#00adef" />
                        Paper Trading
                    </Title>
                    <Subtitle>Practice trading with $100,000 virtual cash - Risk free!</Subtitle>
                    <PoweredBy>
                        <Zap size={18} />
                        Real-Time Market Prices • Long & Short Positions
                        <span style={{
                            marginLeft: '10px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            display: 'inline-block',
                            animation: 'pulse 2s ease-in-out infinite'
                        }} />
                    </PoweredBy>
                </Header>

                <PortfolioOverview>
                    <StatCard $borderColor="rgba(0, 173, 237, 0.5)" $shadowColor="rgba(0, 173, 237, 0.3)">
                        <StatIcon $background="rgba(0, 173, 237, 0.2)">
                            <DollarSign size={32} color="#00adef" />
                        </StatIcon>
                        <StatLabel>Portfolio Value</StatLabel>
                        <StatValue $color="#00adef">
                            {formatCurrency(account?.portfolioValue || 0)}
                        </StatValue>
                        <StatChange $positive={account?.totalProfitLoss >= 0}>
                            {account?.totalProfitLoss >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                            {formatCurrency(Math.abs(account?.totalProfitLoss || 0))}
                        </StatChange>
                    </StatCard>

                    <StatCard $borderColor="rgba(16, 185, 129, 0.5)" $shadowColor="rgba(16, 185, 129, 0.3)" $gradient="linear-gradient(90deg, #10b981, #059669)">
                        <StatIcon $background="rgba(16, 185, 129, 0.2)">
                            <Activity size={32} color="#10b981" />
                        </StatIcon>
                        <StatLabel>Total Return</StatLabel>
                        <StatValue $color={account?.totalProfitLoss >= 0 ? '#10b981' : '#ef4444'}>
                            {formatPercent(account?.totalProfitLossPercent || 0)}
                        </StatValue>
                        <StatChange $positive={account?.totalProfitLoss >= 0}>
                            {account?.winningTrades || 0}W / {account?.losingTrades || 0}L
                        </StatChange>
                    </StatCard>

                    <StatCard $borderColor="rgba(139, 92, 246, 0.5)" $shadowColor="rgba(139, 92, 246, 0.3)" $gradient="linear-gradient(90deg, #8b5cf6, #7c3aed)">
                        <StatIcon $background="rgba(139, 92, 246, 0.2)">
                            <BarChart3 size={32} color="#8b5cf6" />
                        </StatIcon>
                        <StatLabel>Cash Balance</StatLabel>
                        <StatValue $color="#8b5cf6">
                            {formatCurrency(account?.cashBalance || 0)}
                        </StatValue>
                        <StatChange $positive={true}>
                            Available to trade
                        </StatChange>
                    </StatCard>

                    <StatCard $borderColor="rgba(245, 158, 11, 0.5)" $shadowColor="rgba(245, 158, 11, 0.3)" $gradient="linear-gradient(90deg, #f59e0b, #d97706)">
                        <StatIcon $background="rgba(245, 158, 11, 0.2)">
                            <Target size={32} color="#f59e0b" />
                        </StatIcon>
                        <StatLabel>Win Rate</StatLabel>
                        <StatValue $color="#f59e0b">
                            {account?.winRate?.toFixed(1) || 0}%
                        </StatValue>
                        <StatChange $positive={true}>
                            {account?.totalTrades || 0} total trades
                        </StatChange>
                    </StatCard>
                </PortfolioOverview>

                <ContentGrid>
                    <div>
                        <TradingPanel>
                            <PanelTitle>
                                <Send size={24} />
                                Place Order
                            </PanelTitle>

                            {/* ✅ NEW: Position Type Selector */}
                            <PositionTypeSelector>
                                <PositionTypeButton
                                    $active={positionType === 'long'}
                                    $short={false}
                                    onClick={() => setPositionType('long')}
                                >
                                    <PositionTypeLabel>
                                        <TrendingUp size={24} />
                                        LONG
                                    </PositionTypeLabel>
                                    <PositionTypeDesc>
                                        Buy low, sell high
                                    </PositionTypeDesc>
                                </PositionTypeButton>

                                <PositionTypeButton
                                    $active={positionType === 'short'}
                                    $short={true}
                                    onClick={() => setPositionType('short')}
                                >
                                    <PositionTypeLabel>
                                        <TrendingDown size={24} />
                                        SHORT
                                    </PositionTypeLabel>
                                    <PositionTypeDesc>
                                        Sell high, buy low
                                    </PositionTypeDesc>
                                </PositionTypeButton>
                            </PositionTypeSelector>

                            {/* ✅ NEW: Risk Warning for Short Positions */}
                            {positionType === 'short' && (
                                <RiskWarning>
                                    <RiskWarningIcon>
                                        <AlertTriangle size={24} />
                                    </RiskWarningIcon>
                                    <RiskWarningContent>
                                        <RiskWarningTitle>⚠️ High Risk Warning</RiskWarningTitle>
                                        <RiskWarningText>
                                            Short selling has unlimited risk. If the price rises instead of falls, 
                                            your losses can exceed your initial investment. Only experienced traders 
                                            should short sell.
                                        </RiskWarningText>
                                    </RiskWarningContent>
                                </RiskWarning>
                            )}

                            <TabButtons>
                                <TabButton 
                                    $active={activeTab === 'buy'}
                                    onClick={() => setActiveTab('buy')}
                                >
                                    <Plus size={20} />
                                    {positionType === 'short' ? 'Short' : 'Buy'}
                                </TabButton>
                                <TabButton 
                                    $active={activeTab === 'sell'}
                                    onClick={() => setActiveTab('sell')}
                                >
                                    <Minus size={20} />
                                    {positionType === 'short' ? 'Cover' : 'Sell'}
                                </TabButton>
                            </TabButtons>

                            <Form onSubmit={handleSubmit}>
                                <FormGroup>
                                    <Label>
                                        <Search size={16} />
                                        Symbol
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., AAPL, TSLA, BTC"
                                        value={symbol}
                                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <Target size={16} />
                                        Asset Type
                                    </Label>
                                    <Select value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="stock">Stock</option>
                                        <option value="crypto">Cryptocurrency</option>
                                    </Select>
                                </FormGroup>

                                {currentPrice && !loadingPrice && (
                                    <PriceDisplay>
                                        <PriceLabel>Current Price</PriceLabel>
                                        <PriceValue>{formatCurrency(currentPrice)}</PriceValue>
                                    </PriceDisplay>
                                )}

                                {loadingPrice && (
                                    <PriceDisplay>
                                        <PriceLabel>Loading price...</PriceLabel>
                                        <LoadingSpinner size={20} />
                                    </PriceDisplay>
                                )}

                                <FormGroup>
                                    <Label>
                                        <Activity size={16} />
                                        Quantity
                                    </Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="How many shares/coins?"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label>
                                        <MessageCircle size={16} />
                                        Notes (Optional)
                                    </Label>
                                    <TextArea
                                        placeholder={positionType === 'short' ? 
                                            "Why do you think the price will fall?" :
                                            "Why are you making this trade?"
                                        }
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        maxLength={500}
                                    />
                                </FormGroup>

                                {currentPrice && quantity && (
                                    <TotalDisplay>
                                        <TotalLabel>Total {activeTab === 'buy' ? 'Cost' : 'Revenue'}</TotalLabel>
                                        <TotalValue>{formatCurrency(calculateTotal())}</TotalValue>
                                    </TotalDisplay>
                                )}

                                <SubmitButton 
                                    type="submit" 
                                    disabled={submitting || !currentPrice || !quantity}
                                    $variant={activeTab}
                                    $positionType={positionType}
                                >
                                    {submitting ? (
                                        <>
                                            <LoadingSpinner size={20} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {activeTab === 'buy' ? <Plus size={20} /> : <Minus size={20} />}
                                            {positionType === 'short' ? 
                                                (activeTab === 'buy' ? 'Short' : 'Cover Short') :
                                                (activeTab === 'buy' ? 'Buy' : 'Sell')
                                            } {symbol || 'Asset'}
                                        </>
                                    )}
                                </SubmitButton>
                            </Form>
                        </TradingPanel>

                        {account?.positions?.length > 0 && (
                            <PositionsList>
                                <PositionsHeader>
                                    <PositionsTitle>
                                        <PieChart size={20} />
                                        Your Positions ({account.positions.length})
                                    </PositionsTitle>
                                    <RefreshButton 
                                        onClick={handleRefreshPrices}
                                        disabled={refreshingPrices}
                                    >
                                        {refreshingPrices ? <LoadingSpinner size={16} /> : <RefreshCw size={16} />}
                                        Refresh
                                    </RefreshButton>
                                </PositionsHeader>

                                {account.positions.map((position) => (
                                    <PositionCard 
                                        key={position.symbol} 
                                        $positive={position.profitLoss >= 0}
                                        $positionType={position.positionType}
                                    >
                                        {/* ✅ NEW: Position Type Badge */}
                                        <PositionTypeBadge $short={position.positionType === 'short'}>
                                            {position.positionType === 'short' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                            {position.positionType || 'LONG'}
                                        </PositionTypeBadge>

                                        <PositionHeader>
                                            <div>
                                                <PositionSymbol>${position.symbol}</PositionSymbol>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                    {position.type}
                                                </div>
                                            </div>
                                            <PositionPL>
                                                <PLValue $positive={position.profitLoss >= 0}>
                                                    {position.profitLoss >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    {formatCurrency(Math.abs(position.profitLoss))}
                                                </PLValue>
                                                <PLPercent $positive={position.profitLoss >= 0}>
                                                    {formatPercent(position.profitLossPercent)}
                                                </PLPercent>
                                            </PositionPL>
                                        </PositionHeader>

                                        <PositionDetails>
                                            <PositionDetail>
                                                <DetailLabel>Quantity</DetailLabel>
                                                <DetailValue>{position.quantity}</DetailValue>
                                            </PositionDetail>
                                            <PositionDetail>
                                                <DetailLabel>Avg Price</DetailLabel>
                                                <DetailValue>{formatCurrency(position.averagePrice)}</DetailValue>
                                            </PositionDetail>
                                            <PositionDetail>
                                                <DetailLabel>Current Price</DetailLabel>
                                                <DetailValue>{formatCurrency(position.currentPrice)}</DetailValue>
                                            </PositionDetail>
                                        </PositionDetails>

                                        <SellButton 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickSell(position);
                                            }}
                                            $cover={position.positionType === 'short'}
                                        >
                                            {position.positionType === 'short' ? <Plus size={18} /> : <Minus size={18} />}
                                            {position.positionType === 'short' ? 'Cover Short' : 'Sell Position'}
                                        </SellButton>
                                    </PositionCard>
                                ))}
                            </PositionsList>
                        )}

                        {orders.length > 0 && (
                            <OrdersHistory>
                                <PositionsTitle style={{ marginBottom: '1.5rem' }}>
                                    <Clock size={20} />
                                    Recent Orders
                                </PositionsTitle>

                                {orders.map((order) => (
                                    <OrderCard key={order._id}>
                                        <OrderHeader>
                                            <OrderSide $side={order.side}>
                                                {order.side === 'buy' ? <Plus size={16} /> : <Minus size={16} />}
                                                {order.side.toUpperCase()}
                                                {order.positionType === 'short' && ' SHORT'}
                                            </OrderSide>
                                            <OrderTime>
                                                {new Date(order.executedAt).toLocaleString()}
                                            </OrderTime>
                                        </OrderHeader>

                                        <OrderDetails>
                                            <OrderInfo>
                                                <OrderSymbol>${order.symbol}</OrderSymbol>
                                                <OrderQty>× {order.quantity} @ {formatCurrency(order.price)}</OrderQty>
                                            </OrderInfo>
                                            <OrderAmount>
                                                <Amount>{formatCurrency(order.totalAmount)}</Amount>
                                                {order.profitLoss !== 0 && (
                                                    <OrderPL $positive={order.profitLoss > 0}>
                                                        {order.profitLoss > 0 ? '+' : ''}{formatCurrency(order.profitLoss)}
                                                    </OrderPL>
                                                )}
                                            </OrderAmount>
                                        </OrderDetails>
                                    </OrderCard>
                                ))}
                            </OrdersHistory>
                        )}

                        {(!account?.positions || account.positions.length === 0) && orders.length === 0 && (
                            <EmptyState>
                                <EmptyIcon>
                                    <Trophy size={60} color="#00adef" />
                                </EmptyIcon>
                                <EmptyText>
                                    You haven't made any trades yet.<br />
                                    Start trading long or short to build your portfolio!
                                </EmptyText>
                            </EmptyState>
                        )}
                    </div>

                    <Sidebar>
                        <StatsPanel>
                            <PanelTitle>
                                <Award size={20} />
                                Your Stats
                            </PanelTitle>

                            <StatRow>
                                <StatRowLabel>
                                    <Trophy size={16} />
                                    Total Trades
                                </StatRowLabel>
                                <StatRowValue>{account?.totalTrades || 0}</StatRowValue>
                            </StatRow>

                            <StatRow>
                                <StatRowLabel>
                                    <ThumbsUp size={16} />
                                    Winning Trades
                                </StatRowLabel>
                                <StatRowValue $color="#10b981">{account?.winningTrades || 0}</StatRowValue>
                            </StatRow>

                            <StatRow>
                                <StatRowLabel>
                                    <Activity size={16} />
                                    Best Streak
                                </StatRowLabel>
                                <StatRowValue $color="#f59e0b">{Math.abs(account?.bestStreak || 0)}</StatRowValue>
                            </StatRow>

                            <StatRow>
                                <StatRowLabel>
                                    <ArrowUpRight size={16} />
                                    Biggest Win
                                </StatRowLabel>
                                <StatRowValue $color="#10b981">{formatCurrency(account?.biggestWin || 0)}</StatRowValue>
                            </StatRow>

                            {account?.biggestLoss < 0 && (
                                <StatRow>
                                    <StatRowLabel>
                                        <ArrowDownRight size={16} />
                                        Biggest Loss
                                    </StatRowLabel>
                                    <StatRowValue $color="#ef4444">{formatCurrency(account?.biggestLoss || 0)}</StatRowValue>
                                </StatRow>
                            )}

                            <BadgeContainer>
                                {account?.winRate >= 60 && (
                                    <Badge 
                                        $gradient="rgba(16, 185, 129, 0.2)" 
                                        $borderColor="rgba(16, 185, 129, 0.3)" 
                                        $color="#10b981"
                                    >
                                        <Award size={14} />
                                        Hot Streak
                                    </Badge>
                                )}
                                {account?.totalTrades >= 10 && (
                                    <Badge>
                                        <Users size={14} />
                                        Active Trader
                                    </Badge>
                                )}
                                {Math.abs(account?.currentStreak || 0) >= 3 && (
                                    <Badge 
                                        $gradient="rgba(245, 158, 11, 0.2)" 
                                        $borderColor="rgba(245, 158, 11, 0.3)" 
                                        $color="#f59e0b"
                                    >
                                        <Flame size={14} />
                                        On Fire
                                    </Badge>
                                )}
                            </BadgeContainer>
                        </StatsPanel>

                        {leaderboard.length > 0 && (
                            <LeaderboardPreview>
                                <PanelTitle>
                                    <Trophy size={20} />
                                    Top Traders
                                </PanelTitle>

                                {leaderboard.map((trader, index) => (
                                    <LeaderboardItem key={trader.user?._id || index}>
                                        <Rank $rank={trader.rank}>{trader.rank}</Rank>
                                        <TraderInfo>
                                            <TraderName>{trader.user?.name || 'Anonymous'}</TraderName>
                                            <TraderReturn $positive={trader.profitLossPercent >= 0}>
                                                {formatPercent(trader.profitLossPercent)}
                                            </TraderReturn>
                                        </TraderInfo>
                                    </LeaderboardItem>
                                ))}

                                <ViewAllButton onClick={() => window.location.href = '/leaderboard'}>
                                    View Full Leaderboard
                                </ViewAllButton>
                            </LeaderboardPreview>
                        )}
                    </Sidebar>
                </ContentGrid>
            </PageContainer>
        </>
    ); 
};

export default PaperTradingPage;